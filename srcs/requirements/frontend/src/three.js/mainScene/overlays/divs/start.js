import { StateManager } from '../../../core/stateManager/StateManager';
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button } from '../../../core/UIFactory/Elements';
import { stateManager } from '../../states/mainMenuState';
import { OnLoad } from '../../utils/OnLoad';
import { Socket } from '../../utils/Socket';
class StartScreen{
	constructor(color = "black", title = "PONG GAME", fontSize=1.8){
		this.overlay = new Overlay([
					new FlexBox({
						flex: 1,
						children : [
							new Text({content: title, fontSize: fontSize})
						]
					}),
					new FlexBox({
						dir: "row",
						width: "100%",
						crossAxis: "end",
						mainAxis: "end",
						children : [
							new Button({
								fontSize: 0.65,
								color: color,
								content: "ENTER",
								id: "enter-button",
								onClick: ()=>{
									can_user_log_game()
								}
							}),
						]
					}),
		]);
		this.color = color;
		this.div = this.overlay.element;
		this.enterButton = this.overlay.getElementById("enter-button");
	}
	keyHandler(event){
		if (event.key === 'Enter') {
				event.preventDefault();
				can_user_log_game();
		}
		return undefined;
	}
	enter(){
		this.div.style.visibility = "visible";
		this.enterButton.element.style.color = this.color;
		this.enterButton.element.style = "visible"
	}
	exit(){
		this.enterButton.element.style = "hidden"
		this.div.style.visibility = "hidden";

	}
	animate(){this.enterButton.animate();}
	resize(){this.overlay.resize();}
}

export function can_user_log_game(){
	console.log("can user log game...")
	new Socket().send({"channel" : "log",
		"action":"can_user_log_game",
		'state' : new StateManager().currentStateIndex,
	})
}


export { StartScreen};