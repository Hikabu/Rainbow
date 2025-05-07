import { StateManager } from "../../../core/stateManager/StateManager";
import { State } from "../../../core/stateManager/States";
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button, Input } from '../../../core/UIFactory/Elements';
import { Socket } from '../../utils/Socket'
import { OnLoad } from "../../utils/OnLoad";
const container = new Overlay([
			new FlexBox({
				dir:"column",
				mainAxis: "space-between",
				flex: 1,
				width: "100%",
				height: "100%",
				marginTop: "5%, auto",
				children: [
					new FlexBox({
						id: "controls"
					}),
					new FlexBox({
						width: "100%",
						dir: "row",
						mainAxis: "end",
						children: [
							new Button({
								width: "100%",
								id: "button",
								content: "PLAY",
								fontSize : 0.55,
								onClick: ()=>{
									log_game();
								}
							})
						]
					}),
				]
			})
		])
function box_style(element){
	element.style.display = "flex";
	element.style.aspectRatio = 1;
	element.style.justifyContent = "center";
	element.style.alignItems = "center";
	// element.style.width = "100%";
	element.style.height = "70%";
	element.style.margin = "5%, auto";
	element.style.border = "2px solid #ccc";
	element.style.borderRadius = "8px";
	element.style.background = "#f9f9f9";
	element.style.boxShadow = "0 4px #aaa";
	element.style.fontSize = "1rem";
	element.style.fontFamily = "sans-serif";
	element.style.transition = "all 0.1s ease";
	// element.style.transform = "scale(0.5)"; // scale to 80%
}

function box_pressed(element){
	element.style.transform = "translateY(4px)";
	element.style.boxShadow = "0 0 #aaa";
	element.style.backgroundColor = "#e0e0e0";
	setTimeout(() => {
		element.style.transform = "translateY(0)";
		element.style.boxShadow = "0 4px #aaa";
		element.style.backgroundColor = "#f9f9f9";
	  }, 150);

}
let boxes = []
function get_controls_tab(title, up, down){
	if (up == "arrow up")
		up = "\u2191";
	if (down == "arrow down")
		down = "\u2193";
	let controls = new FlexBox({
		flex: 1,
		width: "100%",
		dir: "column",
		mainAxis: "center",
		marginBottom: "2%, auto%",
		children: [
			new Text({
				content: title,
				fontSize: 0.85,
				marginBottom: "1%, auto",
			}),
			new FlexBox({
				dir: "row",
				crossAxis: "center",
				width: "100%",
				mainAxis: "space-around",
				children: [
					new Text({
						content: "Up",
						fontSize: 0.65,
					}),
					new FlexBox({
						id: "up-box",
						children: [
							new Text({
								color: "black",
								content: up,
								fontSize: 0.45,
								marginLR: "2%, auto",
							}),
						]
					}),
					new Text({
						content: "Down",
						fontSize: 0.65,
						marginLR: "2%, auto",
					}),
					new FlexBox({
						id: "down-box",
						children: [
							new Text({
								color: "black",
								content: down,
								fontSize: 0.45,
							}),
						]
					})
				]
			})
		]
	});
	box_style(controls.getElementById("down-box").element);
	box_style(controls.getElementById("up-box").element);
	boxes.push(controls.getElementById("down-box").element);
	boxes.push(controls.getElementById("up-box").element);
	return controls;
}

let new_controls, interval;
function enter(type){
	// console.log("enter controls ... type: ", type)
	if (type == "local")
	{
		new_controls = new FlexBox({
			flex: 1,
			dir: "column",
			id: "controls",
			marginTop: "8%, auto",
			marginBottom: "8%, auto",
			// crossAxis: "center",
			mainAxis: "center",
			children: [
				get_controls_tab( "Left Player", "W", "S"),
				get_controls_tab( "Right Player", "arrow up", "arrow down")
			]
		});
	}
	else if (type == "ai"){
		new_controls = new FlexBox({
			flex: 1,
			dir: "column",
			id: "controls",
			//mainAxis: "center",
			children: [
				get_controls_tab( "Player (left)", "arrow up", "arrow down"),
			]
		});
	}
	else if (type == "remote"){
		new_controls = new FlexBox({
			flex: 1,
			dir: "column",
			id: "controls",
			//mainAxis: "center",
			children: [
				get_controls_tab( "PADDLE CONTROLS", "arrow up", "arrow down"),
			]
		});	
	}
	container.getElementById("controls").replaceWith(new_controls)	
	 // update reference
	//container.getElementById("controls").children = new_controls.children;
	show_div();
	let stable_i = 0, i =0;
	interval = setInterval(()=>{
		if (boxes.length > 2)
			i = Math.floor(Math.random() * boxes.length);
		else
			i = (i + 1) % 2;
		box_pressed(boxes[i]);
	}, 1000);
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
}

function exit(){
	clearInterval(interval);
	new_controls.element.replaceWith(container.getElementById("controls").element)
	hide_div();
}

container.element.style.visibility = "hidden";

function log_game(){
	console.log("log game")
	let stateManager = new StateManager()
	let type = stateManager.currentStateIndex == 1 ? "local" : stateManager.currentStateIndex == 2 ? "AI" : stateManager.currentStateIndex == 3 ? "remote" : "unkown";
	if ( new OnLoad().reconnecting == false)
	{
		console.log("sending to socket log game request")
		let alias1 = "alias0";
		let alias2 = type == "AI" ? "computer" : alias1 != "oponent" ? "oponent" : "player_2" ;
		new Socket().send({
			"channel" : "log",
			"action" : "new_game",
			"type" : type,
			"userID1" : new Socket().userID,
			"alias1" : alias1,
			"alias2" : alias2,
		})
	}
}
const controls = {
	"div" : container.element,
	"show-buttons": show_buttons,
	"hide-buttons": hide_buttons,
	"enter" : enter,
	"resize": ()=>{container.resize()},
	"exit" : exit,
	"keyHandler" : (event)=>{
		if (event.key === 'Enter') {
			    // console.log("enter changing substate ... ")
				event.preventDefault();
				log_game();
		}
		return undefined;
	}
}

export {controls}
