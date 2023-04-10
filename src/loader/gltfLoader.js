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
	async load(fileBuffer, parent, color) {
		if (!this.#gltfLoader) {
			const { GLTFLoader, DRACOLoader } = await import('node-three-gltf');
			this.#gltfLoader = new GLTFLoader();
			this.#gltfLoader.setDRACOLoader(new DRACOLoader());
		}

		const gltf = await this.#gltfLoader.parseAsync(fileBuffer);

		const box = new THREE.Box3().setFromObject(gltf.scene);
		const center = box.getCenter(new THREE.Vector3());
		gltf.scene.position.sub(center);

		const material = new THREE.MeshPhongMaterial({ color });
		gltf.scene.children.forEach((object) => {
			if (object.isMesh) {
				object.material = material;
			}
			this.#traverse(object, (object) => {
				if (object.isMesh) {
					object.material = material;
				}
			});
		});

		parent.add(gltf.scene);
	}

	/**
	 * @callback TraverseCallback
	 * @param {THREE.Object3D} child current child
	 */

	/**
	 * loop over each child, including nested ones, and execute a callback
	 * @param {THREE.Object3D} object parent object
	 * @param {TraverseCallback} callback callback to execute on each child
	 */
	#traverse(object, callback) {
		callback(object);
		object.children.forEach((child) => this.#traverse(child, callback));
	}
}

module.exports = { GLTFLoader };
