import { Transform, type TransformCallback } from "node:stream";

export class LogParserTransform extends Transform {
  regex = new RegExp(
    /^(\S+) - - \[([^\]]+)\] "(\w+) (\S+) HTTP\/[\d.]+" (\d{3}) (\d+) "([^"]*)" "([^"]*)" (\d+)ms$/
  );

  constructor() {
    super({ objectMode: true });
  }

  _transform(
    line: string,
    encoding: BufferEncoding,
    callback: TransformCallback
  ) {
    if (!line) {
      throw new Error("No 'line' has been provided");
    }

    const match = this.regex.exec(line);

    if (!match) {
      throw new Error(`Could not parse line: '${line}'`);
    }

    const [
      _,
      ip,
      datetime,
      method,
      route,
      statusCode,
      bandwidth,
      referrer,
      userAgent,
      responseTime,
    ] = match;

    const logInfo = {
      ip,
      datetime,
      method,
      route,
      statusCode,
      bandwidth,
      referrer,
      userAgent,
      responseTime,
    };

    this.push(logInfo);
    callback();
  }
}
