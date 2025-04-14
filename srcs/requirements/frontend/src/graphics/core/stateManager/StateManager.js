import * as THREE from 'three';
import { MainEngine } from '../../mainScene/utils/MainEngine';
import { EventBus } from '../../mainScene/utils/EventBus';

class StateManager {
    constructor(states = []) {
		if (StateManager.instance)
			return StateManager.instance;
        this.states = states;
		if (this.states.length > 0) this.changeState(0);
		this.forcedRedirect = false;
        new MainEngine().container.addEventListener('keydown', (event) => this.handleKeyPress(event));
		window.addEventListener('popstate', (event) => {
			if (event.state)
				this.changeState(event.state.num, false);
		  });
		StateManager.instance = this;
		EventBus.on('tour.update.display', (data) => this.updateTourSubState(data));
    	EventBus.on('tour.update.registration', (data) => this.updateTourRegistration(data));
    	EventBus.on('tour.notification', (data) => this.notification(data));
	}
	updateTourSubState(data) {
		if (data.update_display == "pay") {
		  this.currentState.changeSubstate();
		  this.currentState.currentSubstate.data["tour_id"] = data["tour_id"];
		}
		// More cases...
	  }
	
	  updateTourRegistration(data) {
		if (data.update_tour_registration == "create") {
		  this.states[3].update_start_index(2, update_tour_registration_conditions);
		}
		// More cases...
	  }
	
	  notification(data) {
		if (data["notification"] == "start") {
		  create_redirection_alert(data["length"] * 1000);
		}
	  }
    changeState(index = this.currentStateIndex + 1, shouldPushHistory = true) {
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
        this.currentState.enter();
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