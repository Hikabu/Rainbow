import * as THREE from 'three';

export class Engine {
	constructor(window){
		this.scene = new THREE.Scene();
		this.camera =  new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
		this.camera.position.z = 10;
		//this.renderer = new THREE.WebGLRenderer({ canvas });
		this.lastUpdateTime = 0;
		this.updateInterval = 100;
		this.setRendererSize();
		this.setUpLights(this.scene);
	}
	setRendererSize(){
		// this.renderer.setSize(window.innerWidth, window.innerHeight);
		const vFOV = THREE.MathUtils.degToRad(this.camera.fov);
		this.boundaryY = Math.tan(vFOV / 2) * this.camera.position.z;
		this.boundaryX = this.boundaryY * this.camera.aspect;
	}
	setUpLights(){
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
		this.scene.add(ambientLight);
		const pointLight = new THREE.PointLight(0xffffff, 1, 100);
		pointLight.position.set(0, 5, 10);
		this.scene.add(pointLight);
	}
}

