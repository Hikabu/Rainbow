import * as THREE from 'three';

import { StateManager } from '../../core/stateManager/StateManager';
import { State } from '../../core/stateManager/States';
import { SubState } from '../../core/stateManager/SubStates';
import { aiMachineObj } from '../objects/machines/aiMachineObj';
import { localMachineObj } from '../objects/machines/localMachineObj';
import { tourMachineObj } from '../objects/machines/tournamentMachineObj';
import { aiMachineState } from './aiMachineState';
import { localMachineState } from "./localMachineState";
import { tourMachineState } from './tournamentMachineState';

const mainSceneObj = new THREE.Group();
mainSceneObj.add(localMachineObj.self)
mainSceneObj.add(aiMachineObj.self)
mainSceneObj.add(tourMachineObj.self)

const mainSub = new SubState(
	"main controls", 
	null,
	-1,
	null,
	null,
	null, 
	null, 
	null,
	null,
	mainSceneObj
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
	mainSceneObj,
	new THREE.Vector3(0, 0, -1),
	1.25,
);
const stateManager = new StateManager(
	[
		mainState, 
		localMachineState,
		aiMachineState,
		tourMachineState,
	],
);



export { mainSceneObj,stateManager}