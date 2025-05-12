
import { State } from '../../core/stateManager/States';
import { MeshSubState , CssSubState} from '../../core/stateManager/SubStatesExtends';

import { screenMaterial } from '../objects/materialAssets';
import { screenSurface, tourMachineObj } from '../objects/arcadeMachines/tournamentMachineObj';

import { start } from '../overlays/divs/tour_start';
import { create } from '../overlays/divs/tour_create';
import { join } from '../overlays/divs/tour_join';
import { payment } from '../overlays/divs/tour_payment';
import { refund } from '../overlays/divs/tour_refund';
import { pongGame } from '../overlays/scenes/pong-game/Game';
import { end } from '../overlays/divs/tour_end';
import { matchmake } from '../overlays/divs/tour_matchamake';
import { waiting } from '../overlays/scenes/waiting';
import { StateManager } from '../../core/stateManager/StateManager';
import { Socket } from '../utils/Socket';
import { create_exit_alert } from '../overlays/alerts/exit_warning';
import { controls } from '../overlays/divs/controls';
import * as THREE from 'three';

const divStart = start;
const restScreen = new CssSubState(
	"rest no info",
	tourMachineObj,
	screenSurface,
	divStart["div"],
	0,
	()=>{
		divStart['show-div']();
		divStart['hide-buttons']();
	},
	null,
	()=>{
		divStart['hide-div']();
	},
	()=>{divStart["resize"]()},
	null,
	null,
)

const startScreen = new CssSubState(
	"start no info",
	tourMachineObj,
	screenSurface,
	divStart['div'],
	0,
	()=>{
		divStart['show-div']();
		divStart['hide-buttons']();
	},
	()=>{
		divStart['show-buttons']();
	},
	()=>{
		divStart['hide-div']();
	},
	()=>{divStart["resize"]()},
	null,
	null,
)


const divCreate = create;
const restScreenCreate = new CssSubState(
	"rest create",
	tourMachineObj,
	screenSurface,
	divCreate["div"],
	0,
	()=>{
		divCreate['show-div']();
		divCreate['hide-buttons']();
	},
	null,
	()=>{
		divCreate['hide-div']();
	},
	()=>{divCreate["resize"]()},
	null,
	null,
)

const startScreenCreate = new CssSubState(
	"start create",
	tourMachineObj,
	screenSurface,
	divCreate['div'],
	0,
	()=>{
		divCreate['show-div']();
		divCreate['hide-buttons']();
	},
	()=>{
		divCreate['show-buttons']();
	},
	()=>{
		divCreate['hide-div']();
	},
	()=>{divCreate["resize"]()},
	(event)=>{return divCreate["keyHandler"](event)},
	null,
)

const divJoin = join;
const restScreenJoin = new CssSubState(
	"rest join",
	tourMachineObj,
	screenSurface,
	divJoin["div"],
	0,
	()=>{
		divJoin['show-div']();
		divJoin['hide-buttons']();
	},
	null,
	()=>{
		divJoin['hide-div']();
	},
	()=>{divJoin["resize"]()},
	null,
	null,
)

const startScreenJoin = new CssSubState(
	"start join",
	tourMachineObj,
	screenSurface,
	divJoin['div'],
	0,
	()=>{
		divJoin['show-div']();
		divJoin['hide-buttons']();
	},
	()=>{
		divJoin['show-buttons']();
	},
	()=>{
		divJoin['hide-div']();
	},
	()=>{divJoin["resize"]()},
	(event)=>{return divJoin["keyHandler"](event)},
	null,
)

const divPay = payment;
const screenPay = new CssSubState(
	"pay",
	tourMachineObj,
	screenSurface,
	divPay['div'],
	0,
	()=>{
		divPay['show-div']();
		divPay['show-buttons']();
		divPay['payment']();
	},
	null,
	()=>{
		divPay['hide-div']();
	},
	()=>{divPay["resize"]()},
	null,
	null,
)

const divRefund = refund;
const screenRefund = new CssSubState(
	"refund",
	tourMachineObj,
	screenSurface,
	divRefund['div'],
	0,
	()=>{
		divRefund['show-div']();
		divRefund['show-buttons']();
		divRefund["enter"]();
	},
	null,
	()=>{
		divRefund['hide-div']();
		return divRefund["exit_return"]();
	},
	()=>{
		divRefund["resize"]();
	},
	(event)=>{return divRefund["keyHandler"](event)},
	null,
)

const divControls = controls;
const screenControls = new CssSubState(
	"controls", 
	tourMachineObj,
	screenSurface,
	divControls.div,
	0,
	()=>{
		divControls['hide-buttons']();
		divControls["enter"]("remote");
	},
	null,
	()=>{
		divControls['hide-buttons']();
		divControls["exit"]()
	},
	()=>{divControls["resize"]()},
	(event)=>{return divControls["keyHandler"](event)},
	null
)


const divMatchmake = matchmake;
const screenMatchmake = new CssSubState(
	"end",
	tourMachineObj,
	screenSurface,
	divMatchmake['div'],
	0,
	()=>{
		divMatchmake['show-div']();
	},
	null,
	()=>{
		divMatchmake['hide-div']();
		divMatchmake["exit"]();
	},
	()=>{
		divMatchmake["resize"]();
	},
	null,
	null,
)

const screenGame = new MeshSubState(
	"game", 
	screenSurface,
	pongGame,
	1,
	()=>{pongGame["enter"](1)},
	()=>{pongGame["exit"]()},
)

const divEnd = end;
const screenEnd = new CssSubState(
	"end",
	tourMachineObj,
	screenSurface,
	divEnd['div'],
	0,
	()=>{
		divEnd['enter']();
	},
	null,
	()=>{
		divEnd['exit']();
	},
	()=>{
		divEnd["resize"]();
	},
	(event)=>{return divEnd["keyHandler"](event)},
	null,
)

const screenWaiting = new MeshSubState(
	"waiting", 
	screenSurface,
	waiting,
	2,
	null,
)

const tourMachineState = new State(
	"tournament", 
	{
		pos: true,
		duration: 2,
		ease: "power2.inOut"
	},
	null,
	[
		restScreen, 
		startScreen,//1
		restScreenCreate,//2
		startScreenCreate,//3
		restScreenJoin,//4
		startScreenJoin,//5
		screenPay,//6
		screenRefund,//7
		screenControls,//8
		screenMatchmake,//9
		screenWaiting, //10
		screenGame, //11
		screenEnd,//12
	],
	null,
	()=>{
		let curr_sub = new StateManager().currentState.currentSubstateIndex;
		if (curr_sub >= 9)
		{
			// console.log("exit warning maybe...", curr_sub)
			if (curr_sub != 12 || divEnd["can-exit"]() == false)
			{
				// console.log("should warn", curr_sub);
				if (create_exit_alert() == "cancelled")
					return ("cancelled")
				new Socket().send({
					"channel" : "tournament",
					"action" : "exit live"
				})
			}
		}
	},
	[
		screenMaterial,
		pongGame.renderMaterial,
		waiting.renderMaterial,
	],
	// null,
	screenSurface.self,
	new THREE.Vector3(0, 0, -1),
	1.5
)

tourMachineState.blockedIndex = 6
export { tourMachineState}