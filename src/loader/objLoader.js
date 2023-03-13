const { Loader } = require('./loader');

const fs = require('fs').promises;
/**
 * Wrapper Class to load .obj files into the scene
 */
class ObjLoader extends Loader {
	constructor() {}

	/**
	 * Loads a .obj file from a given filepath
	 * @param {string} filepath as an absolute path
	 * @returns {THREE.Group} group of loaded objects which can be added to the scene
	 */
	async load(filepath) {
		const { OBJLoader } = await import(
			'three/examples/jsm/loaders/OBJLoader.js'
		);
		this.objLoader = new OBJLoader();

		const data = await fs.readFile(filepath, 'utf8');

		const objects = this.objLoader.parse(data);

		return objects;
	}
}

module.exports = { ObjLoader };
