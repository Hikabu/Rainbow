import { StateManager } from '../../../core/stateManager/StateManager';
import { State } from '../../../core/stateManager/States';
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button } from '../../../core/UIFactory/Elements';
import { SwitchButtons} from '../../../core/UIFactory/SwitchButtons';
import { Socket } from '../../utils/Socket';
import { join } from '../divs/tour_join';
import { Alert, AlertManager } from './Alerts';
import { fadeout } from '../../../core/UIFactory/effects';
import { stateManager } from '../../states/mainMenuState';

const children = [
	new FlexBox({
		marginTop: "4%",
		marginBottom: "4%",
		dir: "column",
		mainAxis: "spaced-out",
		children:
		[
			new Text({
				content: "ARE YOU SURE ?",
				fontSize: 1,
				marginBot: "8%",
			}),
			new Text({
				content: "You will loose all progress",
				fontSize: 0.55,
				marginBot: "8%",
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
							// console.log("clicked stay")
							new AlertManager().remove_latest_alert();
						},
					}),
					new Button({
						id : "button-exit",
						fontSize: 0.85,
						content: "EXIT",
						onClick: ()=>{
							// console.log("clicked exit")
							new AlertManager().remove_latest_alert();
							can_exit = true;
							// console.log("exiting request");
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
		console.log("create exit alert!");
		// console.log("can exit is: ", can_exit)
		if (new StateManager().forcedRedirect == true)
		{
			console.log("dorced redirect!")
			return ("continue")
		}
		const alertManager = new AlertManager();
		if (can_exit)
		{
			 console.log("can exit is true will allow it....");
			can_exit = false;
			// console.log("can exit is: ", can_exit)
			return ("continue");
		}
		if (alertManager.currentAlert && alertManager.currentAlert.id == "exit alert")
			return("cancelled")
		if (alertManager.add_alert(new Alert("exit alert", children, "warning", 0, enter, exit, false)) == "overrun")
		{
			console.log("created alert but its overrun ... so you can go");
			// console.log("can exit is: ", can_exit)
			return ("continue");
		}
		// console.log("can exit is: ", can_exit)
		console.log("can not continue");
		return ("cancelled")
}

function enter(self) {
	let duration = 5000;
	let length_in_s = 1;
	setTimeout(() => {
		// new AlertManager().remove_latest_alert(self);
		fadeout(self.div, length_in_s)
	}, 5000);
	
	setTimeout(() => {
			// console.log("remove latest alert timeout")
			const alertManager = new AlertManager();
			if (alertManager.currentAlert && alertManager.currentAlert == self)
				new AlertManager().remove_latest_alert();
		}, duration + (length_in_s * 1000));
}
//
function exit(){
	
}
export {create_exit_alert}