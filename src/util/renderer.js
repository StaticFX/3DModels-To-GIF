const fs = require('fs').promises;
const THREE = require('three');
const { Loader } = require('../loader/loader');

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

	/**
	 * Loads an object into the scene
	 * @param {string | ArrayBuffer} file absolute path to the file or the file as a buffer
	 * @param {Loader} loader loader for a given fileType
	 * @param {number} color color value to tint the object
	 */
	async addObject(file, loader, color) {
		let buffer;
		if (typeof file === 'string') {
			const data = await fs.readFile(filepath);
			buffer = new Uint8Array(data).buffer;
		} else {
			buffer = file;
		}

		const object = await loader.load(buffer, this.#parent);

		this.#parent.add(object);

		const material = new THREE.MeshPhongMaterial({
			color,
		});

		this.#parent.traverse((child) => {
			if (child.hasOwnProperty('material')) {
				child.material = material;
			}
		});

		var averagePosition = new THREE.Vector3();

		const box = new THREE.Box3().setFromObject(this.#parent);
		var middle = new THREE.Vector3();
		box.getCenter(middle);

		this.#parent.traverse(function (obj) {
			if (obj.isMesh) {
				averagePosition.add(obj.position);
			}
		});

		averagePosition.divideScalar(this.#parent.children.length);
		this.#parent.position.sub(averagePosition);

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

	/**
	 * Sets the scene background
	 * @param {number} color color value as number
	 */
	setSceneBackgroundColor(color) {
		this.#scene.background = new THREE.Color(color);
	}

	/**
	 * Rotates the whole scene by a given angle on a given axis
	 * @param {"x" | "y" | "z"} axis axis name x | y | z
	 * @param {number} angleDeg angle to rotate in degrees
	 * @param {"world" | "object"} axisSpace axis space to use either fixed world axis or local object access
	 */
	rotateScene(axis, angleDeg, axisSpace) {
		const rad = THREE.MathUtils.degToRad(angleDeg);

		const axisVector = this.#getAxisByName(axis);

		if (axisSpace === 'OBJECT') {
			this.#parent.rotateOnAxis(axisVector, rad);
		} else {
			this.#parent.rotateOnWorldAxis(axisVector, rad);
		}
	}

	/**
	 * Returns you the correct normalized vector for a specified axis name
	 * @param {"x" | "y" | "z"} axis axis name x | y | z
	 * @returns {THREE.Vector3} the normalized vector of the axis
	 */
	#getAxisByName(axis) {
		let axisVector = new THREE.Vector3(0, 1, 0);
		switch (axis.toLowerCase()) {
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

		const boxDiagonalSq =
			Math.pow(size.x, 2) + Math.pow(size.y, 2) + Math.pow(size.z, 2); // the room diagonal of the bounding box of the mesh
		const maxDimension = Math.sqrt(boxDiagonalSq); //maximum width of the object
		//const maxDimension = Math.sqrt(
		//	Math.pow(maxSide, 2) + Math.sqrt(maxSide, 2),
		//);
		const distance =
			maxDimension / (2 * Math.tan((Math.PI * this.#camera.fov) / 360));
		this.#camera.position.set(
			center.x,
			center.y,
			center.z + distance + padding,
		);
		//this.#camera.lookAt(center);

		console.log(size);

		this.#parent.position.y += size.z / 2;

		console.log(this.#parent.position);
		console.log(this.#camera.position);
	}
}

module.exports = { Renderer };
