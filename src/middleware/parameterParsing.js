const e = require('express');
const { createSchema } = require('../schema/create');

const OPTIONS_FIELD_KEY = 'options';

/**
 * Will parse the given options to the correct object and will throw an Error if needed
 * Options will be appended to the request at the given {@link OPTIONS_FIELD_KEY}
 * @param {e.Request} req Request object
 * @param {e.Res} res Response object
 * @param {e.NextFunction} next NextFunction to next middleware
 */
function parameterParsingMiddleWare(req, res, next) {
	if (!req.body[OPTIONS_FIELD_KEY]) {
		const error = new Error('No Parameter provided');
		error.statusCode = 400;
		return next(error);
	}

	let body;
	try {
		body = JSON.parse(req.body[OPTIONS_FIELD_KEY]);
	} catch (err) {
		const error = new Error('Invalid JSON structure');
		error.statusCode = 400;
		error.info = req.body[OPTIONS_FIELD_KEY];
		return next(error);
	}

	try {
		options = createSchema.parse(body);
		options.name ??= path.parse(req.file.originalname).name;

		req[OPTIONS_FIELD_KEY] = options;

		return next();
	} catch (parsingError) {
		const error = new Error('Invalid Parameter provided');
		error.statusCode = 400;
		error.info = parsingError.issues.map((issue) => issue.message);
		return next(error);
	}
}

module.exports = { parameterParsingMiddleWare, OPTIONS_FIELD_KEY };
