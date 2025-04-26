import * as THREE from 'three';

export class Ball {
	constructor(visibility, engine){
		const side = engine.boundaryY * 0.04;
		const geoCube = new THREE.BoxGeometry(side, side, side);
		const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
		this.object = new THREE.Mesh(geoCube, material);
		engine.scene.add(this.object);
		this.rotationSpeed = 0.01;
		this.object.visible = visibility;
	}
	initPositions(engine){
		this.object.geometry.parameters.width = engine.boundaryY * 0.04;
		this.object.geometry.parameters.length = engine.boundaryY * 0.04;
		this.object.geometry.parameters.depth = engine.boundaryY * 0.04;
	}
	rotate(){
		this.object.rotation.x += this.rotationSpeed;
		this.object.rotation.y += this.rotationSpeed;
		this.object.rotation.z += this.rotationSpeed;
	}
	halfWidth(){
		return 
	}
	hide(){
		this.object.visible = false;
	}
	show(){
		this.object.visible = true;
	}
}