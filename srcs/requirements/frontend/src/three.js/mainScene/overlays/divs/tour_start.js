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
					new FlexBox({
						children: [
							new Text({
								content: "ONLINE TOURNAMENT",
								fontsize: 4
							}),
						],
					}),
					],
				}),
			 new Button({
				id: "button",
				content: "loading . . .",
				fontSize: 0.85,
			})
		])



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



const start = {
	"div" : container.element,
	"show-buttons" : show_buttons,
	"hide-buttons" : hide_buttons,
	"show-div" : show_div,
	"hide-div" : hide_div,
	"resize": ()=>{container.resize()},
}

export {start}
