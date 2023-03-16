const { Loader } = require('./loader');
const THREE = require('three');

/**
 * Wrapper Class to load .obj files into the scene
 * @extends Loader
 */
class ObjLoader extends Loader {
	constructor() {
		super();
	}

	/**
	 * Loads a .obj file from a given filepath
	 */
	async load(fileBuffer, parent) {
		const { OBJLoader } = await import(
			'three/examples/jsm/loaders/OBJLoader.js'
		);
		this.objLoader = new OBJLoader();

		const uint8array = new Uint8Array(fileBuffer);
		const decoder = new TextDecoder('utf8');
		let stringData = decoder.decode(uint8array);

		const objectGroup = this.objLoader.parse(stringData);

		const object = new THREE.Object3D();

		objectGroup.children.forEach((child) => object.add(child));

		return object;
	}
}

module.exports = { ObjLoader };
