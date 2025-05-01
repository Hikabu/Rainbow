import { Socket } from "../../../../utils/Socket";

export class KeyControls{
	constructor(paddles){
		this.paddleLeft = paddles.paddles[0];
		this.paddleRight = paddles.paddles[1];
		this.keyStates = {};
		this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

	}
	handleKeyDown(event) {
		//console.log("key down!")
		if (!this.keyStates[event.key]) {
			this.keyStates[event.key] = true;
			this.userPaddleInput(event.key, true);
		}
		//else
			//console.log("no key states")
	}
	handleKeyUp(event) {
		// console.log("key up!")
		if (this.keyStates[event.key]) {
			this.keyStates[event.key] = false;
			this.userPaddleInput(event.key, false);
		}
		// else
		// 	console.log("no key states")
	}
	userPaddleInput(key, isPressed) {
		//console.log("user paddle input...");
		const mappings = {
			[this.paddleLeft.keyUp]: { side: -1, direction: 1 },
			[this.paddleLeft.keyDown]: { side: -1, direction: -1 },
			[this.paddleRight.keyUp]: { side: 1, direction: 1 },
			[this.paddleRight.keyDown]: { side: 1, direction: -1 },
		};
		const movement = mappings[key];
		if (!movement) 
		{
		//	console.log("no movement");
			return;
		}
		//console.log("movement: ", movement)
		if (isPressed) {
			//console.log("is pressed")
			const oppositeKey =
				key === this.paddleLeft.keyUp ? this.paddleLeft.keyDown :
				key === this.paddleLeft.keyDown ? this.paddleLeft.keyUp :
				key === this.paddleRight.keyUp ? this.paddleRight.keyDown :
				this.paddleRight.keyUp;
			this.keyStates[oppositeKey] = false;
		}
		//else
			//console.log("is not pressed")
		//console.log("sending to socket paddle")
		new Socket().send({
			"channel": "game",
			request: "update paddles",
			side: movement.side,
			direction: isPressed ? movement.direction : 0,
		});
	}
}