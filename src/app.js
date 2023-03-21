require('dotenv').config();
const express = require('express');
const { createGifRouter } = require('./endpoints/createGifEndpoint.js');
const { createTokenRouter } = require('./endpoints/createTokenEndpoint.js');

const app = express();

app.use(express.json());
app.use('/create', createGifRouter);
app.use('/token', createTokenRouter);

app.listen(process.env.PORT, () =>
	console.log(`Listening on port ${process.env.PORT}`),
);
