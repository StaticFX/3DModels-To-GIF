require('dotenv').config();
const express = require('express');
const path = require('path');
const { createGifRouter } = require('./endpoints/createGif.js');

const app = express();

app.use(express.json());
app.use('/create', createGifRouter);

app.listen(process.env.PORT, () =>
	console.log(`Listening on port ${process.env.PORT}`),
);
