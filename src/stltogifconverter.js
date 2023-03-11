const { PNGConverter } = require('./util/PNGConverter.js');
const { GifConverter } = require('./util/GifConverter.js');
const GL = require('gl');
const path = require('path');
const { Renderer } = require('./util/renderer.js');
const { STLLoader } = require('./loader/stlloader.js');

/**
 * Wrapper class to easily generate a 3D Gif from the given STL.
 *
 * @author Devin Fritz
 */
class STLToGIFConverter {
	/**
	 * Whether the Converter is ready
	 * @type {Boolean}
	 */
	#ready = false;

	/**
	 * @type {PNGConverter}
	 */
	#pngConverter = null;

	/**
	 * @type {Renderer}
	 */
	#renderer = null;

	/**
	 * @type {GifConverter}
	 */
	#gifConverter = null;

	/**
	 * @type {GL}
	 */
	#gl = null;

	/**
	 * @param {String} filePath path of the file (absolute)
	 * @param {String} outPath output path of the finished gif (absolute)
	 * @param {int} width width of the finished gif
	 * @param {int} height height of the finished gif
	 * @param {number} color hex of the color
	 */
	constructor(filePath, outPath, width, height, color) {
		this.filePath = filePath;
		this.outPath = outPath;
		this.width = width;
		this.height = height;
		this.color = color;
		this.#gl = new GL(width, height);
		this.#pngConverter = new PNGConverter(this.#gl);
		this.#renderer = new Renderer(this.#gl, width, height);
		this.#gifConverter = new GifConverter(width, height, outPath);
	}

	/**
	 * @callback ProgressUpdater executed everytime the progress of the process changes
	 * @param {Number} progress percentage in % (0-100)
	 */

	/**
	 * @callback ProgressFinisher executed as soon as the process is finished generating
	 */

	/**
	 * Generates a .gif file from the given parameters
	 *
	 *
	 * @param {int} angle in degrees, rotation per frame of the model
	 * @param {int} delay ms between every frame
	 * @param {int} repeat how often the gif should repeat. -1 for none, 0 for infinite >0 for set repeat
	 * @param {boolean} transparent whether to render the background transparent or not.
	 * @param {Number} bgColor background color of the frames
	 * @param {boolean} saveImages whether to save the generated frames as images
	 * @param {path} imageDirectory where to save the given images
	 * @param {ProgressUpdater} progress
	 * @param {ProgressFinisher} done
	 * @returns promise of the gif generation
	 */
	async generateGIF(
		angle,
		delay,
		repeat,
		transparent = true,
		bgColor = 0x0,
		saveImages = false,
		imageDirectory = path.join(__dirname, 'images'),
		progress = (progress) => {
			console.debug('Generating GIF:', progress, '%');
		},
		done = () => {
			console.debug('Finished generating GIF');
		},
	) {
		await this.#renderer.addObject(
			this.filePath,
			new STLLoader(),
			this.color,
		);

		let pictures = 360 / angle;
		let images = [];

		this.#renderer.setSceneBackgroundColor(bgColor);
		this.#renderer.rotateScene('x', 90);

		for (let i = 0; i < pictures; i++) {
			this.#renderer.rotateScene('y', angle);

			console.debug('Rendering frame', i);
			let image = this.#renderer.renderImage();
			images.push(image);

			if (saveImages) {
				fs.mkdir(imageDirectory, undefined, (err) => {
					console.error(err);
				});
				this.#pngConverter.convertToPNG(`images/frame${i}.png`, image);
			}
		}

		let bg;
		if (transparent) {
			bg = bgColor;
		} else {
			bg = undefined;
		}

		return this.#gifConverter.convertToGif(images, {
			delay,
			repeat,
			cbProgress: progress,
			transparent: bg,
			cbFinish: done,
		});
	}
}

module.exports = { STLToGIFConverter };
