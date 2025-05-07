import { Engine } from './setUp/Engine';
import { MiddleBars } from "./objects/MiddleBars";
import { PaddleGroup } from './objects/Paddle';
import { Ball } from './objects/Ball';
import { Header } from './objects/Header';
import { KeyControls } from './setUp/KeyControls';
import { Font } from '../../../../core/objectFactory/customFont3d';
import { dispose_object } from '../../../utils/utils';
import { StateManager } from '../../../../core/stateManager/StateManager';
import { createRenderTarget, createScreenMaterial } from '../utils';
import { OnLoad } from '../../../utils/OnLoad';
import * as THREE from 'three';
import { Socket } from '../../../utils/Socket';
//OPTION RAINBOW
// import axios from 'axios';
	let end = false;
	let state = "0";
	//shoudl send the wndow to engine really ? THINK
	let engine = new Engine(window);
	let middleBars = new MiddleBars(false, engine);
	let ball = new Ball(false, engine);
	let paddles = new PaddleGroup(false, engine);
	let key = new KeyControls(paddles);
	let header = new Header(false, engine);
	let content_body = new Font(false, engine);
	let mode, num;


function	start_game(game_id)
{
	console.log("sending to socket start of game")
	new Socket().send({
		"channel": "game",
		request: "start game",
		game_id: game_id,
		boundaries: { x: paddles.collisionPos(ball), y: engine.boundaryY },
		left_paddle_type: mode === "AI" ? "local" : (mode === "player2" ? "X" : mode),
		right_paddle_type: mode === "player1" ? "X" : mode,
		paddle_half_len: paddles.paddles[0].halfLen,
	});
}
	
function	updatesFromBackend(msg){
	const data = msg.updates|| msg;
	// console.log("data:", data)
	if (data.state == "countdown")
	{
		if (state != "countdown")
			countdown();
		num = data.num == 1 ? "|" : data.num;
		if (data.num == 0)
			content_body.new("GO", "thick", 0, 0, 0, 5.5, 1, engine);

		else
			content_body.new(num, "thin", 0, 0, 0, 1.5, 1, engine);
	}
	else if (data.state == "playing")
	{
		if (state != "playing")
			playing();
		paddles.paddles[0].object.position.y = data.paddle_left;
		paddles.paddles[1].object.position.y = data.paddle_right;
		ball.object.position.x = data.ball.x;
		ball.object.position.y = data.ball.y;
		header.updateScores(data.score1, data.score2, engine);
	}
	else if (data.state == "game end")
	{
		if (state != "completed")
			completed();
	}
	else if (data.state == "error")
	{
		if (state != "error")
			completed(data.info);
	}
	else if (data.state == "player names")
	{
		console.log("PLAYER NAMES!")
		console.log("player_names: ", data)
		header.new("hide", data.name1, data.name2, engine);
	}
}

function	countdown(){
	state = "countdown";
	content_body.show();
	ball.hide();
	paddles.hide();
	middleBars.hide();
	header.hide();
}

function	playing(){
	end = false;
	state = "playing";
	ball.object.position.set(0, 0, 0);
	content_body.delete();
	middleBars.show();
	ball.show();
	paddles.show(mode);
	header.show();
}

function completed(msg){
	state = "completed";
	ball.hide();
	paddles.hide();
	middleBars.hide();
	if (msg)
	{
		content_body.new("game over", "thick", 0, 0.15, 0, 15, 1.5, engine);
		let info = new Font(engine);
		info.new(msg, "thick", 0, -.15, 0, 80, 1.5, engine);
	}
	else
	{
		content_body.new("game over", "thick", 0, 0, 0, 15, 1.5, engine);
	}
	console.log("fame end ... mode", mode)
	clean();
	if (mode == "local" || mode == "AI")
		new StateManager().currentState.changeSubstate();
}


function	clean(){
		ball.hide();
		paddles.hide();
		middleBars.hide();
		content_body.hide();
		header.hide();
		state = "0";
		end = true;
	}


function	resize(object_aspect) {
	content_body.initPositions(engine);
	engine.setRendererSize(object_aspect);
	ball.initPositions(engine);
	paddles.initPositions(engine);
	header.initPositions(engine);
	console.log("sedning to socket boundaries")
	new Socket().send({
		"channel": "game",
		"boundaries" : {
			"x" : paddles.collisionPos(ball),
			"y" : engine.boundaryY,
		},
	})
}

function enter(object_aspect){
		console.log("enter game state");
		clean();
		resize(object_aspect);
		let stateManager = new StateManager()
		mode = stateManager.currentStateIndex == 1 ? "local" : stateManager.currentStateIndex == 2 ? "AI" : stateManager.currentStateIndex == 3? "remote" : "unkown";
		document.addEventListener("keydown", key.handleKeyDown);
		document.addEventListener("keyup", key.handleKeyUp);
}

function exit(){
	console.log("exit game state")
		document.removeEventListener("keydown", key.handleKeyDown);
		document.removeEventListener("keyup", key.handleKeyUp);
		clean();
		console.log("sending to socket end game")
		new Socket().send({
			"channel": "game",
			"request": "game end",
		})
}

const renderTarget = createRenderTarget();
const renderMaterial = createScreenMaterial(renderTarget);
	
export	const pongGame = {
		"renderMaterial" : renderMaterial,
		"renderTarget" : renderTarget,
		"scene" : engine.scene,
		"camera" : engine.camera,
		"exit": exit,
		"receive" : (event)=>{updatesFromBackend(event);},
		"start_game" : start_game,
		"enter" : enter, 
	}
