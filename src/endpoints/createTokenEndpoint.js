const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const { GifCreator } = require('../gifCreator');
const {
	singleFileUploadMiddleWare,
	FILE_FIELD_KEY,
} = require('../middleware/singleFileUpload');
const {
	parameterParsingMiddleWare,
	OPTIONS_FIELD_KEY,
} = require('../middleware/parameterParsing');

const TIME_TILL_DELETION = 1000 * 60 * 60 * 5;

const createTokenRouter = new Router();

createTokenRouter.post(
	'/',
	singleFileUploadMiddleWare,
	parameterParsingMiddleWare,
	async (req, res, next) => {
		const token = crypto.randomUUID();
		const options = req[OPTIONS_FIELD_KEY];

		res.set('Content-Type', 'application/json');
		res.status(200).send({ token });

		const outPath = path.resolve(
			`${process.env.OUTPUT_DIRECTORY}/${token}.gif`,
		);

		const gifCreator = new GifCreator(
			outPath,
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
				options.padding,
			);
		} catch (err) {
			console.debug(
				'Error during adding a object after Token creation:',
				err,
			);
		}

		try {
			gifCreator.generateGif({
				angle: options.anglePerFrame,
				axis: options.cameraRotationAxis,
				repeat: options.loop,
				background: options.backgroundColor,
				delay: options.delay,
				transparent: options.transparent,
				initialRotation: options.initialRotation,
				threshold: options.threshold,
				axisSpace: options.axisSpace,
				text: options.label,
			});
		} catch (err) {
			console.debug(
				'Error during server generating Gif after Token creation:',
				err,
			);
		} finally {
			setTimeout(async () => {
				if (fs.existsSync(outPath)) {
					await fs.promises.unlink(outPath);
				}
			}, TIME_TILL_DELETION);
		}
	},
);

createTokenRouter.get('/:token', async (req, res, next) => {
	const token = req.params?.token;

	if (!token) {
		const error = new Error('No token provided');
		error.statusCode = 400;
		return next(error);
	}

	const filePath = path.resolve(
		`${process.env.OUTPUT_DIRECTORY}/${token}.gif`,
	);

	if (!fs.existsSync(filePath)) {
		const error = new Error('File with given token does not exist');
		error.statusCode = 404;
		return next(error);
	}

	try {
		res.set('Content-Type', 'image/gif');
		res.set(
			'Content-Disposition',
			`Content-Disposition: attachment; filename="${token}.gif"`,
		);
		const fileStream = fs.createReadStream(filePath);

		fileStream.pipe(res);

		fileStream.on('error', (err) => {
			console.debug(`Error while reading file: ${err.message}`, err);
		});

		res.once('close', () => {
			try {
				fs.promises.unlink(filePath);
			} catch (err) {
				console.debug(err);
			}
		});
	} catch (err) {
		console.debug(err);
	}
});

module.exports = { createTokenRouter };
