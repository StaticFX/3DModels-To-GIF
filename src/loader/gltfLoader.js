const THREE = require('three');
const { Loader } = require('./loader');

/**
 * Wrapper Class to load .stl files into the scene
 * @extends Loader
 * @inheritdoc
 */
class GLTFLoader extends Loader {
	/**
	 * GLTF loader
	 */
	#gltfLoader;

	constructor() {
		super();
	}

	/**
	 * Loads a .gltf file from a given buffer
	 * @override
	 * @param {ArrayBuffer} fileBuffer file as a buffer
	 * @param {THREE.Object3D} parent three.js object parent
	 * @param {number} color color to tint the object with
	 * @returns {Promise<undefined>}
	 */
	async load(fileBuffer, parent) {
		if (!this.#gltfLoader) {
			const { GLTFLoader } = await import('node-three-gltf');
			this.#gltfLoader = new GLTFLoader();
		}

		const objects = await this.#gltfLoader.parseAsync(fileBuffer);

		objects.scenes?.forEach((scene) => {
			parent.add(scene);
		});
	}
}

module.exports = { GLTFLoader };
