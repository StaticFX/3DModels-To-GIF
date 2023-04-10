/**
 * Superclass for a loader
 */
class Loader {
	/**
	 * Function will be overwritten by different loaders
	 * @param {ArrayBuffer} fileBuffer file as a buffer
	 * @param {THREE.Object3D} parent three.js object parent
	 * @param {number} color color to tint the object with
	 * @returns {Promise<undefined>}
	 */
	async load(fileBuffer, parent, color) {
		throw new Error('Not implemented');
	}
}

module.exports = { Loader };
