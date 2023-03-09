const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { z } = require('zod');
const { createSchema } = require('../schema/create');
const { STLToGIFConverter } = require('../STLToGIFConverter');
const { waitUntilTrue } = require('../util/Util');

const createGifRouter = new Router();

const storage = multer.diskStorage({
	destination: 'resources/',
	filename: (_, file, callback) => {
		const fileType = path.extname(file.originalname);
		callback(null, crypto.randomUUID() + fileType);
	},
});

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

	const filePath = path.resolve(req.file.path);
	const converter = new STLToGIFConverter(
		filePath,
		`examples/${options.name}.gif`,
		options.width,
		options.height,
		options.objectColor,
	);

	await waitUntilTrue(() => converter.getReady());

	converter.generateGIF(
		options.anglePerFrame,
		options.delay,
		options.loop,
		options.transparent,
		options.backgroundColor,
	);

	return res.status(200).send('Creating gif');
});

module.exports = { createGifRouter };
