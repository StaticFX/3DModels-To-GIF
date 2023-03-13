const { STLLoader } = require('./stlloader');
const { ObjLoader } = require('./objLoader');

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

	static getLoaderByExtension(extension) {
		switch (extension) {
			case '.stl':
				return new STLLoader();
			case '.obj':
				return new ObjLoader();
			default:
				throw new Error(`Unsupported file extension: ${extension}`);
		}
	}
}

module.exports = { Loader };
