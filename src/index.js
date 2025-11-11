import fs from "node:fs";
import path from "node:path";
import readline from "readline";

import { Readable } from "node:stream";

import { LogParserTransform } from "./transforms/LogParserTranform.js";
import { LogStatsTransform } from "./transforms/LogStatsTransform.js";
import { LogReportTransform } from "./transforms/LogReportTransform.js";
import { ProgressTransform } from "./transforms/ProgressTransform.js";

function analyzeLogs(logFileName) {
  const logFilePath = path.join(process.cwd(), logFileName);

  if (!fs.existsSync(logFilePath)) {
    throw new Error("No file exists on path '%s'", logFilePath);
  }

  const logFileStat = fs.statSync(logFilePath);

  if (!logFileStat.isFile()) {
    throw new Error("Path '%s' is not empty, but it's not a file", logFilePath);
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(logFilePath, {
      encoding: "utf-8",
    }),
    crlfDelay: Infinity,
  });

  const barTransform = new ProgressTransform(logFileStat.size);

  Readable.from(rl)
    .pipe(barTransform)
    .pipe(new LogParserTransform())
    .pipe(new LogStatsTransform())
    .pipe(new LogReportTransform())
    .on("finish", () => {
      barTransform.updateBar(logFileStat.size);
      barTransform.progressBar.stop();
    });
}

analyzeLogs("./server-logs.log");
