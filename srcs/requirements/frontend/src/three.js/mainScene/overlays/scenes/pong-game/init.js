
// import { createRenderTarget, createScreenMaterial } from '../utils';
// import { Game } from './Game';

// let currentGame = new Game();

//  function getCurrGame(){
// 	if (currentGame && currentGame.end == true)
// 		currentGame = null;
// 	return currentGame;
// }

//  function startPongGame(type){
// 	const brutdata = {type: "local", username: "user", alias1: "PLAyer_one", alias2: "player_two"};
// 		fetch('http://localhost:8001/new-game/', {
// 			method: 'POST',
// 			headers: {'Content-Type': 'application/json'},
// 			body: JSON.stringify(brutdata)
// 		})
// 		.then(response => response.json())
// 		.then(data => {
// 			if (data["error"])
// 			{
// 				alert(data["error"]);
// 				return;
// 			}
// 		// if (currentGame)
// 		// 	currentGame.clean();
// 	//	currentGame = new Game();
// 		currentGame.new(123, 456, type);
// 		// currentGame.new(data["gameID"], data["userID"], "local");
// 		})
// 		.catch(error => {
// 			console.error('Error creating game:', error);
// 		});
// 	}

