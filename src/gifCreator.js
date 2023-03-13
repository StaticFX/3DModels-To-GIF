const GL = require('gl');
const path = require('path');
const { getLoaderByExtension } = require('./loader/getLoaderByExtension');
const { GifConverter } = require('./util/GifConverter');
const { Renderer } = require('./util/renderer');

class GifCreator {
	#renderer;
	#gifConverter;

	constructor(outPath, width, height) {
		const gl = new GL(width, height);
		this.#renderer = new Renderer(gl, width, height);
		this.#gifConverter = new GifConverter(width, height, outPath);
	}

	/**
	 *
	 * @param {string} filePath absolute path to the file
	 * @param {number} color color to tint the object
	 * @returns
	 */
	addFile(filePath, color) {
		const extension = path.extname(filePath);

		const loader = getLoaderByExtension(extension);

		return this.#renderer.addObject(filePath, loader, color);
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
	 * @typedef {object} generateOptions
	 * @property {number} angle angle on how far the scene gets rotated each frame in degrees
	 * @property {number} angle
	 * @property {Stream} dataStream stream to write the gif to
	 * @property {string} axis axis to rotate the scene around
	 * @property {number} background background color
	 * @property {number} threshold optimizer threshold percentage in the range of 0-100
	 * @property {number} delay delay between the images
	 * @property {number} repeat -1 for none, 0 for infinity, > 0 for fixed value
	 * @property {boolean} transparent whether to render transparent or not, will replace bgColor with transparent
	 * @property {cbError} cbError called on error
	 * @property {cbFinish} cbFinish called on finish
	 * @property {cbProgress} cbProgress called on progress
	 */

	/**
	 *
	 * @param {generateOptions} options options to create your gif
	 * @returns {Promise<string>} path to the saved gif
	 */
	generateGif(options) {
		const pictures = 360 / options.angle;
		const images = [];

		this.#renderer.setSceneBackgroundColor(options.background);

		for (let i = 0; i < pictures; i++) {
			this.#renderer.rotateScene(options.axis, options.angle);
			const image = this.#renderer.renderImage();
			images.push(image);

			console.debug('Rendering frame', i);
		}

		return this.#gifConverter.convertToGif(images, {
			dataStream: options.dataStream,
			threshold: options.threshold,
			delay: options.delay,
			repeat: options.repeat,
			optimizer: options.optimizer,
			transparent: options.transparent ? options.background : undefined,
			cbError: options.cbError,
			cbFinish: options.cbFinish,
			cbProgress: options.cbProgress,
		});
	}
}

module.exports = { GifCreator };
