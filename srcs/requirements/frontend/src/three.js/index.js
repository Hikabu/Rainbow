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
import { Object } from './core/objectFactory/Object';
import { Part } from './core/objectFactory/Part';
const engine = new MainEngine();

let isAnimating = false;

console.log("TEST PART");
const points = [
    [0, 0],         // [w[0], h[0]]
    [0, 1],         // [w[0], h[6]]
    [0.8, 1],       // [w[3], h[7]]
    [0.8, 0.9],     // [w[3], h[5]]
    [0.7, 0.85],    // [w[1], h[4]]
    [0.75, 0.8],    // [w[2], h[3]]
    [1, 0.6],       // [w[5], h[2]]
    [1, 0.5],       // [w[5], h[1]]
    [0.85, 0],      // [w[4], h[1]]
];

// Function to scale points
function scale_points(points, wFactor, hFactor) {
    return points.map(([x, y]) => [
        x * wFactor,   // Apply width factor
        y * hFactor    // Apply height factor
    ]);
}

const part_test = new Part(
	scale_points(points, 3, 6), 
	3,
	[
		new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }), // Red
		new THREE.MeshStandardMaterial({ color: 0xff7f00, side: THREE.DoubleSide }), // Orange
		new THREE.MeshStandardMaterial({ color: 0xffff00, side: THREE.DoubleSide }), // Yellow
		new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide }), // Green
		new THREE.MeshStandardMaterial({ color: 0x0000ff, side: THREE.DoubleSide }), // Blue
		new THREE.MeshStandardMaterial({ color: 0x800080, side: THREE.DoubleSide }), // Purple
		new THREE.MeshStandardMaterial({ color: 0xff1493, side: THREE.DoubleSide }), // Pink
		new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }), // Black
	  ]
	  );
const test = new Object(part_test);
test.self.position.x = 0;
test.self.position.y = 2;
test.self.position.z = 4;

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

//avatar
// : 
// null
// displayName
// : 
// null
// email
// : 
// "artclave@student.42bangkok.com"
// friends
// : 
// []
// id
// : 
// 1
// intra_avatar
// : 
// "https://cdn.intra.42.fr/users/b1f079d912cd28477c98a5f2ff4cccb3/artclave.jpg"
// intra_login
// : 
// "artclave"
// isOnline
// : 
// false
// losses
// : 
// 0
// username
// : 
// null
// wins
// : 

// enterScene is called in mounted() or onMounted().
export async function preEnterScene(app_container){
	//console.log("pre enter")
	let socket = new Socket();
	await socket.init();
	init_scene_state();
	if (!engine.sceneInitialized) {	
	//	console.log("add to engine...")
		//engine.add(test, false);
		engine.add(backBox, false);
		engine.add(mainSceneObj, true);
		engine.stateManager = stateManager;
		engine.sceneInitialized = true;
	}
	if (!engine.stateManager)
		engine.stateManager = stateManager
	engine.addContainerWrapper(app_container);
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
	if (engine.stateManager.currentState == null)
		{
			//console.log(engine.camera.position)
			//console.log("entering main state")
			engine.stateManager.changeState(0, true, 1);
			//console.log(engine.camera.position)
	
	
		}
	window.dispatchEvent(new Event("resize"));

	// document.body.focus()
	// engine.container.focus()
	// engine.container.parentElement.focus()
}

export function animate() {
	test.self.rotation.y += 0.01;
	if (!isAnimating) return ;
	//console.log("animate");
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
	document.body.removeEventListener("keydown", key_events)
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