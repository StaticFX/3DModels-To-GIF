const THREE = require('three');
const { WebGLRenderer } = require('three');
const { Canvas } = require('canvas');
const fs = require('fs');
const path = require('path');

class STLRenderer {
	#mesh = null;
	#renderer = null;
	#camera = null;

	constructor(stl, gl, width, height) {
		this.stl = stl;
		this.scene = new THREE.Scene();
		this.gl = gl;
		this.width = width;
		this.height = height;
		this.loaded = false;
		this.#loadMesh();
	}

	renderImage() {
		this.#renderer.render(this.scene, this.#camera);

		const gl = this.gl;

		const imgData = new Uint8Array(
			gl.drawingBufferWidth * gl.drawingBufferHeight * 4,
		);
		gl.readPixels(
			0,
			0,
			gl.drawingBufferWidth,
			gl.drawingBufferHeight,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			imgData,
		);
		return imgData;
	}

	rotateMeshX(angleDeg) {
		let rad = THREE.MathUtils.degToRad(angleDeg);
		this.#mesh.rotateX(rad);
		this.#mesh.updateMatrix();
	}

	rotateMeshY(angleDeg) {
		let rad = THREE.MathUtils.degToRad(angleDeg);
		this.#mesh.rotateY(rad);
		this.#mesh.updateMatrix();
	}

	rotateMeshZ(angleDeg) {
		let rad = THREE.MathUtils.degToRad(angleDeg);
		this.#mesh.rotateZ(rad);
		this.#mesh.updateMatrix();
	}

	async #loadMesh() {
		const { STLLoader } = await import(
			'three/examples/jsm/loaders/STLLoader.js'
		);

		const canvas = {
			width: this.width,
			height: this.height,
			addEventListener: (event) => {},
			removeEventListener: (event) => {},
		};

		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: false,
			powerPreference: 'high-performance',
			context: this.gl,
		});

		this.#renderer = renderer;

		//renderer.shadowMap.enabled = true;
		//renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default PCFShadowMap

		const camera = new THREE.PerspectiveCamera(
			75,
			this.width / this.height,
			1,
			20000,
		);

		this.#camera = camera;

		camera.position.z = 3;

		const loader = new STLLoader();
		const stlFile = fs.readFileSync(path.join(__dirname, this.stl));
		const stlData = new Uint8Array(stlFile).buffer;
		const geometry = loader.parse(stlData);

		const material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			shininess: 1,
		});

		const mesh = new THREE.Mesh(geometry, material);
		mesh.rotateX(-45); // Rotate correctly

		//center the model and focus the camera
		var middle = new THREE.Vector3();
		geometry.computeBoundingBox();
		geometry.boundingBox.getCenter(middle);
		mesh.geometry.applyMatrix4(
			new THREE.Matrix4().makeTranslation(
				-middle.x,
				-middle.y,
				-middle.z,
			),
		);
		mesh.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI));

		var largestDimension = Math.max(
			geometry.boundingBox.max.x,
			geometry.boundingBox.max.y,
			geometry.boundingBox.max.z,
		);
		camera.position.z = largestDimension * 1.5 * 1.5;

		this.scene.add(mesh);
		this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
		this.scene.add(new THREE.HemisphereLight(0xffffff, 0.2));

		this.loaded = true;

		this.#mesh = mesh;
		mesh.ref;
	}
}

module.exports = { STLRenderer };
