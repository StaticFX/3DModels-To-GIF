const PNG = require('pngjs').PNG;
const fs = require('fs');

class PNGConverter {
	constructor(gl) {
		this.gl = gl;
	}

	convertToPNG(outputPath, imageData) {
		const gl = this.gl;
		const png = new PNG({
			width: gl.drawingBufferWidth,
			height: gl.drawingBufferHeight,
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

		png.pack().pipe(fs.createWriteStream(outputPath));

		return new Promise((resolve, reject) => {
			png.pack().pipe(writeStream);
			writeStream.on('finish', () => {
				resolve();
			});
			writeStream.on('error', (err) => {
				reject(err);
			});
		});
	}
}

module.exports = { PNGConverter };
