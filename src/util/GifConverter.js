const { createCanvas, ImageData } = require('canvas');
const fs = require('fs');
const GIFEncoder = require('gif-encoder-2');

/**
 * Util class to convert an imageData Array into a gif file
 */
class GifConverter {
	static BASE_DELAY = 100;
	static BASE_REPEAT = 0;
	static BASE_TRANSPARENT = undefined;
	static BASE_USE_OPTIMIZER = true;
	static BASE_THRESHOLD = 0;
	static BASE_TEXT_Y_PADDING = 30;
	static BASE_TEXT_SIZE = 0.05;

	#width;
	#height;
	#outPath;

	/**
	 *
	 * @param {number} width of the gif
	 * @param {number} height of the gif
	 * @param {string} outPath absolute path
	 */
	constructor(width, height, outPath) {
		this.#width = width;
		this.#height = height;
		this.#outPath = outPath;
	}

	/**
	 * called every time the encoder makes progress
	 * @callback cbProgress
	 * @param {number} percentage percentage of how far the encoder is
	 * @returns {undefined}
	 */

	/**
	 * called when the file is saved
	 * @callback cbFinish
	 * @param {string} outPath path where the file is saved if saved
	 * @returns {undefined}
	 */

	/**
	 * called when there is a error during saving
	 * @callback cbError
	 * @param {any} err error that ocurred
	 * @returns {undefined}
	 */

	/**
	 * @typedef {Object} GifOptions encoder options
	 * @property {number} [options.delay] delay between the images
	 * @property {number} [options.repeat] -1 for none, 0 for infinity, > 0 for fixed value
	 * @property {number} [options.transparent] color to replace with transparent pixels
	 * @property {boolean} [options.optimizer] whether to use the optimizer or not
	 * @property {number} [options.backgroundColor] background color to make transparent
	 * @property {number} [options.threshold] Optimizer threshold percentage in the range of 0-100
	 * @property {string} [options.text] text to write to the gif as a label
	 * @property {Stream} [options.dataStream] if supplied it will write the gif to this stream
	 * @property {cbProgress} [options.cbProgress] called on progress
	 * @property {cbFinish} [options.cbFinish] called on finish
	 * @property {cbError} [options.cbError] called on error
	 */

	/**
	 * Converts the given images into a gif
	 * writes the file into a stream if provided in @see options.dataStream, otherwise writes it into outPath
	 *
	 * @param {Array<Uint8Array>} imagesData
	 * @param {GifOptions} options
	 * @returns {Promise<string>} outPath of the file
	 */
	async convertToGif(imagesData, options) {
		const encoder = new GIFEncoder(
			this.#width,
			this.#height,
			undefined,
			undefined,
			imagesData.length,
		);

		const canvas = createCanvas(this.#width, this.#height);
		const ctx = canvas.getContext('2d');

		//choose the stream
		const stream =
			options.dataStream ?? fs.createWriteStream(this.#outPath);

		encoder.createReadStream().pipe(stream);

		//set options
		encoder.useOptimizer =
			options.optimizer ?? GifConverter.BASE_USE_OPTIMIZER;
		encoder.setDelay(options.delay ?? GifConverter.BASE_DELAY);
		encoder.setRepeat(options.repeat ?? GifConverter.BASE_REPEAT);
		if (options.transparent) {
			encoder.setTransparent(options.backgroundColor);
		}

		encoder.setThreshold(options.threshold ?? GifConverter.BASE_THRESHOLD);
		encoder.on(
			'progress',
			options.cbProgress ||
				((percentage) => {
					console.debug('Building gif: ', percentage, '%');
				}),
		);

		encoder.start();

		const fontSize = Math.floor(canvas.width * GifConverter.BASE_TEXT_SIZE);
		ctx.font = `${fontSize}px Sans`;
		ctx.fillStyle = `#ffffff`;

		const textWidth = ctx.measureText(options.text).width;
		const x = canvas.width / 2 - textWidth / 2;
		const y = GifConverter.BASE_TEXT_Y_PADDING + fontSize / 2;

		for (const frame of imagesData) {
			if (options.text && typeof options.text === 'string') {
				const imageData = new ImageData(
					new Uint8ClampedArray(frame),
					this.#width,
					this.#height,
				);
				ctx.putImageData(imageData, 0, 0);
				ctx.fillText(options.text, x, y);

				encoder.addFrame(ctx);
			} else {
				encoder.addFrame(frame);
			}
		}

		encoder.finish();

		return new Promise((resolve, reject) => {
			stream.on('finish', () => {
				options.cbFinish?.(this.#outPath);
				resolve(this.#outPath);
			});
			stream.on('error', (err) => {
				options.cbError?.(err);
				reject(err);
			});
		});
	}
}

module.exports = { GifConverter };
