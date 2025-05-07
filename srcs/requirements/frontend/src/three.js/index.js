import * as THREE from 'three';

import { wheel_scroll_animations } from './core/stateManager/cameraMovement';
import { StateManager } from './core/stateManager/StateManager';
import { mainScene,stateManager } from './mainScene/states/mainMenuState';
import { MainEngine } from './mainScene/utils/MainEngine';
import { Socket } from './mainScene/utils/Socket';

const engine = new MainEngine();

let isAnimating = false;

// console.log("TEST PART");
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

// enterScene is called in mounted() or onMounted().
export async function preEnterScene(app_container){
	console.log("pre enter")
	let socket = new Socket();
	await socket.init();
	init_scene_state();
	engine.add(mainScene, true);
	engine.stateManager = stateManager;
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
	let scene = engine.scene;
	while (scene.children.length > 0)
	{
		const child = scene.children[0];
		if (child.isMesh) {
			if (child.geometry) child.geometry.dispose();
			if (Array.isArray(child.material)) {
				child.material.forEach(mat => mat.dispose());
			} else if (child.material) {
				child.material.dispose();
			}
		}
		scene.remove(child);
	}

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