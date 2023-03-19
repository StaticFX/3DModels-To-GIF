const { Object3D } = require('three');

/**
 * Superclass for a loader
 */
class Loader {
	/**
	 * Function will be overwritten by different loaders
	 * @param {ArrayBuffer} file file as a buffer
	 * @param {Object3D} parent three.js object parent
	 */
	async load(file, parent) {
		throw new Error('Not implemented');
	}
}

module.exports = { Loader };
