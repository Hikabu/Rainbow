
class TextExtension {
	constructor(element, fontSize){
		this.element = element;
		this.element.style.color = "white";
		this.fontSizeFactor = fontSize;
	}
	updateSize(newFontsize) {
		//console.log("update size tex extension", newFontsize)
		//console.log("before: ", this.element.style.fontSize)
		this.currFontSize = newFontsize * this.fontSizeFactor;
		this.element.style.fontSize = `${this.currFontSize}px`;
		this.element.style.lineHeight =  `${this.currFontSize * 1.5}px`;
		//console.log("after: ", this.element.style.fontSize)
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
		//console.log("update size extension", newWidth, newHeight)
		this.element.style.width = `${newWidth * this.widthFactor}px`;
		this.element.style.height = `${newHeight * this.heightFacor}px`;
	}
}

export {TextExtension, SizedExtension}