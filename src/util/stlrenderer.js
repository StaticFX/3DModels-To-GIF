const THREE = require('three');
const fs = require('fs');
const path = require('path');

class STLRenderer {
	#mesh = null;
	#renderer = null;
	#camera = null;

	constructor(stl, gl, width, height, color) {
		this.stl = stl;
		this.scene = new THREE.Scene();
		this.gl = gl;
		this.width = width;
		this.height = height;
		this.loaded = false;
		this.color = color;
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
	
	setSceneBackgroundColor(color) {
		this.scene.background = new THREE.Color(color);
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
			color: this.color,
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

		const padding = 1;

		const box = new THREE.Box3().setFromObject(mesh);
		const center = box.getCenter(new THREE.Vector3());
		const size = box.getSize(new THREE.Vector3());

		const boxDiagonalSq = Math.pow(size.x, 2) + Math.pow(size.y, 2) + Math.pow(size.z, 2) // the room diagonal of the bounding box of the mesh
		const maxDim = Math.sqrt(boxDiagonalSq); //maximum width of the object
		const fov = camera.fov * (Math.PI / 180); //get the cameras fov and convert it into degrees
		let distance = maxDim / (2 * Math.tan(fov / 2)); //devide the maximum width of the object, by the tan of the cameras fov / 2 to get the amount the camera needs to slide out

		distance *= padding;

		const direction = camera.position
			.clone()
			.sub(center)
			.normalize()
			.multiplyScalar(distance);
		camera.position.copy(center).add(direction);

		camera.near = maxDim / 100;
		camera.far = distance * 3;

		this.scene.add(mesh);
		this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
		this.scene.add(new THREE.HemisphereLight(0xffffff, 0.2));

		this.loaded = true;

		this.#mesh = mesh;
		mesh.ref;
	}
}

module.exports = { STLRenderer };
