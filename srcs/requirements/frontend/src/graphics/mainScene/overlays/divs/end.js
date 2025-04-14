import { StateManager } from '../../../core/stateManager/StateManager';
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button } from '../../../core/UIFactory/Elements';
import { SwitchButtons} from '../../../core/UIFactory/SwitchButtons';
import { MainEngine } from '../../utils/MainEngine';

class End{
	constructor(color="white"){
		this.overlay = new Overlay([
			new FlexBox({
				flex: 1,
				fontSize: 2,
				children : [
					new Text({content: "GAME OVER"})
				]
			}),
			new FlexBox({
				dir: "row",
				width: "100%",
				mainAxis: "space-around",
				children : [
					new Button({
						color: color,
						fontSize: 0.55,
						content: "EXIT",
						onClick : ()=> {new MainEngine().blockRaycast(); new StateManager().changeState(0); }
					}),
					new Button({
						color: color,
						fontSize: 0.55,
						content: "RESTART",
						onClick : ()=> {new StateManager().currentState.changeSubstate(2);}
					})
				]
			}),
			],
			color,
		);
		this.div = this.overlay.element;
		this.keyHandlerswitchButtons = new SwitchButtons(this.overlay.getElementsOfType(Button));
	}
	keyHandler(event){this.keyHandlerswitchButtons.keyHandler(event);}
	enter(){
		this.keyHandlerswitchButtons.switch("prev");
		this.div.style.visibility = "visible";
	}
	exit(){
		this.div.style.visibility = "hidden";
	}
	resize(){ this.overlay.resize();}
	animate(){}
}
export { End };