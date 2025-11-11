import { Writable, type TransformCallback } from "node:stream";
import Table from "cli-table3";
import fs from "node:fs";
import type { LogStatsTransform } from "./LogStatsTransform.js";

export class LogReportTransform extends Writable {
  buffer: Buffer[];
  outputPath: string;
  tableConfigForFileOutput: Table.TableConstructorOptions;

  constructor(outputPath = "./output.txt") {
    super({ objectMode: true });

    this.buffer = [];
    this.outputPath = outputPath;

    this.tableConfigForFileOutput = {
      style: {
        head: [],
        border: [],
      },
      chars: {
        top: "-",
        "top-mid": "+",
        "top-left": "+",
        "top-right": "+",
        bottom: "-",
        "bottom-mid": "+",
        "bottom-left": "+",
        "bottom-right": "+",
        left: "|",
        "left-mid": "+",
        mid: "-",
        "mid-mid": "+",
        right: "|",
        "right-mid": "+",
        middle: "|",
      },
    };
  }

  _write(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    this.buffer.push(chunk);
    callback();
  }

  _final(callback: TransformCallback) {
    const stats = this.buffer[
      this.buffer.length - 1
    ] as unknown as LogStatsTransform["stats"];

    const { ipsTable, routesTable, statusCodesTable } =
      this.generateReport(stats);

    fs.writeFileSync(this.outputPath, routesTable.toString());

    callback();
  }

  generateReport(stats: LogStatsTransform["stats"]) {
    const routesTable = new Table({
      head: ["Route", "Number of calls"],
      ...this.tableConfigForFileOutput,
    });

    const sortedRoutes = Array.from(stats.routes.entries()).toSorted(
      (a, b) => b[1] - a[1]
    );

    routesTable.push(...sortedRoutes);

    const ipsTable = new Table({
      head: ["Unique IPs"],
      ...this.tableConfigForFileOutput,
    });

    ipsTable.push(...Array.from(stats.ips.values()).map((v) => [v]));

    const statusCodesTable = new Table({
      head: ["Status Code", "Number of responses"],
      ...this.tableConfigForFileOutput,
    });

    const sortedStatusCodes = Array.from(stats.statusCodes.entries()).toSorted(
      (a, b) => b[1] - a[1]
    );

    statusCodesTable.push(...sortedStatusCodes);

    return { routesTable, statusCodesTable, ipsTable };
  }
}
