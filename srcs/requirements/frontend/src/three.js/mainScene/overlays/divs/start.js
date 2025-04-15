import { StateManager } from '../../../core/stateManager/StateManager';
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button } from '../../../core/UIFactory/Elements';

class StartScreen{
	constructor(color = "black", title = "START GAME", fontSize=1.8){
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
								onClick: ()=>{new StateManager().currentState.changeSubstate();},
							})
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
				return {change : "substate"};
		}
		return undefined;
	}
	enter(){
		this.div.style.visibility = "visible";
		this.enterButton.element.style.color = this.color;
	}
	exit(){
		this.enterButton.element.style.color = "transparent";
		this.div.style.visibility = "hidden";

	}
	animate(){this.enterButton.animate();}
	resize(){this.overlay.resize();}
}

export { StartScreen};