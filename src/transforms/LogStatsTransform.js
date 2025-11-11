import { Transform } from "node:stream";

export class LogStatsTransform extends Transform {
  constructor() {
    super({ objectMode: true });

    this.stats = {
      ips: new Set(),
      routes: new Map(),
      statusCodes: new Map(),
      totalBandwidth: 0,
    };
  }

  _transform({ ip, route, statusCode, bandwidth }, _, callback) {
    this.stats.ips.add(ip);
    this.stats.routes.set(route, (this.stats.routes.get(route) || 0) + 1);
    this.stats.statusCodes.set(
      statusCode,
      (this.stats.statusCodes.get(statusCode) || 0) + 1
    );
    this.stats.totalBandwidth += Number(bandwidth) || 0;

    callback();
  }

  _flush(callback) {
    this.push(this.stats);
    callback();
  }
}
