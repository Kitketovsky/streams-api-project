import { Transform, type TransformCallback } from "node:stream";

export class LogStatsTransform extends Transform {
  stats: {
    ips: Set<string>;
    routes: Map<string, number>;
    statusCodes: Map<string, number>;
    totalBandwidth: number;
  };

  constructor() {
    super({ objectMode: true });

    this.stats = {
      ips: new Set(),
      routes: new Map(),
      statusCodes: new Map(),
      totalBandwidth: 0,
    };
  }

  _transform(
    {
      ip,
      route,
      statusCode,
      bandwidth,
    }: { ip: string; route: string; statusCode: string; bandwidth: string },
    _: BufferEncoding,
    callback: TransformCallback
  ) {
    this.stats.ips.add(ip);
    this.stats.routes.set(route, (this.stats.routes.get(route) || 0) + 1);
    this.stats.statusCodes.set(
      statusCode,
      (this.stats.statusCodes.get(statusCode) || 0) + 1
    );
    this.stats.totalBandwidth += Number(bandwidth) || 0;

    callback();
  }

  _flush(callback: TransformCallback) {
    this.push(this.stats);
    callback();
  }
}
