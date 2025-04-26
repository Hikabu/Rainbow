import { Engine } from './setUp/Engine';
import { MiddleBars } from "./objects/MiddleBars";
import { PaddleGroup } from './objects/Paddle';
import { Ball } from './objects/Ball';
import { Header } from './objects/Header';
import { GameSocket } from './setUp/GameSocket';
import { KeyControls } from './setUp/KeyControls';
import { Font } from '../../../../core/objectFactory/customFont3d';
import { dispose_object } from '../../../utils/utils';
import { StateManager } from '../../../../core/stateManager/StateManager';
import { createRenderTarget, createScreenMaterial } from '../utils';
import * as THREE from 'three';
import { Socket } from '../../../utils/Socket';

//STATES: waiting, playing, error, completed

	let state = "0";
	//shoudl send the wndow to engine really ? THINK
	let engine = new Engine(window);
	let middleBars = new MiddleBars(false, engine);
	let ball = new Ball(false, engine);
	let paddles = new PaddleGroup(false, engine);
	let socket = new GameSocket();
	let key = new KeyControls(paddles, socket);
	let header = new Header(false, engine);
	let content_body = new Font(false, engine);
	let end = false;
	let gameID, mode, num, demo_type;

export	function startPongGame(type = "local"){
	console.log("new png game... ");
	new Socket().send({
		"channel" : "log",
		"type" : type,
		"userID1" : socket.socket.userID,
	})
}

	function	new_round(gameID_input, player_mode)
	{
		console.log("new round");
		document.addEventListener("keydown", key.handleKeyDown);
		document.addEventListener("keyup", key.handleKeyUp);
		gameID = gameID_input;
		mode = player_mode;
		// socket.new(gameID, userID, (event)=>{updatesFromBackend(event);});
		console.log('sending to game back end');
		socket.socket.send({
			"channel": "game",
			request: "start game",
			game_id: gameID,
			boundaries: { x: paddles.collisionPos(ball), y: engine.boundaryY },
			left_paddle_type: mode === "AI" ? "local" : (mode === "player2" ? "X" : mode),
			right_paddle_type: mode === "player1" ? "X" : mode,
			paddle_half_len: paddles.paddles[0].halfLen,
		});
		// if (mode == "player1" || mode == "player2")
			// waiting();
	}
	
export function	startDemoGame(type){
	mode = "demo";
	demo_type = type;	
}

function demoAnimate(){

}

function	updatesFromBackend(data){
	if (data.updates.state == "countdown")
	{
		if (state != "countdown")
			countdown();
		num = data.updates.num == 1 ? "|" : data.updates.num;
		if (data.updates.num == 0)
			content_body.new("GO", "thick", 0, 0, 0, 5.5, 1, engine);

		else
			content_body.new(num, "thin", 0, 0, 0, 1.5, 1, engine);
	}
	else if (data.updates.state == "playing")
	{
		if (state != "playing")
			playing();
		paddles.paddles[0].object.position.y = data.updates.paddle_left;
		paddles.paddles[1].object.position.y = data.updates.paddle_right;
		ball.object.position.x = data.updates.ball.x;
		ball.object.position.y = data.updates.ball.y;
		header.updateScores(data.updates.score1, data.updates.score2, engine);
	}
	else if (data.updates.state == "game end")
	{
		if (state != "completed")
			completed();
	}
	else if (data.updates.state == "error")
	{
		if (state != "error")
			completed(data.updates.info);
	}
	else if (data.updates.state == "player names")
	{
		console.log("player_names: ", data)
		header.new("hide", data.updates.name1, data.updates.name2, engine);
	}
}

function	countdown(){
	state = "countdown";
	content_body.show();
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
	clean();
	console.log("fame end ... mode", mode)
	if (mode == "local" || mode == "AI")
		new StateManager().currentState.changeSubstate();
}


function	clean(){
		console.log("clean");
		document.removeEventListener("keydown", key.handleKeyDown);
		document.removeEventListener("keyup", key.handleKeyUp);
		ball.hide();
		paddles.hide();
		middleBars.hide();
		content_body.hide();
		header.hide();
		state = "0";
		// socket.socket.socket.close();
		end = true;
	}


function	resize(e) {
	content_body.initPositions(engine);
	//MAYBE HSOULD BE SCREEN ? THINK!
	engine.camera.aspect = window.innerWidth / window.innerHeight;
	engine.camera.updateProjectionMatrix();
	engine.setRendererSize(window); //THINK
	ball.initPositions(engine);
	paddles.initPositions(engine);
	header.initPositions(engine);
	if (mode != "demo")
		socket.socket.send({
			"channel": "game",
			"boundaries" : {
				"x" : paddles.collisionPos(ball),
				"y" : engine.boundaryY,
			},
			})
}


function exit(){
	//if (end == false){
		//const userConfirmed = confirm("Game is running!\n Are you sure you want to exit? \nYou will automatically lose...");
		// if (userConfirmed)
		console.log("exit")
		clean();
		if (mode != "demo")
			new Socket().send({
				"channel": "game",
				"request": "end game",
			})
		// else
		// 	return "forbidden";
	//}
}

const renderTarget = createRenderTarget();
const renderMaterial = createScreenMaterial(renderTarget);
	
export	const pongGame = {
		"renderMaterial" : renderMaterial,
		"renderTarget" : renderTarget,
		"scene" : engine.scene,
		"camera" : engine.camera,
		"resize":resize,
		"exit": exit,
		"receive" : (event)=>{updatesFromBackend(event);},
		"new-round" : new_round 
	}

	export	const demoGame = {
		"renderMaterial" : renderMaterial,
		"renderTarget" : renderTarget,
		"scene" : engine.scene,
		"camera" : engine.camera,
		"resize":resize,
		"exit":clean,
		"animate" : demoAnimate,
	}
