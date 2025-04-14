import { Socket } from "../../../../utils/Socket";

export class GameSocket {
	constructor(){
		this.socket = new Socket();
		this.msgQueue = [];
	}
	movePaddle(side, direction) {
		this.socket.send(JSON.stringify({ action: "move_paddle", side, direction }));
	}
	setGameParams(halfLen, boundaryX, boundaryY) {
		this.socket.send(JSON.stringify({
			action: "set_game_params",
			halfLen,
			boundaryX,
			boundaryY
		}));
	}
}
