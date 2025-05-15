import { get_nav_id } from '../../../../components/nav_confirm';
import { StateManager } from '../../../core/stateManager/StateManager';
import { State } from '../../../core/stateManager/States';
import { FlexBox,Overlay } from '../../../core/UIFactory/DivElements';
import { fadeout } from '../../../core/UIFactory/effects';
import { Button,Text } from '../../../core/UIFactory/Elements';
import { SwitchButtons} from '../../../core/UIFactory/SwitchButtons';
import { stateManager } from '../../states/mainMenuState';
import { Socket } from '../../utils/Socket';
import { join } from '../divs/tour_join';
import { Alert, AlertManager } from './Alerts';
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
				content: "hello",
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
						content: "hello",
						onClick: ()=>{
							console.log("clicked exit")
							// console.log("clicked exit")
							new AlertManager().remove_latest_alert();
							can_exit = true;
							// console.log("exiting request");
							let nav_id = get_nav_id()
							console.log("ok, going to ", nav_id)
							document.getElementById(nav_id).click();
						},
					}),
				]
			})
		]

	})
	
]

let can_exit = false;

function create_exit_alert(info_message = null, exit_message = null){
		console.log("create exit alert!");
		// console.log("can exit is: ", can_exit)
		if (!info_message)
			info_message = "You will loose all progess"
		if (!exit_message)
			exit_message = "EXIT"
		children[0].childElements[1].element.textContent = info_message
		children[0].childElements[2].childElements[1].element.textContent = exit_message
	

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
	let duration = 13000;
	let length_in_s = 1;
	setTimeout(() => {
		// new AlertManager().remove_latest_alert(self);
		fadeout(self.div, length_in_s)
	}, duration - 3);
	
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