const THREE = require('three');
const { Loader } = require('./loader');

/**
 * Wrapper Class to load .stl files into the scene
 * @extends Loader
 * @inheritdoc
 */
class STLLoader extends Loader {
	/**
	 * STL loader
	 */
	#stlLoader;

	constructor() {
		super();
	}

	/**
	 * Loads a .stl file from a given buffer
	 * @override
	 * @param {ArrayBuffer} fileBuffer file as a buffer
	 * @param {THREE.Object3D} parent three.js object parent
	 * @param {number} color color to tint the object with
	 * @returns {Promise<undefined>}
	 */
	async load(fileBuffer, parent, color) {
		if (!this.#stlLoader) {
			const { STLLoader } = await import(
				'three/examples/jsm/loaders/STLLoader.js'
			);
			this.#stlLoader = new STLLoader();
		}

		const geometry = this.#stlLoader.parse(fileBuffer);
		geometry.computeBoundingBox();
		geometry.center();

		const material = new THREE.MeshPhongMaterial({ color });
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.setScalar(0);

		parent.add(mesh);
	}
}

module.exports = { STLLoader };
