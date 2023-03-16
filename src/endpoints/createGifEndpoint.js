const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { PassThrough } = require('stream');
const { GifCreator } = require('../gifCreator');
const { createSchema } = require('../schema/create');

const createGifRouter = new Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

createGifRouter.post('/gif', upload.single('file'), async (req, res) => {
	let options;
	try {
		const body = JSON.parse(req.body.options);
		options = createSchema.parse(body);
		options.name ??= path.parse(req.file.originalname).name;
	} catch (parsingError) {
		return res.status(400).send(parsingError.issues);
	}

	const gifCreator = new GifCreator(undefined, options.width, options.height);
	try {
		await gifCreator.addFile(
			{ buffer: req.file.buffer.buffer, name: req.file.originalname },
			options.objectColor,
		);
	} catch (err) {
		console.debug(err);
		return res.status(400).send({ error: err.toString() });
	}

	try {
		const stream = new PassThrough();

		res.set('Content-Type', 'image/gif');
		res.set(
			'Content-Disposition',
			`Content-Disposition: attachment; filename="${options.name}.gif"`,
		);
		stream.pipe(res);

		await gifCreator.generateGif({
			angle: options.anglePerFrame,
			axis: 'y',
			dataStream: stream,
			repeat: options.loop,
			background: options.backgroundColor,
			delay: options.delay,
			transparent: options.transparent,
		});
	} catch (err) {
		console.debug(err);
		return res
			.status(500)
			.send({ error: 'Error while generating the gif' });
	}
});

module.exports = { createGifRouter };
