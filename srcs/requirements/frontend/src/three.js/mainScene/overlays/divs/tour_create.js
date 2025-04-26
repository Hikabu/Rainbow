import { StateManager } from "../../../core/stateManager/StateManager";
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button, Input } from '../../../core/UIFactory/Elements';
import { Socket } from '../../utils/Socket'

const container = new Overlay([
			new FlexBox({
				dir: "column",
				mainAxis: "space-around",
				crossAxis: "center",
				flex: 1,
				children: [
					new FlexBox({
						// padding: '10%',
						children: [
							new Text({
								content: "EPIC ONINE BATTLE",
								fontsize: 4
							}),
						],
					}),
					new Text({
						content: "PLAY TO EARN ETH!",
						fontSize: 1
					}),
					new Button({
						id: "button",
						content: "CREATE NEW TOURNAMENT",
						fontSize: 0.85,
						onClick: ()=>{
							new Socket().send({
								"channel":"tournament",
								"action":"create",
							})
						}
					})
			 ]
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



const create = {
	"div" : container.element,
	"show-buttons" : show_buttons,
	"hide-buttons" : hide_buttons,
	"show-div" : show_div,
	"hide-div" : hide_div,
	"resize": ()=>{container.resize()},
}

export {create}
