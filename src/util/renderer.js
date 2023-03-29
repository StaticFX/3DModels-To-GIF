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
			shading: THREE.SmoothShading
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
				obj.geometry.computeBoundingBox();
				obj.geometry.center();
				averagePosition.add(obj.position);
			}
		});	

		averagePosition.divideScalar(this.#parent.children.length);
		this.#parent.position.sub(averagePosition);
		var rad = THREE.MathUtils.degToRad(90);
		this.#parent.rotateX(rad);

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

		const sphere = new THREE.SphereGeometry(10, 32, 32);
		const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

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

	#positionCamera(padding = 1.2) {
		const boundingBox = new THREE.Box3().setFromObject(this.#parent);	
		const center = boundingBox.getCenter(new THREE.Vector3());
		const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere(center));
		const maxDimension = boundingSphere.radius * 2 * padding;
		const size = boundingBox.getSize(new THREE.Vector3());


		const distance = maxDimension / (2 * Math.tan((Math.PI * this.#camera.fov) / 360));

		this.#camera.position.set(0,0,0);
		this.#camera.updateMatrix();

		const deg = THREE.MathUtils.degToRad(45);
		this.#camera.rotateX(deg);

		const backwardVector = new THREE.Vector3();
		const direction = this.#camera.getWorldDirection(backwardVector);
		backwardVector.negate();
		backwardVector.multiplyScalar(distance);
		
		this.#camera.position.add(backwardVector);
		this.#camera.updateMatrix();



		//this.#camera.position.copy(center).add(direction);

		//this.#camera.translateY(-size.y);
		//this.#camera.lookAt(center);

		this.#camera.updateMatrix();

		//this.#parent.translateY(size.y / 2);
	}
}

module.exports = { Renderer };
