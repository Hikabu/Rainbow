import * as THREE from 'three';
import { MainEngine } from '../../utils/MainEngine';
import { StateManager } from '../../../core/stateManager/StateManager';

export function updateLabel(label, ball) {
	const position = new THREE.Vector3();
	ball.getWorldPosition(position);
	label.position.copy(position);

	const quaternion = new THREE.Quaternion();
	ball.getWorldQuaternion(quaternion);
	label.quaternion.copy(quaternion);
	label.rotation.x = Math.PI;
	if (new StateManager().currentState.currentSubstateIndex == 2)
		label.rotation.z = Math.PI;

}

export function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}
