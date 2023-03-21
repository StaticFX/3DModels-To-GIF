const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GifCreator } = require('../gifCreator');
const { createSchema } = require('../schema/create');

const TIME_TILL_DELETION = 1000 * 60 * 60 * 5;

const createTokenRouter = new Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

createTokenRouter.post('/create', upload.single('file'), async (req, res) => {
	let options;
	try {
		const body = JSON.parse(req.body.options);
		options = createSchema.parse(body);
		options.name ??= path.parse(req.file.originalname).name;
	} catch (parsingError) {
		return res.status(400).send(parsingError.issues);
	}

	const token = crypto.randomUUID();

	res.set('Content-Type', 'application/json');
	res.status(200).send({ token });

	const outPath = path.resolve(
		`${process.env.OUTPUT_DIRECTORY}/${token}.gif`,
	);

	const gifCreator = new GifCreator(outPath, options.width, options.height);
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
		gifCreator.generateGif({
			angle: options.anglePerFrame,
			axis: 'y',
			repeat: options.loop,
			background: options.backgroundColor,
			delay: options.delay,
			transparent: options.transparent,
		});
	} catch (err) {
		console.debug(err);
	} finally {
		setTimeout(async () => {
			if (fs.existsSync(outPath)) {
				await fs.promises.unlink(outPath);
			}
		}, TIME_TILL_DELETION);
	}
});

createTokenRouter.get('/:token', async (req, res) => {
	const token = req.params.token;

	if (!token) {
		return res.status(400).send({ error: 'No token provided' });
	}

	const filePath = path.resolve(
		`${process.env.OUTPUT_DIRECTORY}/${token}.gif`,
	);

	if (!fs.existsSync(filePath)) {
		return res
			.status(404)
			.send({ error: 'File with given token does not exist' });
	}

	res.set('Content-Type', 'image/gif');
	res.set(
		'Content-Disposition',
		`Content-Disposition: attachment; filename="${token}.gif"`,
	);

	fs.createReadStream(filePath).pipe(res);

	res.on('finish', () => {
		try {
			fs.promises.unlink(filePath);
		} catch (err) {
			console.debug(err);
		}
	});
});

module.exports = { createTokenRouter };
