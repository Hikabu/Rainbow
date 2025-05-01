import { StateManager } from '../../../core/stateManager/StateManager';
import { State } from '../../../core/stateManager/States';
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button } from '../../../core/UIFactory/Elements';
import { SwitchButtons} from '../../../core/UIFactory/SwitchButtons';
import { Socket } from '../../utils/Socket';
import { join } from '../divs/tour_join';
import { Alert, AlertManager } from './Alerts';
import { fadeout, doublePump } from '../../../core/UIFactory/effects';

const flexBox = new FlexBox({
	dir: "column",
	mainAxis: "spaced-out",
	marginBottom: '4%',
	marginTop: "4%",
	children:
	[
		new Text({
			content: "INFO",
			fontSize: 0.75,
			marginBot: "8%",

		}),
		new Text({
			id : "info",
			textContent : "hello",
			fontSize: 0.55,
		}),
	]
})

let length;

export function create_info_alert(info, inputlength = 20000){
	console.log("create info alert");
	length = inputlength > 2000 ? inputlength : 2000;
	console.log(flexBox.getElementById("info").element.style.textContent)

	flexBox.getElementById("info").element.style.textContent = info;
	console.log(flexBox.getElementById("info").element.style.textContent)

	const info_alert = new Alert("info_alert", [flexBox], "normal", 1, enter, exit, false);
	new AlertManager().add_alert(info_alert);
}

function enter(self){
	doublePump(self.div);
	doublePump(self.div);
	setTimeout(() => {
		console.log("faDING!!!")
		fadeout(self.div, 1)
	}, length - 1000);
	console.log("length: ", length)
	setTimeout(() => {
			console.log("removing alert info");
			const alertManager = new AlertManager();
			if (alertManager.currentAlert && alertManager.currentAlert == self)
				new AlertManager().remove_latest_alert();
		}, length);
}

function exit(){
	
}


