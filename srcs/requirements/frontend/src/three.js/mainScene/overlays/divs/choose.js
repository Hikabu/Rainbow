import { StateManager } from "../../../core/stateManager/StateManager";
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button, Input } from '../../../core/UIFactory/Elements';
import { Socket } from '../../utils/Socket'

const container = new Overlay([
			new FlexBox({
				dir: "column",
				mainAxis: "space-around",
				flex: 1,
				marginBottom : "20%",
				marginTop: "20%",
				children: [
					new Button({
						id: "button-game",
						content: "START GAME ",
						fontSize: 0.85,
						onClick: ()=>{
							let state = new StateManager().currentState;
							state.changeSubstate(state.currentIndex + 2)
						}
					}),
					new Button({
						id: "button-demo",
						content: "HOW TO PLAY",
						fontSize: 0.85,
						onClick: ()=>{
							new StateManager().currentState.changeSubstate();
						}
					}),
				],
			}),
		])



function show_buttons(){
	container.getElementById("button-game").element.style.visibility = "visible";
	container.getElementById("button-demo").element.style.visibility = "visible";
}

function hide_buttons(){
	container.getElementById("button-game").element.style.visibility = "hidden";
	container.getElementById("button-demo").element.style.visibility = "visible";
}

function show_div(){
	container.element.style.visibility = "visible";
	show_buttons();
}

function hide_div(){
	container.element.style.visibility = "hidden";
	hide_buttons();
}

const start = {
	"div" : container.element,
	"show-div" : show_div,
	"hide-div" : hide_div,
	"resize": ()=>{container.resize()},
}

export {start}
