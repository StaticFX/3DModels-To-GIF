require('dotenv').config();
const express = require('express');
const { STLToGIFConverter } = require('./STLToGIFConverter.js');
const path = require('path');
const { createGifRouter } = require('./endpoints/createGif.js');

const app = express();

app.use(express.json());
app.use('/create', createGifRouter);

app.listen(process.env.PORT, () =>
	console.log(`Listening on port ${process.env.PORT}`),
);

const converter = new STLToGIFConverter(
	path.resolve('./resources/test.stl'),
	'examples/example-eiffel-tower.gif',
	512,
	512,
	0x636363,
);
// renderTest();

async function renderTest() {
	const transparent = true;
	const backGroundColor = 0x1;
	const anglePerFrame = 10;

	await converter.generateGIF(
		anglePerFrame,
		100,
		0,
		transparent,
		backGroundColor,
	);
}
