import { StateManager } from "../../../core/stateManager/StateManager";
import { State } from "../../../core/stateManager/States";
import { FlexBox,Overlay } from '../../../core/UIFactory/DivElements';
import { Button, Input,Text } from '../../../core/UIFactory/Elements';
import { Socket } from '../../utils/Socket'
import { fadeout } from "../../../core/UIFactory/effects";
import axios from 'axios';
import { getUserAlias } from "../../utils/utils";

const container = new Overlay([
			new FlexBox({
				dir: "column",
				mainAxis: "space-around",
				flex: 1,
				children: [
					new FlexBox({
						children: [
							new Text({
								id : "pay-message",
								content: "Waiting for payment ...",
								fontsize: 4
							}),
						],
					}),
					],
				}),
			new FlexBox({//figure this out 
				dir: "row",
				mainAxis: "space-around",
				children: [
					new Button({
						id: "button-test-1",
						content: "(test)accept",
						fontSize: 0.85,
						onClickAsync: async()=>{await payment_successful()}
					}),
					new Button({
						id: "button-test-2",
						content: "(test)deny",
						fontSize: 0.85,
						onClick: ()=>{payment_error()}
					}),
				]
			}),
			new Button({
				id: "back-button",
				content: "GO BACK",
				fontSize: 0.85,
				onClick: ()=>{
					let stateManager = new StateManager();
					stateManager.currentState.changeSubstate(stateManager.currentState.startIndex + 1)
				}
			}),
		])

function show_buttons(){
	container.getElementById("back-button").element.style.visibility = "visible";
	container.getElementById("button-test-1").element.style.visibility = "visible";
	container.getElementById("button-test-2").element.style.visibility = "visible";
}

function hide_buttons(){
	container.getElementById("back-button").element.style.visibility = "hidden";
	container.getElementById("button-test-1").element.style.visibility = "hidden";
	container.getElementById("button-test-2").element.style.visibility = "hidden";
}

function show_div(){
	container.element.style.visibility = "visible";
	container.getElementById("pay-message").element.textContent = "Waiting for payment...";
}

function hide_div(){
	container.element.style.visibility = "hidden";
	hide_buttons();
}


async function payment_successful(){
	let alias = await getUserAlias()
	console.log("alias: ", alias)
	new Socket().send({
		"channel" : "tournament",
		"action": "succesfull payment",
		"tour_id": 	new StateManager().currentState.currentSubstate.data["tour_id"],
		"alias" : alias,
	})
	container.getElementById("pay-message").element.textContent = "Payment Successful";
	let stateManager = new StateManager();
	setTimeout(() => {
		stateManager = new StateManager();
		if (stateManager.currentState == 3 && stateManager.currentState.currentSubstate == 6)
			//fadeout();
			stateManager.currentState.changeSubstate(5);
	}, 2000);//10 second
}

function payment_error(){
	container.getElementById("pay-message").element.textContent = "Payment Denied";
	let stateManager = new StateManager();
	let curr_state = stateManager.currentState;
	let curr_substate =  stateManager.currentState.currentSubstate;
	setTimeout(() => {
		stateManager = new StateManager();
		if (stateManager.currentState == curr_state && curr_substate == stateManager.currentState.currentSubstate)
			fadeOut();
			stateManager.currentState.changeSubstate(5);
	}, 2000);//10 second
}

function payment_logic(){
	//TODO
	//just write here the payment logic anad call payment usscessfullk ft or payment error ft abd get rid of acccept bka bla bla buttons t the top thqat cll tghese
}

function pay_winner(){
	//TODO
	//pay the winner
}

function refund(){
	//TODO
	//refund price for man alone
}
//if confusion
	///arturo(some patience)
//else
	//write(bullshit)
const payment = {
	"div" : container.element,
	"show-buttons" : show_buttons,
	"hide-buttons" : hide_buttons,
	"show-div" : show_div,
	"hide-div" : hide_div,
	"payment" : payment_logic,
	"pay-winner": pay_winner,
	"refund": refund,
	"resize": ()=>{container.resize()},
}

export {payment}
