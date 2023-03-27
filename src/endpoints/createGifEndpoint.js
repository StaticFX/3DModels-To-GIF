const { Router } = require('express');
const { GifCreator } = require('../gifCreator');
const {
	parameterParsingMiddleWare,
	OPTIONS_FIELD_KEY,
} = require('../middleware/parameterParsing');
const {
	singleFileUploadMiddleWare,
	FILE_FIELD_KEY,
} = require('../middleware/singleFileUpload');

const createGifRouter = new Router();

createGifRouter.post(
	'/gif',
	singleFileUploadMiddleWare,
	parameterParsingMiddleWare,
	async (req, res, next) => {
		const options = req[OPTIONS_FIELD_KEY];

		const gifCreator = new GifCreator(
			undefined,
			options.width,
			options.height,
		);

		try {
			await gifCreator.addFile(
				{
					buffer: req[FILE_FIELD_KEY].buffer.buffer,
					name: req[FILE_FIELD_KEY].originalname,
				},
				options.objectColor,
			);
		} catch (err) {
			err.statusCode = 400;
			return next(err);
		}

		try {
			res.set('Content-Type', 'image/gif');
			res.set(
				'Content-Disposition',
				`Content-Disposition: attachment; filename="${options.name}.gif"`,
			);

			gifCreator.generateGif({
				angle: options.anglePerFrame,
				axis: options.cameraRotationAxis,
				dataStream: res,
				repeat: options.loop,
				background: options.backgroundColor,
				delay: options.delay,
				transparent: options.transparent,
				initialRotation: options.initialRotation,
				threshold: options.threshold,
				axisSpace: options.axisSpace,
			});
		} catch (err) {
			err.statusCode = 500;
			return next(err);
		}
	},
);

module.exports = { createGifRouter };
