import { StateManager } from "../../../core/stateManager/StateManager";
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button, Input } from '../../../core/UIFactory/Elements';
import { Socket } from '../../utils/Socket'

const container = new Overlay([
			new FlexBox({
				dir: "column",
				mainAxis: "space-around",
				flex: 1,
				children: [
					new Text({
						content: "Tournament was cancelled",
						fontSize: 0.75
					}),
					new Text({
						content: "You will be refunded",
						fontSize: 0.85
					}),
					new Text({
						content: "Please bear in mind that refunds may take some time (up to 30 minutes) to go through to your account...",
						fontSize: 0.55
					}),
			 new Button({
				id: "button",
				content: "GO BACK",
				fontSize: 0.35,
				onClick: ()=>{ go_back();}
			})
		]})
	])

let allowed_to_exit;

function go_back(){

	let stateManager = new StateManager();
	allowed_to_exit = true;
	stateManager.currentState.changeSubstate(stateManager.currentState.startIndex + 1);
}
function enter(){
	allowed_to_exit = false;
	setTimeout(() => {
		if (allowed_to_exit == false)
			go_back();
	}, 60000);
}

function exit_return(){
	if (allowed_to_exit == false)
		return "cancelled";
}

		
function show_buttons(){
	container.getElementById("button").element.style.visibility = "visible";
}

function hide_buttons(){
	container.getElementById("button").element.style.visibility = "hidden";
}

function show_div(){
	container.element.style.visibility = "visible";
}

function hide_div(){
	container.element.style.visibility = "hidden";
	hide_buttons();
}

const refund = {
	"div" : container.element,
	"show-buttons" : show_buttons,
	"hide-buttons" : hide_buttons,
	"show-div" : show_div,
	"hide-div" : hide_div,
	"enter" : enter,
	"exit_return" : exit_return,
	"resize": ()=>{container.resize()},
}

export {refund}
