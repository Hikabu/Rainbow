import * as THREE from 'three';
import { fitCameraToObject } from '../../../../../core/stateManager/cameraMovement';

export class MiddleBars{
	constructor(visibility, engine){
		this.object = this.setUpMiddleBars(engine.scene);
		// console.log("")
		// console.log("CAMERA SCENE: Could be=> ", fitCameraToObject(this.object, new THREE.Vector3(0, 0, -1), 1.25, 2));
		// console.log("CAMERA SCENE: IS => ", engine.camera.position)
		this.object.visible = visibility;
	}
	setUpMiddleBars(scene){
		const totalBars = 40;
		const barsHeight = 0.1;
		const geoMidBars = new THREE.BoxGeometry(0.02, barsHeight, 0.02);
		const bars = [];
		const screenTop = 5;
		const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const group = new THREE.Group();
		for (let i = 0; i < totalBars; i++)
		{
			bars[i] = new THREE.Mesh(geoMidBars, material);
			group.add(bars[i]);
			bars[i].position.y = screenTop - (i * barsHeight * 3);
		}
		scene.add(group);
		return group;
	}
	hide(){
		this.object.visible = false;
	}
	show(){
		this.object.visible = true;
	}
	
}