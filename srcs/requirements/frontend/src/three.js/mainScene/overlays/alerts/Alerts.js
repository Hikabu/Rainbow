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
		// console.log("add alert... ");
		if (!this.currentAlert)
			this.display_latest_alert(alert);
		else if(this.currentAlert.id == alert.id){
			// console.log("double alert !");
			return("error");
		}
		else if (alert.priority > this.currentAlert.priority)
		{
			this.currentAlert.hide(true);
			this.display_latest_alert(alert);
		}
		else
			return("overrun")
	}
	display_latest_alert(alert){
		// console.log("displaying latest aert")
		this.currentAlert = alert;
		this.currentAlert.show();
	}
	remove_latest_alert(alert_to_remove_id){
		if (this.currentAlert == null) //|| this.currentAlert != alert_to_remove)
			return;
		if (alert_to_remove_id && this.currentAlert.id != alert_to_remove_id)
		{
			// console.log("alert already removed")
			return ;

		}
		// console.log("will reomve alert")
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
		this.enter = ()=>{enter(this)};
		this.exit = exit;
		this.canQueue = canQueue;
		this.hide(true);
	}
	style_div(){
		let wrapper = document.createElement("div");
		wrapper.style.position = "absolute";
		wrapper.style.top = "5%";
		wrapper.style.left = "50%";
		wrapper.style.transform = "translateX(-50%)";
		wrapper.style.display = "flex";
		wrapper.style.justifyContent = "center";
		wrapper.style.alignItems = "center";
		wrapper.style.width = "100%";
		wrapper.style.pointerEvents = "none";
		let popup = document.createElement("div");
		popup.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
		popup.style.color = "white";
		popup.style.padding = "2% 2%";
		popup.style.borderRadius = "5px";
		popup.style.boxShadow = "0px 2px 10px rgba(0, 0, 0, 0.8)";
		popup.style.fontSize = "16px";
		popup.style.whiteSpace = "nowrap";
		popup.style.zIndex = "1000";
		popup.style.textAlign = "center";
		popup.style.transition = "transform 0.2s ease";
		popup.style.transformOrigin = "center center";
		wrapper.style.pointerEvents = "auto";
		popup.id = "popup-message";
		popup.className = "bg-dark text-white text-center p-3 rounded shadow-lg";
		wrapper.appendChild(popup);
		document.body.appendChild(wrapper);
		this.div = popup;
		this.wrapper = wrapper;
	}
	append_children(children){
		for (let i = 0; i < children.length; i++){
			this.div.appendChild(children[i].element)
		}
		new MainEngine().container.appendChild(this.wrapper);
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