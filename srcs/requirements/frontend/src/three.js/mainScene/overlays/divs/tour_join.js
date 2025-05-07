import { update } from "three/examples/jsm/libs/tween.module.js";
import { StateManager } from "../../../core/stateManager/StateManager";
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button, Input } from '../../../core/UIFactory/Elements';
import { Socket } from '../../utils/Socket'

let entryPrice = 100

const container = new Overlay([
	new FlexBox({
		dir: "column",
		id: "inner-div",
		children: [
			new FlexBox({
				dir: "column",
				padding: '10%',
				id : "prize-container",
				children: [
					new Text({
						id: "prize-context",
						content: `WIN UP TO `,
						fontsize: 1
					}),
				],
			}),
			new Text({
				content: "STARTS IN",
				fontSize: 0.45
			}),
			new Text({
				id: "timer",
				content: "TIMER",
				fontSize: 1
			}),
			new Text({
				id: "entryprice",
				content:  `entry ${entryPrice} ETC`,
				fontSize: 0.45
			}),
			new Button({
				id: "button",
				content: "JOIN",
				fontSize: 0.45,
				onClick : ()=>{
						if (get_button_type() == "JOIN")
						{
							new Socket().send({
								"channel":"tournament",
								"action":"join",
							})

						}
						
					}
			})
		]
	})	
])

function show_buttons(){
	container.getElementById("button").element.style.visibility = "visible";
}

function get_button_type(){
	return container.getElementById("button").element.textContent;
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

let offset, startTime, interval;
function dynamic_content(data){
	if ("prize_pool" in data)
	{
		let value = data["prize_pool"];
		if (value == 0)
			container.getElementById("prize-context").element.textContent = `TOURNAMENT !`;
		else
			container.getElementById("prize-context").element.textContent = `WIN UP TO ${value} ETC !`;
	}
	if ("button" in data){
		container.getElementById("entryprice").element.style.display = ""
		let new_content = data["button"];
		let button = container.getElementById("button").element;
		if (new_content == "join") button.textContent = "JOIN";
		else if (new_content == "subscribed")
		{
			button.textContent = "Subscribed";
			container.getElementById("entryprice").element.style.display = "none"
		}
		else if (new_content == "locked" && button.textContent != "Subscribed")  button.textContent = "LOCKED";
	}
	if ("now" in data && "start" in data){
		offset = new Date() - new Date(data.now);
		startTime = new Date(data.start);
		updateTimer();
		interval = setInterval(updateTimer, 500);
	}
}

let lastShown = null;
function updateTimer() {
	const now = new Date();
	const correctedNow = new Date(now - offset);
	const remaining = Math.floor((startTime - correctedNow) / 1000);
	if (remaining !== lastShown) {
		lastShown = remaining;

		const minutes = Math.floor(remaining / 60);
		const seconds = remaining % 60;
		container.getElementById("timer").element.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
	if (remaining == 0)
	{
		clearInterval(interval);
		move_on()
	}
	else if (remaining < 0)
	{
		clearInterval(interval);
		move_on()
	}
}

function move_on(){
	let state = new StateManager().states[3];
	if (state.currentSubstate == 4 || state.currentSubstate == 5)
	{
		state.changeSubstate(state.startIndex)
	}
}
const join = {
	"div" : container.element,
	"show-buttons" : show_buttons,
	"hide-buttons" : hide_buttons,
	"show-div" : show_div,
	"hide-div" : hide_div,
	"resize": ()=>{container.resize()},
	"dynamic-content" : dynamic_content,
	"get-button-type" : get_button_type,
	"keyHandler" : (event)=>{
		if (event.key === 'Enter'){
			if (get_button_type() == "JOIN")
			{
				new Socket().send({
					"channel":"tournament",
					"action":"join",
				})
			}
		}
		event.preventDefault();
		return undefined;
	}
}

export {join}