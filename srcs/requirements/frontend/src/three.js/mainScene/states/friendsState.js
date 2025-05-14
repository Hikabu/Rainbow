
import { State } from '../../core/stateManager/States';
import { SubState } from '../../core/stateManager/SubStates';
import * as THREE from 'three';
import { SphereGroup } from '../objects/friends/sphere';
import { SubsurfaceScatteringShader } from 'three/examples/jsm/Addons.js';
import { StateManager } from '../../core/stateManager/StateManager';
import { button, friends_machine } from '../objects/friends/friendMachine';
import { MainEngine } from '../utils/MainEngine';
const sphereGroup = new SphereGroup()
await sphereGroup.init()

export let background_friends = true;
const display_null = new SubState(
	"rest",
	null,
	null, 
	()=>{
		sphereGroup.change_motion("spin")
		sphereGroup.random_position()
		sphereGroup.instanceGroup.forEach(sp=>sp.hideAvatar(0))
	},
	null,
	null,
	null,
	null, 
	()=>{sphereGroup.animate()},
)

const display_pics = new SubState(
	"rest-display",
	null,
	null,
	null,
	()=>{
		sphereGroup.instanceGroup.forEach(sp=>sp.showAvatar(0.5))
		sphereGroup.change_motion("spin")
		sphereGroup.resize()
	},
	null,
	()=>{sphereGroup.resize()},
	(event)=>{
			if (event.key === 'Enter') {
				event.preventDefault();
				new StateManager().currentState.changeSubstate(2)	
			}
			return undefined;
		}, 
	()=>{

		sphereGroup.animate();
		// const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
		// console.log("p: ", button)
		// console.log("p: ", button.basePart)
		// console.log("p ", button.basePart.self)
		// console.log("p ", button.basePart.self.children[0])
		// console.log("p ", button.basePart.self.children[0].material)


		//button.basePart.self.children.forEach(s=> s.material.emissiveIntensity = 0.5 + pulse * 1.5); 
	},
)

const scroll = new SubState(
	"scroll",
	null, 
	null,
	()=>{
	//	button.basePart.self.material.color = 0x00ff00
		sphereGroup.instanceGroup.forEach(sp=>sp.showAvatar(0.5))
		sphereGroup.scroll_position()
	},
	()=>{
	//	button.basePart.self.material.color = 0xff0000
	},
	()=>{
		sphereGroup.random_position(true)
	},
	()=>{sphereGroup.resize()},
	(event)=>{
		if (event.key === 'Enter') {
			event.preventDefault();
			new StateManager().currentState.changeSubstate(1)	
		}
		if (event.key == "ArrowUp")
		{
			sphereGroup.scroll_position(1)
		}
		if (event.key == "ArrowDown")
		{
			sphereGroup.scroll_position(-1)
		}
		return undefined;
	}, 
	()=>{
		sphereGroup.animate()
	},
)

const friendState = new State(
	"friends",
	{
		pos: true,
		duration: 2,
		ease: "power2.inOut",
	},
	()=>{
		background_friends = false;
	},
	[
		display_null,
		display_pics,
		scroll,
	],
	()=>{
		sphereGroup.resize()
		sphereGroup.self.position.set(0, 0, 0)
		sphereGroup.instanceGroup.forEach(sp=>sp.showAvatar(0.3))
	},
	()=>{
		sphereGroup.instanceGroup.forEach(sp=>sp.hideAvatar())
		sphereGroup.random_position(true)
		background_friends = true;
	},
	null, 
	friends_machine.self,
	new THREE.Vector3(0, 0, -1),
	1.5,
)

export {friendState}