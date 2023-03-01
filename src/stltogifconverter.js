const { PNGConverter } = require('./util/pngconverter.js');
const { STLRenderer } = require('./util/stlrenderer.js');
const { GIFConverter } = require('./util/gifconverter.js');
const { waitUntilTrue } = require('./util/util.js');
const GL = require('gl');
const path = require('path');

class STLToGIFConverter {
	#ready = false;
	#pngConverter = null;
	#stlRenderer = null;
	#gifConverter = null;
	#gl = null;

	constructor(stl, out, width, height) {
		this.stl = stl;
		this.out = out;
		this.width = width;
		this.height = height;
		this.#gl = new GL(width, height);
		this.#pngConverter = new PNGConverter(this.#gl);
		this.#stlRenderer = new STLRenderer(stl, this.#gl, width, height);
		this.#gifConverter = new GIFConverter(width, height);
		this.#setup();
	}

	async #setup() {
		await waitUntilTrue(() => this.#stlRenderer.loaded);
		this.#ready = true;
	}

	async generateGIF(
		angle,
		delay,
		repeat,
		saveImages = false,
		imageDirectory = path.join(__dirname, 'images'),
	) {
		if (!this.#ready) throw new Error('Converter not ready yet!');

		let pictures = 360 / angle;
		let images = [];

		for (let i = 0; i < pictures; i++) {
			this.#stlRenderer.rotateMeshZ(angle);

			console.debug('rendering frame ' + i);
			let image = this.#stlRenderer.renderImage();
			images.push(image);

			if (saveImages) {
				fs.mkdir(imageDirectory, undefined, (err) => {
					console.error(err);
				});
				this.#pngConverter.convertToPNG(`images/frame${i}.png`, image);
			}
		}

		return this.#gifConverter.convertToGIF(
			this.out,
			images,
			this.width,
			this.height,
			delay,
			repeat,
		);
	}

	getReady() {
		return this.#ready;
	}
}

module.exports = { STLToGIFConverter };
