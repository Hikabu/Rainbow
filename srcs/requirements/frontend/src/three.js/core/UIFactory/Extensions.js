
class TextExtension {
	constructor(element, fontSize){
		this.element = element;
		this.element.style.color = "white";
		this.fontSizeFactor = fontSize;
	}
	updateSize(newFontsize) {
		this.currFontSize = newFontsize * this.fontSizeFactor;
		this.element.style.fontSize = `${this.currFontSize}px`;
		this.element.style.lineHeight =  `${this.currFontSize * 1.5}px`;
	}
	tempChangeSize(factor){
		this.prevFontSize = this.currFontSize;
		this.currFontSize *= factor;
		this.element.style.fontSize = `${this.currFontSize}px`;
	}
	revertSize(){
		this.currFontSize = this.prevFontSize;
		this.element.style.fontSize = `${this.currFontSize}px`;
	}
}

class SizedExtension{
	constructor(element, width, height){
		this.element = element;
		this.widthFactor = width;
		this.heightFacor = height;
	}
	updateSize(newWidth, newHeight){
		this.element.style.width = `${newWidth * this.widthFactor}px`;
		this.element.style.height = `${newHeight * this.heightFacor}px`;
	}
}

export {TextExtension, SizedExtension}