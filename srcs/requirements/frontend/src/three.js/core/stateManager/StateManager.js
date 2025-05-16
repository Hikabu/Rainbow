import * as THREE from 'three';
import { MainEngine } from '../../mainScene/utils/MainEngine';
import router from '../../../router';
class StateManager {
    constructor(states = []) {
		if (StateManager.instance)
			return StateManager.instance;
        this.states = states;
		this.currentState = null;
		this.forcedRedirect = false;
		StateManager.instance = this;
	}
	get_index_for(name){
		for (let i = 0; i < this.states.length; i++)
		{
			if (this.states[i].name == name)
				return i;
		}
		return -1;
	}
	route_to(index){
		console.log("routing request ", index)
		if (index >= this.states.length)
			index = 0;
		else if (index < 0)
			index = this.states.length - 1
		console.log("set routing request ", index)
		this.states[index].route_to()
	}
    changeState(index = this.currentStateIndex + 1, shouldPushHistory = true, slow = 0) {
        if (this.currentStateIndex == index || index < 0)
		{
			console.log("will not enter...")
			return;
		}
		this.scheduledStateIndex = index;
		if (this.currentState && this.currentState.exit() == "cancelled" && !this.forcedRedirect)
			return "cancelled";
		if (index >= this.states.length)
			index = 0;
        this.currentStateIndex = index;
        this.currentState = this.states[this.currentStateIndex];
		// if (shouldPushHistory && isClick)
		// {
		// 	console.log("pushing history..")
			
		// 	// const path = `/${this.currentState.name}`;
		// 	// window.history.pushState(null, '', path);
		// 	// router.push(`/${this.currentState.name}`);
		// }
		this.setAllowedDirection();
        this.currentState.enter(slow);
		console.log("enter state ", this.currentState.name)
    }
	setAllowedDirection(){
		if (this.currentStateIndex === 0)
			this.allowedDirection = 1;
		else
			this.allowedDirection = 0;
	}
    handleKeyPress(event) {
		const view = this.currentState?.handleKeyPress(event);
		if (view && view.change === "state")
			this.changeState(view.index || undefined);
    }
    resize() {
		this.states.forEach(state => {
		state.resize();
	});
}
	animate() { 
		this.states.forEach(state => {
			state.animate();
		});
	}
	isActive() { return this.currentState?.isActive(); }
	which() {console.log("state: ", this.currentStateIndex, this.currentState.name, "substate: ", this.currentState.currentSubstateIndex, this.currentState.currentSubstate?.name);}
}

export { StateManager }