const { STLLoader } = require('./stlloader');
const { ObjLoader } = require('./objLoader');
const { GLTFLoader } = require('./gltfLoader');

const stlLoader = new STLLoader();
const objLoader = new ObjLoader();
const gltfLoader = new GLTFLoader();

function getLoaderByExtension(extension) {
	switch (extension) {
		case '.stl':
			return stlLoader;
		case '.obj':
			return objLoader;
		case '.glb':
		case '.gltf':
			return gltfLoader;
		default:
			throw new Error(`Unsupported file extension: ${extension}`);
	}
}

module.exports = { getLoaderByExtension };
