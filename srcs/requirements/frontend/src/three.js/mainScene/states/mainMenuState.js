import { StateManager } from '../../core/stateManager/StateManager';
import { State } from '../../core/stateManager/States';
import { SubState } from '../../core/stateManager/SubStates';
import { localMachineState } from "./localMachineState";
import { aiMachineState } from './aiMachineState';
import { tourMachineState } from './tournamentMachineState';

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
)
const mainState = new State(
	"main view",
	{
		pos: [0,2,7], 
		duration: 5, 
		ease: "power2.inOut"
	}, 
	[ mainSub ],
	null,
	null,
	[],
);

const stateManager = new StateManager(
	[
		mainState, 
		localMachineState,
		aiMachineState,
		tourMachineState,
	],
);

export { stateManager }