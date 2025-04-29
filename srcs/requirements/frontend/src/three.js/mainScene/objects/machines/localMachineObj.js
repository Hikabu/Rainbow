import { Object } from '../../../core/objectFactory/Object'
import { Part } from '../../../core/objectFactory/Part';
import { StateManager } from '../../../core/stateManager/StateManager';
import { arcade_points, scale_points } from '../assets';
import { screenMaterial } from '../simpleAssets';
import * as THREE from 'three';

const part_test = new Part(
	scale_points(arcade_points, 2, 6), 
	2.5,
	[
		new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }), // Red
		new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }), // Red
		new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }), // Red
		new THREE.MeshStandardMaterial({ color: 0xff7f00, side: THREE.DoubleSide }), // Orange
		new THREE.MeshStandardMaterial({ color: 0xffff00, side: THREE.DoubleSide }), // Yellow
		new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide }), // Green
		new THREE.MeshStandardMaterial({ color: 0x0000ff, side: THREE.DoubleSide }), // Blue
		new THREE.MeshStandardMaterial({ color: 0x800080, side: THREE.DoubleSide }), // Purple
		new THREE.MeshStandardMaterial({ color: 0xff1493, side: THREE.DoubleSide }), // Pink
		new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }), // Black
	  ]
);

const object = new Object(part_test);
object.self.position.z = 3;
object.self.position.x = -4;
object.self.position.y = 2.4;
object.self.rotation.y -= Math.PI / 2;

const localMachineObj = object;
localMachineObj.add_onclick(()=>{ new StateManager().changeState(1);})

const partIndex = 0;
const surfaceIndex = 5;
const screenSurface = object.self.children[partIndex].children[surfaceIndex].userData.instance;
screenSurface.add_material( screenMaterial);
const center = object.self.position.clone();
center.z += 2;

export {localMachineObj, screenSurface, center, object, partIndex, surfaceIndex}