class Renderer {
	static BASE_FOV = 75;
	static BASE_NEAR_PLANE = 1;
	static BASE_FAR_PLANE = 10000;

	#gl;
	#scene;
	#camera;
	#renderer;
	#width;

	#height;

	constructor(gl, width, height, options) {
		this.#scene = new THREE.Scene();
		this.#gl = gl;
		this.#width = width;
		this.#height = height;

		const canvas = {
			width: this.#width,
			height: this.#height,
			addEventListener: (event) => {},
			removeEventListener: (event) => {},
		};

		this.#renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: options.antialias || false,
			powerPreference: 'high-performance',
			context: this.#gl,
		});

		this.#camera = new new THREE.PerspectiveCamera(
			Renderer.BASE_FOV,
			this.#width / this.#height,
			Renderer.BASE_NEAR_PLANE,
			Renderer.BASE_FAR_PLANE,
		)();

		this.#scene.add(this.#camera);
	}

	async addObject(filePath, loader, color) {
		const mesh = await loader.load(filePath, this.#scene);

		mesh.material = new THREE.MeshPhongMaterial({
			color: color,
		});

		const geometry = mesh.geometry;

		var middle = new THREE.Vector3();
		geometry.computeBoundingBox();
		geometry.boundingBox.getCenter(middle);
		geometry.applyMatrix4(
			new THREE.Matrix4().makeTranslation(
				-middle.x,
				-middle.y,
				-middle.z,
			),
		);
		// mesh.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI));
		geometry.computeBoundingBox();

		this.#scene.add(mesh);
	}

	renderImage() {
		const imgData = new Uint8Array(
			this.#gl.drawingBufferWidth * this.#gl.drawingBufferHeight * 4,
		);

		this.#gl.readPixels(
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
		this.#scene.background = new THREE.Color(color);
	}

	rotateScene(axis, angleDeg) {
		const rad = THREE.MathUtils.degToRad(angleDeg);

		let axis = new THREE.Vector3(0, 1, 0);
		switch (axis) {
			case 'x':
				axis = new THREE.Vector3(1, 0, 0);
				break;
			case 'y':
				axis = new THREE.Vector3(0, 1, 0);
				break;
			case 'z':
				axis = new THREE.Vector3(0, 0, 1);
				break;
		}

		this.#scene.rotateOnAxis(axis, rad);
		this.#scene.updateMatrix();
	}

	#positionCamera(padding = 1) {
		const box = new THREE.Box3().setFromObject(this.#scene);
		const center = box.getCenter(new THREE.Vector3());
		const size = box.getSize(new THREE.Vector3());

		const boxDiagonalSq =
			Math.pow(size.x, 2) + Math.pow(size.y, 2) + Math.pow(size.z, 2); // the room diagonal of the bounding box of the mesh
		const maxDimension = Math.sqrt(boxDiagonalSq); //maximum width of the object
		const fovDegrees = this.#camera.fov * (Math.PI / 180); //get the cameras fov and convert it into degrees
		let distance = maxDimension / (2 * Math.tan(fovDegrees / 2)); //divide the maximum width of the object, by the tan of the cameras fov / 2 to get the amount the camera needs to slide out

		distance *= padding; //apply padding around it

		const direction = this.#camera.position
			.clone()
			.sub(center)
			.normalize()
			.multiplyScalar(distance);

		this.#camera.position.copy(center).add(direction);

		this.#camera.near = maxDimension / 100;
		this.#camera.far = distance * 3;
	}
}

module.exports = { Renderer };
