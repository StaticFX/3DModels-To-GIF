const THREE = require('three');
const { Loader } = require('./loader');

/**
 * Wrapper Class to load .stl files into the scene
 *  * @extends Loader
 */
class STLLoader extends Loader {
	constructor() {
		super();
	}

	/**
	 * Loads a .stl file from a given filepath
	 */
	async load(fileBuffer, parent) {
		const { STLLoader } = await import(
			'three/examples/jsm/loaders/STLLoader.js'
		);
		this.stlLoader = new STLLoader();
		const geometry = this.stlLoader.parse(fileBuffer);
		const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
		const object = new THREE.Mesh(geometry, material);
		return object;
	}
}

module.exports = { STLLoader };
