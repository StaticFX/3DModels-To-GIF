require('dotenv').config();
const express = require('express');
const { waitUntilTrue } = require('./util/Util.js');
const { STLToGIFConverter } = require('./STLToGIFConverter.js');
const path = require('path');

const app = express();

app.get('/', function (req, res) {});

app.listen(process.env.PORT, () =>
	console.log(`Listening on port ${process.env.PORT}`),
);

const converter = new STLToGIFConverter(
	path.resolve('./resources/eiffel_tower.stl'),
	'examples/example-eiffel-tower.gif',
	512,
	512,
	0x636363,
);
renderTest();

async function renderTest() {
	await waitUntilTrue(() => converter.getReady());

	const transparent = true;
	const backGroundColor = 0x0;
	const anglePerFrame = 10;

	converter.generateGIF(anglePerFrame, 100, 0, transparent, backGroundColor);
}
