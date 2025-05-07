

import { State } from '../../core/stateManager/States';
import { MeshSubState , CssSubState} from '../../core/stateManager/SubStatesExtends';
import { screenMaterial } from '../objects/materialAssets';
import { screenSurface, aiMachineObj } from '../objects/arcadeMachines/aiMachineObj';
import { StartScreen } from '../overlays/divs/start'
import { End } from '../overlays/divs/end';
import { pongGame } from '../overlays/scenes/pong-game/Game';		
import { AlertManager } from '../overlays/alerts/Alerts';
import { StateManager } from '../../core/stateManager/StateManager';
import * as THREE from 'three';
import { create_exit_alert } from '../overlays/alerts/exit_warning';
import { controls } from '../overlays/divs/controls';

const divStart = new StartScreen('white', "START GAME");

const restScreen = new CssSubState(
	"rest",
	aiMachineObj,
	screenSurface,
	divStart.div,
	0,
	()=>{
		divStart.enter();
		divStart.enterButton.element.style.visibility = "hidden";
	},
	null,
	null,
	()=>{ divStart.resize();},
	null,
	null,
)

const startScreen = new CssSubState(
	"start",
	aiMachineObj,
	screenSurface,
	divStart.div,
	0,
	null,
	()=>{
		divStart.enterButton.element.style.visibility = "visible";
	},
	()=>{ divStart.exit();},
	()=>{ divStart.resize();},
	(event)=> { return divStart.keyHandler(event);},
	()=>{divStart.animate()},
)

const divControls = controls;
const controlScreen = new CssSubState(
	"controls", 
	aiMachineObj,
	screenSurface,
	divControls.div,
	0,
	()=>{
		divControls['show-buttons']();
		divControls["enter"]("ai");
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


const gameScreen = new MeshSubState(
	"game", 
	screenSurface,
	pongGame,
	1,
	()=>{pongGame["enter"](1)},
	()=>{
		new AlertManager().remove_latest_alert("exit alert");
	},
)

const divEnd = new End("white");
const endScreen = new CssSubState(
	"end", 
	aiMachineObj,
	screenSurface,
	divEnd.div,
	0,
	()=>{divEnd.enter()},
	null,
	()=>{divEnd.exit()},
	()=>{divEnd.resize()},
	(event)=> { return divEnd.keyHandler(event);},
	()=>{divEnd.animate()},
)

const aiMachineState = new State(
	"ai-duel", 
	{
		pos: true,
		duration: 2,
		ease: "power2.inOut"
	},
	null,
	[
		restScreen,
		startScreen,
		controlScreen,
		gameScreen,//3
		endScreen
	],
	null,
	()=>{
		if (new StateManager().currentState.currentSubstate.name == "game")
			{
				if (create_exit_alert() == "cancelled")
					return ("cancelled")
			}
	},
	[
		screenMaterial,
		pongGame.renderMaterial,
	],
	// null,
	screenSurface.self,
	new THREE.Vector3(0, 0, -1),
	1.5
)

export {aiMachineState}