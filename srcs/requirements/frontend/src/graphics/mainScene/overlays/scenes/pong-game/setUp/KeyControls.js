export class KeyControls{
	constructor(paddles, socket){
		this.paddleLeft = paddles.paddles[0];
		this.paddleRight = paddles.paddles[1];
		this.socket = socket;
		this.keyStates = {};
		this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

	}
	handleKeyDown(event) {
		if (!this.keyStates[event.key]) {
			this.keyStates[event.key] = true;
			this.userPaddleInput(event.key, true);
		}
	}
	handleKeyUp(event) {
		if (this.keyStates[event.key]) {
			this.keyStates[event.key] = false;
			this.userPaddleInput(event.key, false);
		}
	}
	userPaddleInput(key, isPressed) {
		const mappings = {
			[this.paddleLeft.keyUp]: { side: -1, direction: 1 },
			[this.paddleLeft.keyDown]: { side: -1, direction: -1 },
			[this.paddleRight.keyUp]: { side: 1, direction: 1 },
			[this.paddleRight.keyDown]: { side: 1, direction: -1 },
		};
		const movement = mappings[key];
		if (!movement) return;
		if (isPressed) {
			const oppositeKey =
				key === this.paddleLeft.keyUp ? this.paddleLeft.keyDown :
				key === this.paddleLeft.keyDown ? this.paddleLeft.keyUp :
				key === this.paddleRight.keyUp ? this.paddleRight.keyDown :
				this.paddleRight.keyUp;
			this.keyStates[oppositeKey] = false;
		}
		this.socket.socket.send({
			"channel": "game",
			request: "update paddles",
			side: movement.side,
			direction: isPressed ? movement.direction : 0,
		});
	}
}