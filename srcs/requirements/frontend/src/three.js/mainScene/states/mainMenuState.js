import { StateManager } from '../../core/stateManager/StateManager';
import { State } from '../../core/stateManager/States';
import { SubState } from '../../core/stateManager/SubStates';
import { localMachineState } from "./localMachineState";
import { aiMachineState } from './aiMachineState';
import { tourMachineState } from './tournamentMachineState';
import { localMachineObj } from '../objects/machines/localMachineObj';
import { aiMachineObj } from '../objects/machines/aiMachineObj';
import { tourMachineObj } from '../objects/machines/tournamentMachineObj';
import * as THREE from 'three';

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
	"main view",
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



export { stateManager, mainSceneObj}