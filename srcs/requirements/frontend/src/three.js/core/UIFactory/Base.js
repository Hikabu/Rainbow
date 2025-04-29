import {TextExtension, SizedExtension} from './Extensions'

class BaseDivElement{
	constructor(id, children){
		this.element = document.createElement('div');
		this.childElements = [];
		this.element.id = id;
		this.element.style.display = 'flex';
this.element.style.flexDirection = 'column'; // or 'row', depending on layout
this.element.style.justifyContent = 'center'; // vertical alignment in column layout
this.element.style.alignItems = 'center'; // horizontal alignment

		children.forEach(child => {this.add(child);});
	}
	add(element){
		if (! (element instanceof Element))
		{
			this.childElements.push(element);
			element = element.element;
		}
		this.element.appendChild(element);
	}
	getElementById(id){
		for (let child of this.childElements) {
			if (child.element.id == id)
				return child;
			else if (child instanceof BaseDivElement)
			{
				let child_found = child.getElementById(id);
				if (child_found != undefined)
					return child_found;
			}
			// else 
			// {
				
			// }
		};
		return undefined;
	}
	getElementsWith(type, elements){
		if (!elements)
			elements = [];
		for (let child of this.childElements) {
			if (child instanceof BaseDivElement)
				elements = child.getElementsWith(type, elements);
			else if (child.extensions && child.extensions[type] != undefined)
				elements.push(child);
		};
		return elements;
	}
	getElementsOfType(type, elements){
		if (!elements)
			elements = [];
		for (let child of this.childElements) {
			if (child instanceof BaseDivElement)
				elements = child.getElementsOfType(type, elements);
			else if (child instanceof type)
				elements.push(child);
		};
		return elements;
	}
	replaceWith(new_base){
		this.element.replaceWith(new_base.element)
		this.element = new_base.element;
		this.childElements = new_base.childElements;
	}
}

class BaseNonDivElement {
	constructor(type, id, flex, fontSize, w, h){
		this.element =  document.createElement(type);
		this.element.id = id;
		if (flex > 0)
			this.element.style.flex = flex;
		this.extensions = {
				text : new TextExtension(this.element, fontSize),
				size : undefined
		}
		if ( w != undefined && h != undefined)
			this.extensions.size = new SizedExtension(this.element, w, h);
	}
}

export {BaseDivElement, BaseNonDivElement}