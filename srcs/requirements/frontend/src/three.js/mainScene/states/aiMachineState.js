

import * as THREE from 'three';

import { StateManager } from '../../core/stateManager/StateManager';
import { State } from '../../core/stateManager/States';
import { CssSubState,MeshSubState } from '../../core/stateManager/SubStatesExtends';
import { aiMachineObj,center, object, partIndex, screenSurface, surfaceIndex } from '../objects/machines/aiMachineObj';
import { screenMaterial } from '../objects/simpleAssets';
import { AlertManager } from '../overlays/alerts/Alerts';
import { create_exit_alert } from '../overlays/alerts/exit_warning';
import { End } from '../overlays/divs/end';
import { StartScreen } from '../overlays/divs/start'
import { pongGame, startPongGame } from '../overlays/scenes/pong-game/Game';		
const divStart = new StartScreen('white', "START GAME");

const restScreen = new CssSubState(
	"rest",
	object,
	partIndex,
	surfaceIndex,
	divStart.div,
	0,
	()=>{
		divStart.enter();
		divStart.enterButton.element.style.visibility = "hidden";
	},
	null,
	null,
	()=>{ divStart.resize();},
	(event)=> { return divStart.keyHandler(event);},
	null,
)

const startScreen = new CssSubState(
	"start",
	object,
	partIndex,
	surfaceIndex,
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


const gameScreen = new MeshSubState(
	"rest", 
	screenSurface,
	pongGame,
	1,
	()=>{startPongGame("AI")},
	()=>{
		new AlertManager().remove_latest_alert("exit_alert");
	},
)

const divEnd = new End("white");
const endScreen = new CssSubState(
	"end", 
	object,
	partIndex,
	surfaceIndex,
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
	"ai game screen", 
	{
		pos: true,
		duration: 2,
		ease: "power2.inOut"
	},
	null,
	[
		restScreen,
		startScreen, 
		gameScreen,
		endScreen
	],
	null,
	()=>{
		if (new StateManager().currentState.currentSubstateIndex == "2")
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
	aiMachineObj.self,
	new THREE.Vector3(0, 0, -1),
	1.5
)

export {aiMachineState}