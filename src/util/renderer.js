const THREE = require('three');

class Renderer {
	static BASE_FOV = 75;
	static BASE_NEAR_PLANE = 0.1;
	static BASE_FAR_PLANE = 1000;

	#gl;
	#scene;
	#camera;
	#renderer;
	#width;
	#parent;

	#height;

	constructor(gl, width, height, options = {}) {
		this.#scene = new THREE.Scene();
		this.#parent = new THREE.Object3D();
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
			antialias: options.antialias,
			powerPreference: 'high-performance',
			context: this.#gl,
		});

		this.#camera = new THREE.PerspectiveCamera(
			Renderer.BASE_FOV,
			this.#width / this.#height,
			Renderer.BASE_NEAR_PLANE,
			Renderer.BASE_FAR_PLANE,
		);
		this.#camera.lookAt(this.#parent.position);

		this.#camera.position.z = 20;

		this.#scene.add(new THREE.AmbientLight(0xffffff, 0.4));
		this.#scene.add(new THREE.HemisphereLight(0xffffff, 0.2));

		this.#scene.add(this.#parent);
		this.#scene.add(this.#camera);
	}

	async addObject(filePath, loader, color) {
		const mesh = await loader.load(filePath, this.#parent);

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

		this.#parent.add(mesh);
		this.#positionCamera();
	}

	renderImage() {
		this.#renderer.render(this.#scene, this.#camera);

		const imgData = new Uint8Array(
			this.#gl.drawingBufferWidth * this.#gl.drawingBufferHeight * 4,
		);

		this.#gl.readPixels(
			0,
			0,
			this.#gl.drawingBufferWidth,
			this.#gl.drawingBufferHeight,
			this.#gl.RGBA,
			this.#gl.UNSIGNED_BYTE,
			imgData,
		);

		return imgData;
	}

	setSceneBackgroundColor(color) {
		this.#scene.background = new THREE.Color(color);
	}

	rotateScene(axis, angleDeg) {
		const rad = THREE.MathUtils.degToRad(angleDeg);

		const axisVector = this.#getAxisByName(axis);
		this.#parent.rotateOnWorldAxis(axisVector, rad);
	}

	#getAxisByName(axis) {
		let axisVector = new THREE.Vector3(0, 1, 0);
		switch (axis) {
			case 'x':
				axisVector = new THREE.Vector3(1, 0, 0);
				break;
			case 'y':
				axisVector = new THREE.Vector3(0, 1, 0);
				break;
			case 'z':
				axisVector = new THREE.Vector3(0, 0, 1);
				break;
		}
		return axisVector;
	}

	#positionCamera(padding = 0) {
		// const box = new THREE.Box3().setFromObject(this.#parent);
		// const center = box.getCenter(new THREE.Vector3());
		// const size = box.getSize(new THREE.Vector3());

		// const boxDiagonalSq =
		// 	Math.pow(size.x, 2) + Math.pow(size.y, 2) + Math.pow(size.z, 2); // the room diagonal of the bounding box of the mesh
		// const maxDimension = Math.sqrt(boxDiagonalSq); //maximum width of the object
		// const fovDegrees = this.#camera.fov * (Math.PI / 180); //get the cameras fov and convert it into degrees
		// let distance = maxDimension / (2 * Math.tan(fovDegrees / 2)); //divide the maximum width of the object, by the tan of the cameras fov / 2 to get the amount the camera needs to slide out

		// distance *= padding; //apply padding around it

		// const direction = this.#camera.position
		// 	.clone()
		// 	.sub(center)
		// 	.normalize()
		// 	.multiplyScalar(distance);

		// this.#camera.position.copy(center).add(direction);

		// this.#camera.near = maxDimension / 100;
		// this.#camera.far = distance * 3;

		const boundingBox = new THREE.Box3().setFromObject(this.#parent);
		const center = boundingBox.getCenter(new THREE.Vector3());
		const size = boundingBox.getSize(new THREE.Vector3());
		const maxSide = Math.max(size.x, size.y, size.z);
		const maxDimension = Math.sqrt(
			Math.pow(maxSide, 2) + Math.sqrt(maxSide, 2),
		);
		const distance =
			maxDimension / (2 * Math.tan((Math.PI * this.#camera.fov) / 360));
		this.#camera.position.set(
			center.x,
			center.y,
			center.z + distance + padding,
		);
	}
}

module.exports = { Renderer };
