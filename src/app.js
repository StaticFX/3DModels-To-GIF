require('dotenv').config();
const express = require('express');
const { createDirSync } = require('./util/util.js');
const { createGifRouter } = require('./endpoints/createGifEndpoint.js');
const { createTokenRouter } = require('./endpoints/createTokenEndpoint.js');
const { statusRouter } = require('./endpoints/checkStatusEndpoint.js');
const { errorHandlingMiddleWare } = require('./middleware/errorHandling.js');

console.debug = (...args) => {
	if (process.env.DEBUG === 'true') console.log(...args);
};

createDirSync(process.env.OUTPUT_DIRECTORY, process.env.UPLOAD_DIRECTORY);

const app = express();

app.use(express.json());

app.use('/create', createGifRouter);
app.use('/token', createTokenRouter);
app.use('/check', statusRouter);

app.use(errorHandlingMiddleWare);

app.listen(process.env.PORT, () =>
	console.debug(`Listening on port ${process.env.PORT}`),
);
