import { StateManager } from '../../core/stateManager/StateManager';
import { pongGame} from '../overlays/scenes/pong-game/Game'
import { end } from '../overlays/divs/tour_end';
import { matchmake } from '../overlays/divs/tour_matchamake';
import { create_redirection_alert, delete_redirection_alert, fadeout_redirection_alert } from '../overlays/alerts/redirection_warning';
import { join } from '../overlays/divs/tour_join';
import { State } from '../../core/stateManager/States';
import { MainEngine } from './MainEngine';
import { OnLoad } from './OnLoad';
import { stateManager } from '../states/mainMenuState';
import { AlertManager } from '../overlays/alerts/Alerts';
import { create_info_alert } from '../overlays/alerts/info_alert';

export function msgRouter(event){
	const data = JSON.parse(event.data);
	//console.log("data: ", data);
	if (!data)
		return ;
	if (data.type == "switch tabs")
	{
		//console.log("SWITCH TABS")
	}
	if ("error" in data && data["error"] == "player disconnected" && (stateManager.currentStateIndex == 1 || stateManager.currentStateIndex == 2))
	{
		let stateManager = new StateManager()
		stateManager.forcedRedirect = true;
		//console.log("you exited the game");
		create_info_alert("you exited on another tab")
		stateManager.changeState(0);
		stateManager.forcedRedirect = false;
	}
	if (data.type == "game.updates")
	{
		if ("update_display" in data)
		{
			let stateManager = new StateManager()
			if (data["update_display"] == "start game")
			{
				//console.log("start game backend msg received ...")
				pongGame["start_game"](data["gameID"]);
				if (stateManager.currentStateIndex == 3)
				{
					//touranments go directly to game...
					stateManager.currentState.changeSubstate(10);
				}
				else
				{
					//non remote wait for after controls to join... 
					stateManager.currentState.changeSubstate();
				}
				return;
			}
			if (data["update_display"] == "controls")
			{
				//console.log("now in ", stateManager.currentStateIndex , "request to: ", data["state"])
				if (stateManager.currentStateIndex != data["state"])
					stateManager.changeState(data["state"])
				stateManager.currentState.changeSubstate(2)

			}
			if (data["update_display"] == "already_in_game")
			{
				// console.log("already in game, can not register")
			}
		}
		if ("state" in data && data["state"] == "player names" && data["total_players"] == 2)
		{
			let stateManager = new StateManager()
			if (stateManager.currentStateIndex == 3
				&& stateManager.currentState.currentSubstateIndex != 11)
				stateManager.currentState.changeSubstate(11)
		}
		pongGame["receive"](data);
	}
	else if (data.type == "tour.updates" || data.type == "consumer.updates")
	{
		// console.log("received: ", data)
		for (const key of Object.keys(tourActions)) {
			if (key in data)
			{
				let action = tourActions[key](data);
				if (action)
					action();
					break;
			}
		}
	}
	else if (data.type == "ready"){
		// console.log("ready!")
		const onLoad = new OnLoad();
		if ("state" in data && "substate" in data)
		{
			// console.log("udating substate ... ")
			onLoad.reconnecting = true
			stateManager.changeState(data["state"], true, -1);
			stateManager.currentState.changeSubstate(data["substate"])
			onLoad.reconnecting = false
		}
		//logic here 
		onLoad.set_socket_ready()
	}
}

const tourActions = {
	update_display: (data) => {
		const state = new StateManager().states[3];
		const actions = {
			"pay": () => {
				if (new StateManager().currentStateIndex == 3)
				{
					state.changeSubstate(6);
					state.currentSubstate.data["tour_id"] = data["tour_id"];
				}
			},
			"refund": ()=> {
				// console.log("refunding ...");
				if (new StateManager().currentStateIndex != 3)
					create_info_alert("Tournament was cancelled. You will be refunded", 5)
				else
					state.changeSubstate(7);

			},
			"controls": ()=>{
				if (new StateManager().currentStateIndex == 3)
				{
					// console.log("switch to controls")
					state.changeSubstate(8);
				}
			},
			"matchmaking rounds": () => {
				if (new StateManager().currentStateIndex == 3)
				{
					matchmake["dynamic-content"](data);
					state.changeSubstate(9);
				}
			},
			"waiting": () => {
				if (new StateManager().currentStateIndex == 3)
				{
					// console.log("update waiting...")
					state.changeSubstate(10)
				}
			},
			"start game": () => {
				if (new StateManager().currentStateIndex == 3)
				{
					// console.log("update game...")
					state.changeSubstate(11)
				}
			},
			"end game": () => {
				if (new StateManager().currentStateIndex == 3)
				{
					// console.log("request to end touranment screen")
					end["dynamic-content"](data);
					state.changeSubstate(12);
				}
			},
		};
		return actions[data.update_display] ?? null;
	},

	update_tour_registration: (data) => {
		const registrationActions = {
			"create": () => {
				new StateManager().states[3].update_start_index(2, update_tour_registration_conditions);
			},
			"join": () => {
				join["dynamic-content"](data);
				if ("button" in data) {
					new StateManager().states[3].update_start_index(4);
				}
			},
			"exit redirection alert":()=>{
				// console.log("delte redirection alert")
				delete_redirection_alert()
			},
		};
		return registrationActions[data.update_tour_registration] ?? null;
	},

	notification: (data) => {
		const notificationActions = {
			"start": () => create_redirection_alert(),
			"fadeOut": ()=> fadeout_redirection_alert(data["length"]),
		};
		return notificationActions[data.notification] ?? null;
	}
};

function update_tour_registration_conditions(){
	if (join['get-button-type']() == "Subscribed")
		return false;
	if (new StateManager().currentStateIndex == 3 &&
	new StateManager().currentState.currentSubstateIndex >= 7)
		return false;
	return true;
}