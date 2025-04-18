import { StateManager } from '../../core/stateManager/StateManager';
import { pongGame} from '../overlays/scenes/pong-game/Game'
import { end } from '../overlays/divs/tour_end';
import { matchmake } from '../overlays/divs/tour_matchamake';
import { create_redirection_alert } from '../overlays/alerts/redirection_warning';
import { join } from '../overlays/divs/tour_join';

export function msgRouter(event){
	const data = JSON.parse(event.data);
	// console.log("data: ", data);
	if (!data)
		return ;
	if (data.type == "game.updates")
	{
		pongGame["new-round"](data["gameID"], data["game-type"]);
		if (new StateManager().currentState.name == "tour game screen")
		{
			console.log("its tour game")
			new StateManager().currentState.changeSubstate(9);
		}
		else
			console.log("state name: ", new StateManager().currentState.name)
	}
	if (data.type == "live.game.updates")
	{
		pongGame["receive"](data);
	}
	else if (data.type == "tour.updates" || data.type == "consumer.updates")
	{
		console.log("received: ", data)
		for (const key of Object.keys(tourActions)) {
			if (key in data)
			{
				let action = tourActions[key](data, new StateManager().currentState);
				if (action)
					action();
				break;
			}
		}
	}
}

const tourActions = {
	update_display: (data, state) => {
		const actions = {
			"pay": () => {
				state.changeSubstate();
				state.currentSubstate.data["tour_id"] = data["tour_id"];
			},
			"refund": () => state.changeSubstate(7),
			"matchmaking rounds": () => {
				matchmake["dynamic-content"](data);
				state.changeSubstate(8);
			},
			"end game": () => {
				end["dynamic-content"](data);
				state.changeSubstate(10);
			},
			"waiting": () => {
				console.log("update waiting...")
				state.changeSubstate(11)
			}
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
			}
		};
		return registrationActions[data.update_tour_registration] ?? null;
	},

	notification: (data) => {
		const notificationActions = {
			"start": () => create_redirection_alert(data["length"] * 1000)
		};
		return notificationActions[data.notification] ?? null;
	}
};

function update_tour_registration_conditions(){
	if (join['get-button-type']() == "Subscribed")
		return false;
	if (new StateManager().currentStateIndex == 3 &&
	new StateManager().currentState.currentSubstateIndx >= 6)
		return false;
	return true;
}