const fs = require('fs').promises;
const THREE = require('three');
/**
 * Wrapper Class to load .stl files into the scene
 */
class STLLoader {
	constructor() {}

	/**
	 * Loads a .stl file from a given filepath
	 * @param {string} filepath as an absolute path
	 * @returns {THREE.Mesh} mesh of the loaded file which can be added to the scene
	 */
	async load(filepath) {
		const { STLLoader } = await import(
			'three/examples/jsm/loaders/STLLoader.js'
		);

		this.stlLoader = new STLLoader();

		const data = await fs.readFile(filepath);
		const stlData = new Uint8Array(data).buffer;
		const geometry = this.stlLoader.parse(stlData);
		const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
		const object = new THREE.Mesh(geometry, material);
		return object;
	}
}

module.exports = { STLLoader };
