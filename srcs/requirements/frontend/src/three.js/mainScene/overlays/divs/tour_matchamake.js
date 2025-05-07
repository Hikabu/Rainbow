import { StateManager } from "../../../core/stateManager/StateManager";
import { Overlay, FlexBox } from '../../../core/UIFactory/DivElements';
import { Text, Button, Input } from '../../../core/UIFactory/Elements';
import { Socket } from '../../utils/Socket'

const container = new Overlay([
	new FlexBox({
		dir: "column",
		mainAxis: "space-around",
		children: [
			new Text({
				id: "title",
				fontSize: 0.85
			}),
			new Text({
				id: "subtitle",
				fontSize: 0.55,
			})
		]
	}),
	new FlexBox({
		id : "matches",
		fex: 1,
		width: "100%",
	})
	
])

function organize_players_array(array){
	// console.log("all players length: ", array.length)
	if (array.length % 2 == 1)
		array.push("")
	// const index_user = array.indexOf(getAlias());
	// const index_oponent = index_user % 2 == 0 ? index_user + 1 : index_user - 1;
	// const elementsToMove = [array[index_user], array[index_oponent]];
	// const i1 = index_user < index_oponent ? index_user : index_oponent;
	// array.splice(i1, 2);
	// array.unshift(...elementsToMove); 
	return array;
}
let new_matches;
function dynamic_content(data){
	container.getElementById("title").element.textContent=`Round ${data["current round"]}`;
	container.getElementById("subtitle").element.textContent=`${data["players"].length} players`;
	new_matches = createTextGrid(organize_players_array(data["players"]));
	container.getElementById("matches").replaceWith(new_matches);
}

function getStringMatch(i, players){
	let player1 = players[i];
	let player2 = players[i + 1];
	let color = player2 == "" ? "green" : "white";
	if (player2 == "") 
		return [
			new Text({
				content: `${player1} skips round `,
				fontSize: 0.65,
				color: "green",
				flex: 1,
				width: "100%",
			}),
	]
	return [
		new Text({
			content: `${player1}  `,
			fontSize: 0.65,
			color: color,
			flex: 1,
			paddingLR: "2%",
		}),
		new Text({
			content: "  vs  ",
			fontSize: 0.65,
			color: color,
			paddingLR: "2%",
		}),
		new Text({
			content: `  ${player2}`,
			fontSize: 0.65,
			color: color,
			flex: 1,
			paddingLR: "2%",
		})
	]
}
function createTextGrid(players) {
	const rows = [];
	let count = players.length;
		for (let i = 0; i < count; i += 2) {
				rows.push(new FlexBox({
					mainAxis: "space-evenly",
					children: getStringMatch(i, players),
				}));
		}
		return new FlexBox({
			dir: "column",
			flex: 1,
			width: "100%",
			mainAxis: "space-evenly",
			scrollable: "true",
			children: rows
		});
	}

function show_div(){
	container.element.style.visibility = "visible";
}

function hide_div(){
	container.element.style.visibility = "hidden";
}

function exit(){
	new_matches.element.replaceWith(container.getElementById("matches").element)
}


const matchmake = {
	"div" : container.element,
	"show-div" : show_div,
	"hide-div" : hide_div,
	"resize": ()=>{container.resize()},
	"dynamic-content": dynamic_content,
	"exit" : exit,
}

export {matchmake}
