import { BaseNonDivElement } from "./Base";
class Text extends BaseNonDivElement{
	constructor({id = "text", content, flex = 0, fontSize = 1, w, h, marginLR = 0, margin = 0, marginBot = 0, paddingLR = 0})
	{
		super('label', id, flex, fontSize, w, h);
		this.element.textContent = content;
		this.element.style.textAlign = "center";
		this.element.style.marginTop = margin;
		this.element.style.marginBottom = margin + marginBot;
		this.element.style.marginLeft = marginLR;
		this.element.style.mariginRight = marginLR;
		this.element.style.paddingRight = paddingLR;
		this.element.style.paddingLeft = paddingLR;

	}
}

class Input extends BaseNonDivElement{
	constructor({id = "input", autofocus = "false", flex = 0, fontSize = 1, w = 0.9, h = 0.1, margin = 0, marginBot = 0})
	{
		super('input', id, flex, fontSize, w, h);
		this.element.type = 'text';
		this.element.autofocus = autofocus;
		this.element.style.textAlign = 'center';
		this.element.style.backgroundColor = 'transparent';
		this.element.style.border = 'none';
		this.element.style.outline = 'none';
		this.element.style.marginTop = margin;
		this.element.style.marginBottom = margin + marginBot;
	}
}

class Button extends BaseNonDivElement{
	constructor({id = "button", content, color, onClick =()=>{}, flex = 0, fontSize = 1, w, h, margin = 0, marginBot = 0})
	{
		super('label', id, flex, fontSize, w, h);
		this.isSelected = false;
		this.activate = ()=>{
			if (this.isSelected == true)
				return ;
			this.element.style.transition = "transform 0.1s ease-in-out";
			this.element.style.transform = "scale(1.2)";
			this.isSelected = true;
		}
		this.deactivate = ()=>{
			if (this.isSelected == false)
				return ;
			this.element.style.transition = "transform 0.2s ease-in-out";
			this.element.style.transform = "scale(1)";
			this.isSelected = false;
		}
		this.element.textContent = content;
		this.onClick = onClick;
		this.element.style.color = color;
		this.color = color;
		this.element.style.marginTop = margin;
		this.element.style.marginBottom = margin + marginBot;
		this.element.addEventListener('mouseover', ()=>{this.activate()});
		this.element.addEventListener('mouseout', ()=> { this.deactivate()});
		this.element.addEventListener('click', ()=>{ this.onClick();});
	}
	animate(){
		const r =  Math.random() * (100);
		if (r > 90)
		{
			if (this.element.style.color === "transparent") this.element.style.color = this.color;
			else if (r > 95) this.element.style.color = "transparent";
		}
	}
}

export {Text, Input, Button}