import * as THREE from 'three';
import { MainEngine } from './mainScene/utils/MainEngine';
import { stateManager, mainSceneObj } from './mainScene/states/mainMenuState';

import { backBox } from './mainScene/objects/background/backBox';
import { localMachineObj } from './mainScene/objects/machines/localMachineObj';
import { aiMachineObj } from './mainScene/objects/machines/aiMachineObj';
import { tourMachineObj } from './mainScene/objects/machines/tournamentMachineObj';
import { StateManager } from './core/stateManager/StateManager';

import { Socket } from './mainScene/utils/Socket';

import { wheel_scroll_animations } from './core/stateManager/cameraMovement';
// import { create_redirection_alert } from './mainScene/overlays/alerts/redirection_warning';

const engine = new MainEngine();

let isAnimating = false;

//developent:
document.addEventListener('keydown', (event) => {
	if (event.key == "i")
	{
		const stateManager = new StateManager();
		console.log("Now: ", stateManager.currentState.name);
		stateManager.states.forEach(state=>
			{
				console.log("state ", state.name, "substate: ", state.currentSubstate.name);
			}
		)
	}
});


// enterScene is called in mounted() or onMounted().
export function enterScene(app_container){
	engine.addContainerWrapper(app_container);
	if (!engine.sceneInitialized) {	
		engine.add(backBox, false);
		engine.add(mainSceneObj, true);
		engine.stateManager = stateManager;
		engine.sceneInitialized = true;
	}
	new Socket();
	window.addEventListener('popstate', popstate);
	window.addEventListener("wheel", wheel_scroll_animations);
	window.addEventListener('resize', onResize);
	window.addEventListener('click', onClick);

	isAnimating = true;
	animate();
}



function animate() {
	if (!isAnimating) return ;
	requestAnimationFrame(animate);
	engine.animate();
}

//exitScene is called in beforeUnmount() or onBeforeUnmount().
export function exitScene(){
	isAnimating = false;
	engine.removeContainerWrapper();
	window.removeEventListener('popstate', popstate);
	window.removeEventListener("wheel", wheel_scroll_animations);
	window.removeEventListener('resize', onResize);
	window.removeEventListener('click', onClick);
}

function popstate(event){
	if (event.state)
		new StateManager().changeState(event.state.num, false);
}

function onResize() {
	engine.resize();
}

function onClick(event) {
	engine.click(event);
}

// enterScene(document.getElementById("app-container"));

// enterScene(document.body);


