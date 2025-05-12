import * as THREE from 'three';

// import { create_redirection_alert } from './mainScene/overlays/alerts/redirection_warning';
import { Object } from './core/objectFactory/Object';
import { Part } from './core/objectFactory/Part';
import { wheel_scroll_animations } from './core/stateManager/cameraMovement';
import { StateManager } from './core/stateManager/StateManager';
import { backBox } from './mainScene/objects/background/backBox';
import { aiMachineObj } from './mainScene/objects/arcadeMachines/aiMachineObj';
import { localMachineObj } from './mainScene/objects/arcadeMachines/localMachineObj';
import { tourMachineObj } from './mainScene/objects/arcadeMachines/tournamentMachineObj';
import { mainSceneObj,stateManager } from './mainScene/states/mainMenuState';
import { MainEngine } from './mainScene/utils/MainEngine';
import { Socket } from './mainScene/utils/Socket';
import { OnLoad } from './mainScene/utils/OnLoad';
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
export async function preEnterScene(app_container){
	console.log("pre enter")
	if (Socket.instance)
		new OnLoad().set_socket_ready();
	else
	{
		let socket = new Socket();
		await socket.init();
	}
	init_scene_state();
	if (!engine.sceneInitialized) {	
	//	console.log("add to engine...")
		//engine.add(test, false);
		//engine.add(backBox, false);
		engine.add(mainSceneObj, true);
		engine.stateManager = stateManager;
		engine.sceneInitialized = true;
	}
	else
		new OnLoad().set_texture_ready()
	if (!engine.stateManager)
		engine.stateManager = stateManager
	engine.addContainerWrapper(app_container);
	observer.observe(app_container);
}

export function uponEnter(){
	window.dispatchEvent(new Event("resize"));
	console.log("upon enter")
	
	window.addEventListener('popstate', popstate);
	window.addEventListener("wheel", wheel_scroll_animations);
	window.addEventListener('resize', onResize);
	window.addEventListener('click', onClick);
	document.body.addEventListener('keydown', key_events);
	//console.log(engine.camera.position)
	//engine.resize()
	isAnimating = true;
	animate();
	window.dispatchEvent(new Event("resize"));
	// if (engine.stateManager.currentState && engine.stateManager.currentStateIndex == 0)
	// 	engine.stateManager.currentState = null
	if (engine.stateManager.currentState == null)
		{
			//console.log(engine.camera.position)
			console.log("entering main state")
			engine.stateManager.currentStateIndex = -1;
			engine.stateManager.changeState(0, true, 1);
			//console.log(engine.camera.position)
	
	
		}
	window.dispatchEvent(new Event("resize"));

	// document.body.focus()
	// engine.container.focus()
	// engine.container.parentElement.focus()
}

export function animate() {
	if (!isAnimating) return ;
	//console.log("animate");
	requestAnimationFrame(animate);
	engine.animate();
}

//exitScene is called in beforeUnmount() or onBeforeUnmount().
export function exitScene(){
	isAnimating = false;
	observer.unobserve(engine.wrapper);
	engine.removeContainerWrapper();
	window.removeEventListener('popstate', popstate);
	window.removeEventListener("wheel", wheel_scroll_animations);
	window.removeEventListener('resize', onResize);
	window.removeEventListener('click', onClick);
	document.body.removeEventListener("keydown", key_events)
	new OnLoad().reset()
}

function popstate(event){
	if (event.state)
		new StateManager().changeState(event.state.num, false);
}
const observer = new ResizeObserver(() => {
		console.log("observer working")
		onResize();
});

function onResize() {
	console.log("resize")
	engine.resize();
}

function onClick(event) {
	engine.click(event);
}

function key_events(event){
	console.log("clicked key!")
	stateManager.handleKeyPress(event)
}

function init_scene_state(){
	//console.log("init scene...")
	let stateFromURL = window.location.pathname;
	//console.log("state from url", stateFromURL)
	if (stateFromURL){ 
		const path = stateFromURL.slice(1); // "lobby"
		for (let i = 1; i < stateManager.states.length; i++)
		{
			if (stateManager.states[i].name == path)
			{
				// console.log("switching to state ", i)
				stateManager.changeState(i, true, -1);
				return;
			}
		}
	}
	stateManager.currentState = null;
	engine.camera.position.copy(stateManager.states[0].get_camera_position());
	engine.camera.position.z += 20;
}