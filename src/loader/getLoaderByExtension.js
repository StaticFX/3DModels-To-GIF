const { STLLoader } = require('./stlloader');
const { ObjLoader } = require('./objLoader');

function getLoaderByExtension(extension) {
	switch (extension) {
		case '.stl':
			return new STLLoader();
		case '.obj':
			return new ObjLoader();
		default:
			throw new Error(`Unsupported file extension: ${extension}`);
	}
}

module.exports = { getLoaderByExtension };
