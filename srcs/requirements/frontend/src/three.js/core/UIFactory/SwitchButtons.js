
class SwitchButtons {
	constructor(buttons,  nextKey="ArrowRight", prevKey="ArrowLeft"){
		this.buttons = buttons;
		this.activeIndex = 0;
		this.nextKey = nextKey;
		this.prevKey = prevKey;
	}
	switch_active(nextButton, index){
		
		if (index == undefined){
			this.buttons.forEach((button, i) => {
				if (button.id == buttonNext.id && button.content == buttonNext.content)
					index = i;
			})
			this.activeIndex = index;
		}
		this.activeButton?.deactivate();
		this.activeButton = nextButton;
		this.activeButton.activate();
	}
	switch(dir = "next"){
		if (dir == "next")
		{
			this.activeIndex += 1;
			if (this.activeIndex >= this.buttons.length)
				this.activeIndex = this.buttons.length - 1;
		}
		else if (dir == "prev")
		{
			this.activeIndex -= 1;
			if (this.activeIndex < 0)
				this.activeIndex = 0;
		}
		this.switch_active(this.buttons[this.activeIndex], this.activeIndex);
	}
	keyHandler(event){
		if (event.key === 'Enter') {
			    //  console.log("enter changing substate ... ")
				event.preventDefault();
				this.activeButton.onClick();
		}
		else if (event.key == this.nextKey)
			this.switch("next");
		else if (event.key == this.prevKey)
			this.switch("prev");
	}
}

export {SwitchButtons}