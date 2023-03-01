require('dotenv').config();
const express = require('express');
const { waitUntilTrue } = require('./util/util.js');
const { STLToGIFConverter } = require('./stltogifconverter.js');

const app = express();

app.get('/', function (req, res) {});

app.listen(process.env.PORT, () =>
	console.log(`Listening on port ${process.env.PORT}`),
);

const converter = new STLToGIFConverter(
	'../infinity.stl',
	'finished.gif',
	512,
	512,
);
renderTest();

async function renderTest() {
	await waitUntilTrue(() => converter.getReady());

	let promise = await converter.generateGIF(10, 100, 0);
	console.log(promise);
}
