import * as THREE from 'three';

export class Engine {
	constructor(window){
		this.scene = new THREE.Scene();
		this.aspect = 1;
		this.camera =  new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
		this.camera.position.z = 10;
		//this.renderer = new THREE.WebGLRenderer({ canvas });
		this.lastUpdateTime = 0;
		this.updateInterval = 100;
		this.setRendererSize(this.aspect);
		this.setUpLights(this.scene);
	}
	setRendererSize(aspect){
		// console.log("set renderre sixe , ",aspect)
		// this.renderer.setSize(window.innerWidth, window.innerHeight);
		const vFOV = THREE.MathUtils.degToRad(this.camera.fov);
		this.boundaryY = (Math.tan(vFOV / 2) * this.camera.position.z) / aspect;
		this.boundaryX = (this.boundaryY * this.camera.aspect) * aspect;
	}
	setUpLights(){
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
		this.scene.add(ambientLight);
		const light = new THREE.DirectionalLight(0xffffff, 5);
		light.position.set(0, 0, 5);
		light.castShadow = true;
		this.scene.add(light);
		const lightRight = new THREE.DirectionalLight(0xffffff, 0.5);
		lightRight.position.set(5, 0, 0);
		lightRight.castShadow = true;
		this.scene.add(lightRight);
		const lightLeft = new THREE.DirectionalLight(0xffffff, 0.25);
		lightLeft.position.set(-5, 0, 0);
		lightLeft.castShadow = true;
		this.scene.add(lightLeft);


	}
}

