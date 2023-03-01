const GIFEncoder = require('gif-encoder-2');
const pngFileStream = require('png-file-stream');
const fs = require('fs');
const fsextra = require('fs-extra');

class GIFConverter {
	constructor(width, heigth) {
		this.gifencoder = new GIFEncoder(width, heigth);
	}

	async convertToGIF(
		outputPath,
		imageDataArray,
		width,
		height,
		delay = 100,
		repeat,
	) {
		console.debug('Convert images into .gif');
		const encoder = new GIFEncoder(width, height);

		encoder.createReadStream().pipe(fs.createWriteStream(outputPath));

		encoder.start();
		encoder.setDelay(delay);
		encoder.setRepeat(repeat);

		for (frame in imageDataArray) {
			encoder.addFrame(frame);
		}

		encoder.finish();

		const fileStream = fs.createWriteStream(outputPath);
		stream.pipe(fileStream);

		return new Promise((resolve, reject) => {
			fileStream.on('finish', () => {
				resolve();
			});
			fileStream.on('error', (error) => {
				reject(error);
			});
		});
	}
}

module.exports = { GIFConverter };
