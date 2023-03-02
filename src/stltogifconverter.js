const { PNGConverter } = require('./util/PNGConverter.js');
const { STLRenderer } = require('./util/STLRenderer.js');
const { GIFConverter } = require('./util/GIFConverter.js');
const { waitUntilTrue } = require('./util/Util.js');
const GL = require('gl');
const path = require('path');

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
	 * @type {STLRenderer}
	 */
	#stlRenderer = null;

	/**
	 * @type {GIFConverter}
	 */
	#gifConverter = null;

	/**
	 * @type {GL}
	 */
	#gl = null;

	/**
	 * @param {String} stl path of the stl
	 * @param {String} out output path of the finished gif
	 * @param {int} width width of the finished gif
	 * @param {int} height height of the finished gif
	 * @param {number} color hex of the color
	 */
	constructor(stl, out, width, height, color) {
		this.stl = stl;
		this.out = out;
		this.width = width;
		this.height = height;
		this.#gl = new GL(width, height);
		this.#pngConverter = new PNGConverter(this.#gl);
		this.#stlRenderer = new STLRenderer(
			stl,
			this.#gl,
			width,
			height,
			color,
		);
		this.#gifConverter = new GIFConverter(width, height);
		this.#setup();
	}

	async #setup() {
		await waitUntilTrue(() => this.#stlRenderer.loaded);
		this.#ready = true;
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
		if (!this.#ready) throw new Error('Converter not ready yet!');

		let pictures = 360 / angle;
		let images = [];

		this.#stlRenderer.setSceneBackgroundColor(bgColor);

		for (let i = 0; i < pictures; i++) {
			this.#stlRenderer.rotateMeshZ(angle);

			console.debug('Rendering frame', i);
			let image = this.#stlRenderer.renderImage();
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

		return this.#gifConverter.convertToGIF(
			this.out,
			images,
			delay,
			repeat,
			progress,
			done,
			bg,
		);
	}

	/**
	 * The converter needs to load in the model of the .stl file and needs a bit of time to be ready.
	 * @returns whether the converter is ready yet or not
	 * @see waitUntilTrue
	 */
	getReady() {
		return this.#ready;
	}
}

module.exports = { STLToGIFConverter };
