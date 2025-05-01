import { MainEngine } from '../../mainScene/utils/MainEngine';
import {BaseDivElement} from './Base'

class Overlay extends BaseDivElement{
	constructor(children = [], color, padding='6%', resizeFactor = 0.07, id = "overlay"){
		super(id, [new FlexBox({
									children: children, 
									width: "100%", 
									height: "100%", 
									dir: "column", 
									padding: padding
								})]);
		this.resizeFactor = resizeFactor;
		this.element.style.boxSizing = 'border-box';
		this.element.style.border = 'none';
		this.element.style.visibility = "hidden";
		new MainEngine().container.appendChild(this.element);
		this.getElementsWith("text").forEach(element => { element.element.style.color = color;});
	}
	resize(){
		//console.log("resizing overlay...")
		const w = this.element.offsetWidth;
		const h = this.element.offsetHeight;
		this.getElementsWith("size").forEach(element => { element.extensions.size.updateSize(w, h);});
		const fontSize = (((w + h) / 2) * this.resizeFactor);
		this.getElementsWith("text").forEach(element => { element.extensions.text.updateSize(fontSize);});
	}
}

class FlexBox extends BaseDivElement {
	constructor({
			id = "flexbox",
			children = [],
			width, height,
			dir, mainAxis = "center", crossAxis = "center", flex = 0,
			marginTop = '0.5%, auto', marginLeft= '0%', marginRight='0%', marginBottom= '0.5%, auto',scrollable = false, padding,
		})
		{
			super(id, children);
			if (width) this.element.style.width = width;
			if (height) this.element.style.height = height;
			if (dir) this.element.style.flexDirection = dir;
			this.element.style.justifyContent = mainAxis;
			this.element.style.alignItems = crossAxis;
			this.element.style.marginLeft = marginLeft;
			this.element.style.marginRight = marginRight;
			this.element.style.marginTop = marginTop;
			this.element.style.marginBottom = marginBottom;
			this.element.style.boxSizing = 'border-box';
			if (padding) 
			{
				this.element.style.paddingTop = padding;
				this.element.style.paddingBottom = padding;
				this.element.style.paddingLeft = padding;
				this.element.style.paddingRight = padding;
			}
			if (flex > 0) this.element.style.flex = flex;
			this.element.style.overflowY = "visible";
			this.element.style.overflowX = "visible";
			if (scrollable) this.element.style.overflowY = "auto";
		
		}
}

export {FlexBox, Overlay}