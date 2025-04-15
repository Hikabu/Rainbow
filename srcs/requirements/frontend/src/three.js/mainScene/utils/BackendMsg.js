import { StateManager } from '../../core/stateManager/StateManager';
import { pongGame} from '../overlays/scenes/pong-game/Game'
import { end } from '../overlays/divs/tour_end';
import { matchmake } from '../overlays/divs/tour_matchamake';
import { create_redirection_alert } from '../overlays/alerts/redirection_warning';
import { join } from '../overlays/divs/tour_join';

export function msgRouter(event){
	const data = JSON.parse(event.data);
	if (!data)
		return ;
	if (data.type == "game update")
	{
		pongGame["receive"](data);
	}
	else if (data.type == "tour.updates")
	{
		for (const key of Object.keys(tourActions)) {
			if (key in data)
			{
				action = tourActions[key](data, new StateManager().currentState);
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
			"start game": () => {
				pongGame["new-round"](data["gameID"], data["userID"], data["game-type"]);
				state.changeSubstate(9);
			},
			"end game": () => {
				end["dynamic-content"](data);
				state.changeSubstate();
			},
			"waiting": () => state.changeSubstate(11)
		};
		return actions[data.update_display];
	},

	update_tour_registration: (data) => {
		const registrationActions = {
			create: () => {
				new StateManager().states[3].update_start_index(2, update_tour_registration_conditions);
			},
			join: () => {
				join["dynamic-content"](data);
				if ("button" in data) {
					new StateManager().states[3].update_start_index(4);
				}
			}
		};
		return registrationActions[data.update_tour_registration];
	},

	notification: (data) => {
		const notificationActions = {
			start: () => create_redirection_alert(data["length"] * 1000)
		};
		return notificationActions[data.notification];
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