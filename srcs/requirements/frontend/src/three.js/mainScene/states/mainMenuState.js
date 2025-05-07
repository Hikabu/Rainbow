import { StateManager } from '../../core/stateManager/StateManager';
import { State } from '../../core/stateManager/States';
import { SubState } from '../../core/stateManager/SubStates';
import { localMachineState } from "./localMachineState";
import { aiMachineState } from './aiMachineState';
import { tourMachineState } from './tournamentMachineState';
import { localMachineObj } from '../objects/arcadeMachines/localMachineObj';
import { aiMachineObj } from '../objects/arcadeMachines/aiMachineObj';
import { tourMachineObj } from '../objects/arcadeMachines/tournamentMachineObj';
import * as THREE from 'three';
import { Part } from '../../core/objectFactory/Part';
import { Object } from '../../core/objectFactory/Object';
import { friends_machine } from '../objects/friends/friendMachine';
import { friendState, background_friends } from './friendsState';
import { MainEngine } from '../utils/MainEngine';
const points = [
	[0, 0],         // [w[0], h[0]]
	[0, 1],         // [w[0], h[6]]
   [1, 1],
   [1, 0]
];

// Function to scale points
function scale_points(points, wFactor, hFactor) {
	return points.map(([x, y]) => [
		x * wFactor,   // Apply width factor
		y * hFactor    // Apply height factor
	]);
}

const part_test = new Part(
	scale_points(points, 30, 10), 
	2,
	[
		new THREE.MeshStandardMaterial({ color: 0x800080, side: THREE.DoubleSide }), // Purple
	]
);
const mainScene = new THREE.Group();
const platform = new Object(part_test);
platform.self.position.x = 0;
platform.self.position.y = 0;
platform.self.position.z = 0;
platform.self.rotation.x += Math.PI/2
mainScene.add(platform.self)

mainScene.add(localMachineObj.self)
localMachineObj.self.rotation.y -= Math.PI/2
localMachineObj.add_onclick(()=>{ new StateManager().changeState(1);})

mainScene.add(aiMachineObj.self)
aiMachineObj.self.rotation.y -= Math.PI/2
aiMachineObj.add_onclick(()=>{ new StateManager().changeState(2);})

mainScene.add(tourMachineObj.self)
tourMachineObj.self.rotation.y -= Math.PI/2
tourMachineObj.self.scale.set(1, 1.5, 2)
tourMachineObj.add_onclick(()=>{ new StateManager().changeState(3);})

mainScene.add(friends_machine.self)
friends_machine.self.rotation.x += Math.PI/2
friends_machine.add_onclick(()=>{ new StateManager().changeState(4);})

//set positions
localMachineObj.self.position.set(-8, 4, -0.5)
aiMachineObj.self.position.set(localMachineObj.self.position.x + 4, 4 ,-0.25)
tourMachineObj.self.position.set(aiMachineObj.self.position.x + 5, 4, 0.25)
friends_machine.self.position.set(tourMachineObj.self.position.x + 6, 4,- 0.75)

new MainEngine().clickableObjects.push(localMachineObj.self, aiMachineObj.self, tourMachineObj.self, friends_machine.self)

let floatTime = 0;
const mainSub = new SubState(
	"main controls", 
	null,
	-1,
	null,
	null,
	null, 
	null, 
	null,
	()=>{
		if (background_friends)
		{
			floatTime += 0.06;
			const pulse = 1 + Math.sin(floatTime * 0.5) * 0.025;
			friends_machine.self.scale.set(pulse, pulse, pulse);
		}
	}
)

const mainState = new State(
	"lobby",
	{
		pos: true, 
		duration: 2, 
		ease: "power2.inOut"
	}, 
	{
		pos: true, 
		duration: 5,
		ease: "power2.inOut"
	},
	[ mainSub ],
	null,
	null,
	[],
	// null,
	mainScene,
	new THREE.Vector3(0, 0, -1),
	1.25,
);

const stateManager = new StateManager(
	[
		mainState, 
		localMachineState,
		aiMachineState,
		tourMachineState,
		friendState,
	],
);

export { stateManager, mainScene}