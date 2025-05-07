import { Object } from '../../../core/objectFactory/Object'
import { Part } from '../../../core/objectFactory/Part';
import { StateManager } from '../../../core/stateManager/StateManager';
import { scale_points, cube_points } from '../geoAssets';
import * as THREE from 'three';

const material = new THREE.MeshStandardMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
const border_material =  new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
export const width = 3;
export const height = 3;
export const length = 4;

const bottom = new Object(new Part(scale_points(cube_points, width, height), length / 2, material));

const top = new Object(new Part(scale_points(cube_points, width, height), length / 4, material));


const button = new Object(new Part(scale_points(cube_points, 0.2, 0.2), 0.1, new THREE.MeshStandardMaterial({color: 0xff0000, color: 0xff0000, emissive: 0x220000, emissiveIntensity: 1.0})))
const base_button = new Object(new Part(scale_points(cube_points, 0.3, 0.3), 0.15, new THREE.MeshStandardMaterial({color: 0x000000, side: THREE.DoubleSide })))
const button2 = new Object(new Part(scale_points(cube_points, 0.2, 0.2), 0.1, new THREE.MeshStandardMaterial({color: 0xff0000, color: 0xff0000, emissive: 0x220000, emissiveIntensity: 1.0})))
button.add_object(0.5, 0.5, [0, 1], button2, [0, 1, 0], -1)
button.add_object(0.5, 0.5, [0, 1], base_button, [0, 1, 0], -1)
button.add_onclick(()=>{
	const stateManager = new StateManager();
	if (stateManager.currentStateIndex == 4)
	{
		if (stateManager.currentState.currentSubstateIndex == 1)
			stateManager.currentState.changeSubstate(2);
		else if (stateManager.currentState.currentSubstateIndex == 2)
			stateManager.currentState.changeSubstate(1);
	}
})
// bottom.add_object(0.5, 0.5, [0, 4], base_button, [0, 1, 0], 1)
bottom.add_object(0.85, 0.85, [0, 3], button, [0, 1, 0], 1)
const glass = new Object(new Part(scale_points(cube_points, width, height), length, new THREE.MeshBasicMaterial({
	color: 0x0000ff,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: 0.1,
  })));
glass.basePart.add_borders([2, 3, 4, 5], border_material);

bottom.add_object(0.5, 0.5, [0, 1], glass, [0, 1, 0], -1)
glass.add_object(0.5, 0.5, [0, 1], top, [0, 1, 0], -1)

const friends_machine = bottom;
// friends_machine.self.position.z = 5
// friends_machine.self.position.y = 2
// friends_machine.self.rotation.x = Math.PI / 2

export {friends_machine, glass, button}

