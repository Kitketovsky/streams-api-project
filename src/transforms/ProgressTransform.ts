import { Transform, type TransformCallback } from "node:stream";
import CliProgress from "cli-progress";

export class ProgressTransform extends Transform {
	transferred: number;
	totalSize: number;
	progressBar: CliProgress.SingleBar;

	constructor(totalSize: number) {
		super();

		this.transferred = 0;
		this.totalSize = totalSize;
		this.progressBar = new CliProgress.SingleBar(
			{
				stopOnComplete: true,
				format:
					"{bar} | {percentage}% | {value_formatted}/{total_formatted} | ETA: {eta}s \n",
			},
			CliProgress.Presets.shades_classic,
		);

		this.progressBar.start(totalSize, 0, {
			value_formatted: this.formatBytes(0),
			total_formatted: this.formatBytes(this.totalSize),
		});
	}

	_transform(
		chunk: Buffer,
		_encoding: BufferEncoding,
		callback: TransformCallback,
	) {
		this.transferred += chunk.length;
		this.updateBar(this.transferred);

		this.push(chunk);
		callback();
	}

	updateBar(transferred: number) {
		this.progressBar.update(transferred, {
			value_formatted: this.formatBytes(transferred),
			total_formatted: this.formatBytes(this.totalSize),
		});
	}

	formatBytes(bytes: number) {
		if (bytes < 1024) return `${bytes.toFixed(2)} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
		if (bytes < 1024 * 1024 * 1024)
			return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
		return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
	}
}
