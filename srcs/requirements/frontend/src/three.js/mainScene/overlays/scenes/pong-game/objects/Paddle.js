const LEFT = -1;
const RIGHT = 1;
// const TRUE = 0;
const FALSE = -1;
import * as THREE from 'three';

export class PaddleGroup {
	constructor(visibility, engine){
		this.paddles = [
			new Paddle(visibility, -1, engine), 
			new Paddle(visibility, 1, engine)
		];
	}
	hide(){
		for (let i = 0; i < this.paddles.length; i++)
			this.paddles[i].hide();
	}
	show(game_type){
		for (let i = 0; i < this.paddles.length; i++)
			this.paddles[i].show(game_type);
	}
	initPositions(engine){
		for (let i = 0; i < this.paddles.length; i++)
			this.paddles[i].initPositions(engine);
	}
	collisionPos(ball){
		return this.paddles[1].collisionPos(ball);
	}
}
class Paddle {
    constructor(visibility, side, engine) {
		const len = 0.25 * engine.boundaryY;
		const width = 0.1;
        const geoPaddle = new THREE.BoxGeometry(width, len, width);
		let material = new THREE.MeshStandardMaterial({ color: 0xffffff });
		this.object = new THREE.Mesh(geoPaddle, material);
		engine.scene.add(this.object);
		this.side = side;
		this.initPositions(engine);
		this.startAnimation = FALSE;
		this.collision = this.object.position.x - this.side * width / 2;
		this.halfLen = len /2;
		this.keyDown = "not allowed";
		this.keyUp = "not allowed";
		this.object.visible = visibility;
		// if (visibility == "hide")
		// 	this.hide();
    }
	hide()
	{
		this.object.visible = false;
		this.keyDown = "not allowed";
		this.keyUp = "not allowed";
	}
	show(game_type)
	{
		this.object.visible = true;
		if (game_type == "local" && this.side == LEFT)
		{
			this.keyUp = "w";
			this.keyDown = "s";
		}
		else if ((game_type == "local" && this.side == RIGHT) || 
			(game_type == "AI" && this.side == LEFT) ||
			(game_type == "player1" && this.side == LEFT) ||
			(game_type == "player2" && this.side == RIGHT) 
		)
		{
			this.keyUp = "ArrowUp";
			this.keyDown = "ArrowDown";
		}
	}
	initPositions(engine) {
		const edgeBoundaryPercent = 0.1;
		this.object.position.x = this.side * engine.boundaryX * (1 - edgeBoundaryPercent);
		const minEdge = 0.5;
		if (engine.boundaryX * edgeBoundaryPercent < minEdge)
			this.object.position.x = this.side * (engine.boundaryX - minEdge);
		this.object.geometry.parameters.length = engine.boundaryY * 0.25;
	}
	collisionPos(ball){
		return this.object.position.x - this.object.geometry.parameters.width / 2 - ball.object.geometry.parameters.width / 2;
	}
}
