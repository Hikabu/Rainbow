import { MainEngine } from "../../utils/MainEngine";

class AlertManager{
	constructor(){
		if (AlertManager.instance)
			return AlertManager.instance;
		this.queue = [];
		this.currentAlert = null;
		AlertManager.instance = this;
	}
	add_alert(alert){
		if (!this.currentAlert)
			this.display_latest_alert(alert);
		else if (alert.priority > this.currentAlert.priority)
		{
			this.currentAlert.hide(true);
			this.display_latest_alert(alert);
		}
		else
			return("overrun")
	}
	display_latest_alert(alert){
		this.currentAlert = alert;
		this.currentAlert.show();
	}
	remove_latest_alert(alert_id){
		if (this.currentAlert == null || this.currentAlert.id != alert_id)
			return;
		this.currentAlert.hide();
		this.currentAlert = null;
		if (this.queue.length > 0)
			this.display_latest_alert(this.queue.shift())
	}
}


class Alert{
	constructor(id, children, type, priority, enter = ()=>{}, exit = ()=>{}, canQueue = true){
		this.id = id;
		this.style_div();
		this.append_children(children);
		this.type = type;//ALERT | WARNING | INFO
		this.priority = priority;
		this.enter = enter;
		this.exit = exit;
		this.canQueue = canQueue;
		this.hide(true);
	}
	style_div(){
		let popup = document.createElement("div");
		popup.style.position = "fixed";
		popup.style.top = "10px";
		popup.style.left = "50%";
		popup.style.transform = "translateX(-50%)";
		popup.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
		popup.style.color = "white";
		popup.style.padding = "2% 2%";
		popup.style.borderRadius = "5px";
		popup.style.boxShadow = "0px 2px 10px rgba(0, 0, 0, 0.8)";
		popup.style.fontSize = "16px";
		popup.style.whiteSpace = "nowrap";
		popup.style.zIndex = "1000";
		popup.style.textAlign = "center";
		// popup.style.margin= "8px 15px";
		popup.id = "popup-message";
		popup.className = "position-fixed top-0 start-50 translate-middle-x bg-dark text-white text-center p-3 rounded shadow-lg";
		this.div = popup;
	}
	append_children(children){
		for (let i = 0; i < children.length; i++){
			this.div.appendChild(children[i].element)
		}
		new MainEngine().container.appendChild(this.div);
	}
	show(){
		this.div.style.visibility = "visible";
		this.enter()

	}
	hide(later = "false"){
		this.div.style.visibility = "hidden";
		if (!later)
			this.exit()
	}
}

export {AlertManager, Alert}