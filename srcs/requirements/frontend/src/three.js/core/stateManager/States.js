import { MainEngine } from '../../mainScene/utils/MainEngine';
import { moveCamera } from './cameraMovement';
import { StateManager } from './StateManager';
import { localMachineObj } from '../../mainScene/objects/machines/localMachineObj';
class State {
    constructor(name, cameraMovement, substates = [], enterState = ()=>{}, exitState=()=>{}, materials) {
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
		this.blockedIndex = this.substates.length;
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
	enter() {
		this.enterState();
		this.changeSubstate(this.currentSubstateIndex + 1, false);
		if (this.cameraMovement)
			moveCamera(this.cameraMovement, () =>{
				this.currentSubstate.postCamEnter();
			})
	}
	exit() {
		if (this.exitState() == "cancelled" || this.currentSubstate.exit() == "cancelled")
			return 'cancelled';
		this.changeSubstate(this.startIndex, false);
	}
	handleKeyPress(event) {
		const view = this.currentSubstate?.handleKeyPress(event);
		if (view && view.change === "substate")
			this.changeSubstate(view.index || undefined);
		return view;
    }
    resize() { this.currentSubstate?.resize(); }
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