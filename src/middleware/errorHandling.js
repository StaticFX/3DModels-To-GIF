const e = require('express');

const DEFAULT_ERROR_STATUS = 500;

/**
 * @typedef {object} ExtendedError
 * @property {number} statusCode statuscode to send to the client
 * @property {object} [info] additional info which should be sent to the client
 */

/**
 * Middleware to handle errors
 * @param {ExtendedError & Error} err earlier threw error object
 * @param {e.Request} req Request object
 * @param {e.Response} res Response object
 * @param {e.NextFunction} next NextFunction to next middleware
 */
function errorHandlingMiddleWare(err, req, res, next) {
	if (err) {
		console.debug(err);
		res.status(err.statusCode ?? DEFAULT_ERROR_STATUS).json({
			reason: err.message,
			info: err.info,
		});
	} else {
		next();
	}
}

module.exports = {
	errorHandlingMiddleWare,
};
