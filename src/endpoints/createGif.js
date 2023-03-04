const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { z } = require('zod');
const { STLToGIFConverter } = require('../STLToGIFConverter');
const { waitUntilTrue } = require('../util/Util');

const createGifRouter = new Router();

const HEX_COLOR_REGEX = /^#[A-F0-9]{6}$/;

const createSchema = z.object({
	transparent: z.boolean().optional().default(true),
	backgroundColor: z
		.number()
		.int()
		.gte(0)
		.lte(0xffffff)
		.optional()
		.default(0x0000000),
	objectColor: z
		.number()
		.int()
		.gte(0)
		.lte(0xffffff)
		.optional()
		.default(0xffffff),
	name: z.string().optional(),
	width: z.number().int().gte(128).lte(2048),
	height: z.number().int().gte(128).lte(2048),
	loop: z.boolean().or(z.number().int().positive()).optional().default(true),
	delay: z.number().int().gte(1),
	anglePerFrame: z.number().positive().lte(360),
});

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
		options.loop =
			options.loop === true
				? 0
				: options.loop === false
				? -1
				: options.loop;
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
