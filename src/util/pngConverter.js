const PNG = require('pngjs').PNG;
const fs = require('fs');

/**
 * Util class to export an UInt8Array into a PNG
 */
class PNGConverter {
	#gl;

	/**
	 * @param {WebGLRenderingContext} gl
	 */
	constructor(gl) {
		this.#gl = gl;
	}

	/**
	 *
	 * @param {Uint8Array} imageData data to write on the image
	 * @param {string} outPath absolute path to save the png to
	 * @returns {Promise<string>} path where the image is saved to
	 */
	convertToPNG(imageData, outPath) {
		const png = new PNG({
			width: this.#gl.drawingBufferWidth,
			height: this.#gl.drawingBufferHeight,
		});

		for (let y = 0; y < png.height; y++) {
			for (let x = 0; x < png.width; x++) {
				const i = (y * png.width + x) * 4;
				png.data[i] = imageData[i];
				png.data[i + 1] = imageData[i + 1];
				png.data[i + 2] = imageData[i + 2];
				png.data[i + 3] = imageData[i + 3];
			}
		}

		const stream = fs.createWriteStream(outPath, {});

		png.pack().pipe(stream);

		return new Promise((resolve, reject) => {
			stream.on('finish', () => {
				stream.end();
				resolve(outPath);
			});
			stream.on('error', (err) => {
				reject(err);
			});
		});
	}
}

module.exports = { PNGConverter };
