const { Router } = require('express');
const fs = require('fs').promises;
const multer = require('multer');
const path = require('path');
const { createSchema } = require('../schema/create');
const { STLToGIFConverter } = require('../STLToGIFConverter');

const createGifRouter = new Router();

const storage = multer.diskStorage({
	destination: process.env.UPLOAD_DIRECTORY + '/',
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
	const outPath = path.resolve(
		`${process.env.OUTPUT_DIRECTORY}/${options.name}.gif`,
	);

	const converter = new STLToGIFConverter(
		filePath,
		outPath,
		options.width,
		options.height,
		options.objectColor,
	);

	try {
		await converter.generateGIF(
			options.anglePerFrame,
			options.delay,
			options.loop,
			options.transparent,
			options.backgroundColor,
		);

		res.set('Content-Type', 'image/gif');

		await new Promise((resolve, reject) => {
			res.status(200).sendFile(outPath, (err) =>
				err ? reject(err) : resolve(),
			);
		});

		const removeGeneratedFile = fs.unlink(outPath);
		const removeInitialFile = fs.unlink(filePath);
		await Promise.all([removeGeneratedFile, removeInitialFile]);
	} catch (err) {
		console.debug(err);
	}
});

module.exports = { createGifRouter };
