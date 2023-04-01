require('dotenv').config();
const express = require('express');
const { createDirSync } = require('./util/util.js');
const { createGifRouter } = require('./endpoints/createGifEndpoint.js');
const { createTokenRouter } = require('./endpoints/createTokenEndpoint.js');
const { statusRouter } = require('./endpoints/checkStatusEndpoint.js');

const { errorHandlingMiddleWare } = require('./middleware/errorHandling.js');
const helmet = require('helmet');
const process = require('process');

console.debug = (...args) => {
	if (process.env.DEBUG?.toUpperCase() === 'TRUE') console.log(...args);
};

createDirSync(process.env.OUTPUT_DIRECTORY, process.env.UPLOAD_DIRECTORY);

process.on('SIGINT', () => {
	console.info('Interrupted');
	process.exit(0);
});

const version = '1.0.1';

console.log('Starting 3DModels-To-Gif Generator Version: ', version);

const app = express();

app.use(express.json());
app.use(helmet());

var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
	windowMs: 1 * 60 * 1000,
	max: 20,
});

app.use(limiter);

app.get('/', (req, res) => {
	res.status(200).send('STL-To-Gif Generator Version: ', version);
});

app.use('/create', createGifRouter);
app.use('/token', createTokenRouter);
app.use('/check', statusRouter);

app.use(errorHandlingMiddleWare);

app.listen(process.env.PORT, () =>
	console.debug(`Listening on port ${process.env.PORT}`),
);
