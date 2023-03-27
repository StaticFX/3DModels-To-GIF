require('dotenv').config();
const express = require('express');
const { createGifRouter } = require('./endpoints/createGifEndpoint.js');
const { createTokenRouter } = require('./endpoints/createTokenEndpoint.js');
const { statusRouter } = require('./endpoints/checkStatusEndpoint.js');
const helmet = require("helmet");


const app = express();

app.use(express.json());
app.use(helmet());

var RateLimit = require("express-rate-limit");
var limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});
app.use(limiter);

app.use('/create', createGifRouter);
app.use('/token', createTokenRouter);
app.use('/check', statusRouter);

app.listen(3000, () =>
	console.log(`Listening on port 3000`),
);
