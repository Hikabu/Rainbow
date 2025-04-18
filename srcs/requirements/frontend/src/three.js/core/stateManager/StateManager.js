import * as THREE from 'three';
import { MainEngine } from '../../mainScene/utils/MainEngine';

class StateManager {
    constructor(states = []) {
		if (StateManager.instance)
			return StateManager.instance;
        this.states = states;
		if (this.states.length > 0) this.changeState(0, true, true);
		this.forcedRedirect = false;
        new MainEngine().container.addEventListener('keydown', (event) => this.handleKeyPress(event));
		StateManager.instance = this;
	}
    changeState(index = this.currentStateIndex + 1, shouldPushHistory = true, slow = false) {
        if (this.currentStateIndex == index || index < 0)
			return;
		this.scheduledStateIndex = index;
		if (this.currentState && this.currentState.exit() == "cancelled" && !this.forcedRedirect)
			return "cancelled";
		if (index >= this.states.length)
			index = 0;
        this.currentStateIndex = index;
        this.currentState = this.states[this.currentStateIndex];
		if (shouldPushHistory)
			window.history.pushState({ num : this.currentStateIndex }, '', window.location.href);
		this.setAllowedDirection();
		console.log("slow ? ", slow);
        this.currentState.enter(slow);
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