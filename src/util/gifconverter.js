const GIFEncoder = require('gif-encoder-2');
const pngFileStream = require('png-file-stream');
const fs = require('fs');
const fsextra = require('fs-extra');

/**
 * Uitl Class to convert imageData into a gif file
 */
class GIFConverter {
	/**
	 * @param {int} width
	 * @param {int} heigth
	 */
	constructor(width, heigth) {
		this.gifencoder = new GIFEncoder(width, heigth);
		this.width = width;
		this.height = heigth;
	}

	/**
	 * @callback ProgressUpdater executed everytime the progress of the process changes
	 * @param {Number} progress percentage in % (0-100)
	 */

	/**
	 * @callback ProgressFinisher executed as soon as the process is finished generating
	 */

	/**
	 * Converts the given parameters into a gif
	 *
	 * If the stream parameter is supplied, it will instead of outputting a file directly write to the provided stream.
	 *
	 * @param {string} outputPath of the gif
	 * @param {Uint8Array[]} imageDataArray imageDataArray containing all frames for the gif
	 * @param {int} delay in between each frame in ms
	 * @param {int} repeat -1 for none, 0 for infinity >0 for fixxed value
	 * @param {ProgressUpdater} progress
	 * @param {ProgressFinisher} done
	 * @param {Number} renderTransparent color to display transparent
	 * @param {dataStream} dataStream if supplied it will write the gif to this stream
	 * @returns promise resolved when the gif is finished
	 */
	async convertToGIF(
		outputPath,
		imageDataArray,
		delay = 100,
		repeat,
		progress = (progress) => {},
		done = () => {},
		renderTransparent = undefined,
		dataStream = undefined,
	) {
		console.debug('Converting images into .gif');
		const encoder = new GIFEncoder(
			this.width,
			this.height,
			undefined,
			undefined,
			imageDataArray.length,
		);

		let stream;

		if (dataStream != undefined) {
			encoder.pipe(dataStream);
			stream = dataStream;
		} else {
			const fileStream = fs.createWriteStream(outputPath);
			encoder.createReadStream().pipe(fileStream);
			stream = fileStream;
		}

		encoder.start();
		encoder.setDelay(delay);
		encoder.setRepeat(repeat);
		encoder.useOptimizer = true;
		encoder.setThreshold(0);
		if (renderTransparent != undefined)
			encoder.setTransparent(renderTransparent);

		encoder.on('progress', (percent) => {
			progress(percent);
		});

		for (const frame of imageDataArray) {
			encoder.addFrame(frame);
		}

		encoder.finish();

		return new Promise((resolve, reject) => {
			stream.on('finish', () => {
				done();
				resolve('Done');
			});
			stream.on('error', (error) => {
				reject(error);
			});
		});
	}
}

module.exports = { GIFConverter };
