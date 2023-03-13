/**
 * Super class for a loader
 */
class Loader {
	/**
	 * Function will be overwritten by different loaders
	 */
	load() {
		throw new Error('Not implemented');
	}
}

module.exports = { Loader };
