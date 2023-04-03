const { Loader } = require('./loader');
const THREE = require('three');

/**
 * Wrapper Class to load .obj files into the scene
 * @extends Loader
 * @inheritdoc
 */
class ObjLoader extends Loader {
	/**
	 * OBJ loader
	 */
	#objLoader;

	/**
	 * function to merge geometries
	 */
	#mergeBufferGeometries;

	constructor() {
		super();
	}

	/**
	 * Loads a .obj file from a given buffer
	 * @override
	 * @param {ArrayBuffer} fileBuffer file as a buffer
	 * @param {THREE.Object3D} parent three.js object parent
	 * @param {number} color color to tint the object with
	 * @returns {Promise<undefined>}
	 */
	async load(fileBuffer, parent, color) {
		if (!this.#objLoader) {
			const { OBJLoader } = await import(
				'three/examples/jsm/loaders/OBJLoader.js'
			);
			this.#objLoader = new OBJLoader();
		}
		if (!this.#mergeBufferGeometries) {
			const { mergeBufferGeometries } = await import(
				'three/examples/jsm/utils/BufferGeometryUtils.js'
			);
			this.#mergeBufferGeometries = mergeBufferGeometries;
		}

		const uint8array = new Uint8Array(fileBuffer);
		const decoder = new TextDecoder('utf8');
		let stringData = decoder.decode(uint8array);

		const objectGroup = this.#objLoader.parse(stringData);

		const meshes = [];

		objectGroup.children.forEach((child) => {
			if (child.isMesh) {
				meshes.push(child);
			}
		});

		const mergedGeometry = this.#mergeBufferGeometries(
			meshes.map((mesh) => mesh.geometry),
		);

		mergedGeometry.computeBoundingBox();
		mergedGeometry.center();

		const material = new THREE.MeshPhongMaterial({ color });
		const mergedMesh = new THREE.Mesh(mergedGeometry, material);
		mergedMesh.position.setScalar(0);

		parent.add(mergedMesh);
	}
}

module.exports = { ObjLoader };
