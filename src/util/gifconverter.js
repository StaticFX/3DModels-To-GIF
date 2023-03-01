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
		const encoder = new GIFEncoder(
			width,
			height,
			undefined,
			undefined,
			imageDataArray.length,
		);

		const fileStream = fs.createWriteStream(outputPath);
		encoder.createReadStream().pipe(fileStream);

		encoder.start();
		encoder.setDelay(delay);
		encoder.setRepeat(repeat);
		encoder.useOptimizer = true;
		encoder.setThreshold(0);
		encoder.setTransparent(0x000000);

		encoder.on('progress', (percent) => {
			console.debug('Generating gif >> ' + percent + '%');
		});

		for (const frame of imageDataArray) {
			encoder.addFrame(frame);
		}

		encoder.finish();

		return new Promise((resolve, reject) => {
			fileStream.on('finish', () => {
				resolve('Done');
			});
			fileStream.on('error', (error) => {
				reject(error);
			});
		});
	}
}

module.exports = { GIFConverter };
