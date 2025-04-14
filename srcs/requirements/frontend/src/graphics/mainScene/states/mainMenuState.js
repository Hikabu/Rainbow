import { State } from '../../core/stateManager/States';
import { SubState } from '../../core/stateManager/SubStates';

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
export const mainState = new State(
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
