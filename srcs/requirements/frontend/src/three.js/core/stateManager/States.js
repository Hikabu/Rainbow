import { MainEngine } from '../../mainScene/utils/MainEngine';
import { moveCamera } from './cameraMovement';
import { StateManager } from './StateManager';
import { get_camera_animation, fitCameraToObject } from './cameraMovement';
import * as THREE from 'three';

class State {
    constructor(name, cameraMovement, slowCameraMovement, substates = [], enterState = ()=>{}, exitState=()=>{}, materials, targetObject, targetNormal, targetPadding = 1.25) {
        this.name = name;
		this.cameraMovement = cameraMovement;
        this.substates = substates;
		this.enterState = enterState || (()=>{});
		this.exitState = exitState || (()=>{});
		this.materials = materials;
		this.materialIndex = -1;
		this.changeSubstate(0);
		this.startIndex = 0;
		this.data = {}
		this.targetObject = targetObject
		this.targetNormal = targetNormal
		this.targetPadding = targetPadding
		this.blockedIndex = this.substates.length;
		this.slowCameraMovement = slowCameraMovement
    }
	addSubstate(substates){
		if (!(Array.isArray(substates)))
			this.substates.push(substates)
		else
		{
			for (let i = 0; i < substates.length; i++)
				this.substates.push(substates[i]);
		}
		if (! this.currentSubstate)
			this.changeSubstate(0);
	}
	changeSubstate(index = this.currentSubstateIndex + 1, postCam = true) {
        if (this.currentSubstate && this.currentSubstate.exit() == "cancelled" && new StateManager().forcedRedirect == false)
			return "cancelled";
		if (index >= this.substates.length) index = 0;
        this.currentSubstateIndex = index;
        this.currentSubstate = this.substates[this.currentSubstateIndex];
		if (this.materialIndex != this.currentSubstate.materialIndex)
		{
			this.materialIndex = this.currentSubstate.materialIndex;
			this.currentSubstate.surface.material = this.materials[this.materialIndex];
		}
		this.currentSubstate.enter();
		if (postCam)
			this.currentSubstate.postCamEnter();
    }
	get_camera_position(){
		return fitCameraToObject(this.targetObject, this.targetNormal, this.targetPadding);
	}
	enter(slow) {
		this.enterState();
		this.changeSubstate(this.currentSubstateIndex + 1, false);
		if (slow  == 1 && this.slowCameraMovement)
		{
			// console.log("slow camera movement...")
			moveCamera(this.slowCameraMovement, this.get_camera_position(),
			() =>{
				this.currentSubstate.postCamEnter();
			})
		}
		else if (slow == 0 && this.cameraMovement)
		{
			// console.log("fast camaera movement")
			moveCamera(this.cameraMovement,this.get_camera_position(), 
			() =>{
				this.currentSubstate.postCamEnter();
			})
		}
		else if (slow == -1)
		{
			// console.log("no camera movement")
			new MainEngine().camera.position.copy(this.get_camera_position());
			this.currentSubstate.postCamEnter();
		}
	}
	exit() {
		if (this.exitState() == "cancelled" || this.changeSubstate(this.startIndex, false) == "cancelled")
			return 'cancelled';
		//this.changeSubstate(this.startIndex, false);
	}
	handleKeyPress(event) {
		const view = this.currentSubstate?.handleKeyPress(event);
		if (view && view.change === "substate")
			this.changeSubstate(view.index || undefined);
		return view;
    }
    resize() {
		// if (get_camera_animation() == false)
		// 	new MainEngine().camera.position.copy(fitCameraToObject(this.targetObject, this.targetNormal, this.targetPadding));
		this.currentSubstate?.resize(this.object); 
	}
	animate() { this.currentSubstate?.animate(); }
	isActive() { return this.currentSubstate?.active; }
	update_start_index(index, should_update = ()=>{return true}){
		if (this.startIndex == index)
			return ;
		//this up was commened before...
		if (this.currentSubstateIndex < this.blockedIndex && should_update())
		{
			if (this.currentSubstateIndex % 2 == 0)
				this.changeSubstate(index)
			else
				this.changeSubstate(index + 1)
		}
		this.startIndex = index;
	}
}

export { State }