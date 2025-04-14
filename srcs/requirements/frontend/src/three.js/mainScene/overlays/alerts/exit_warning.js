import { StateManager } from '../../../core/stateManager/StateManager';
import { State } from '../../../core/stateManager/States';
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button } from '../../../core/UIFactory/Elements';
import { SwitchButtons} from '../../../core/UIFactory/SwitchButtons';
import { Socket } from '../../utils/Socket';
import { join } from '../divs/tour_join';
import { Alert, AlertManager } from './Alerts';

const children = [
	new FlexBox({
		dir: "column",
		mainAxis: "spaced-out",
		children:
		[
			new Text({
				content: "ARE YOU SURE ?",
				fontSize: 1,
				marginBot: "4%",
			}),
			new Text({
				content: "You will loose all progress",
				fontSize: 0.55,
				marginBot: "4%",
			}),
			new FlexBox({
				dir: "row",
				width: "80%",
				mainAxis: "space-between",
				children: [
					new Button({
						id : "button-stay",
						fontSize: 0.85,
						content: "STAY",
						onClick: ()=>{
							new AlertManager().remove_latest_alert("exit_alert");
						},
					}),
					new Button({
						id : "button-exit",
						fontSize: 0.85,
						content: "EXIT",
						onClick: ()=>{
							new AlertManager().remove_latest_alert("exit_alert");
							can_exit = true;
							new StateManager().changeState(new StateManager().scheduledStateIndex)
						},
					}),
				]
			})
		]

	})
	
]
let can_exit = false;
function create_exit_alert(){
		if (can_exit)
		{
			can_exit = false;
			return ("continue");
		}
		if (new AlertManager().add_alert(exit_alert) == "overrun")
			return ("continue")
		return ("cancelled")
}

function enter(){
	setTimeout(() => {
			new AlertManager().remove_latest_alert("exit_alert");
		}, 4000);//60s
}
function exit(){

}

const exit_alert = new Alert("exit_alert", children, "warning", 0, enter, exit, false);

export {create_exit_alert}