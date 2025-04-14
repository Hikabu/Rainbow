import * as THREE from 'three';
import { dispose_object } from "../../mainScene/utils/utils";

const blueprint = [
	[[[1, 2, 2], [3, 2, 2]], [[2, 1, 2], [2, 3, 2]], [], [["0"]]],
	[[[2, 2, 2]], [], [], [["|"]],],
	[[[2, 2, 2]], [[2, 3, 1]], [[1.75, 1.3, 1]], [["1"]],],
	[[[3, 1.5, 1], [1, 2.5, 1]], [[2, 1, 2], [2, 3, 2], [2, 2, 2]], [] , [["2"]],],
	[[[3, 2, 2]], [[2.4, 2, 1.2], [2, 1, 2], [2, 3, 2]], [] , [["3"]],],
	[[[1, 1.5, 1], [3, 2, 2]], [[2, 2, 2]], [] , [["4"]],],
	[[[1, 1.5, 1], [3, 2.5, 1]], [[2, 1, 2], [2, 2, 2], [2, 3, 2]], [], [["5"]],],
	[[[1, 2, 2], [3, 2.5, 1]], [[2, 1, 2], [2, 2, 2], [2, 3, 2]], [] , [["6"]],],
	[[[3, 2, 2]], [[2, 1, 2]], [], [["7"]]],
	// [[], [[2, 1, 2], [2.5, 1.5, 1],], [[1.5, 2.5, 2], [2.5, 1.5, 2],], [["7"]],],
	[[[1, 2, 2], [3, 2, 2]], [[2, 1, 2], [2, 2, 2], [2, 3, 2]], [] , [["8"]], ],
	[[[1, 1.5, 1], [3, 2, 2]], [[2, 1, 2], [2, 2, 2], [2, 3, 2]], [] , [["9"]],],
	[[[1, 2, 2], [3, 2, 2]], [[2, 1, 2], [2, 2, 2]], [] , [["A"]],],
	[[[1, 2, 2], [3, 2, 2]], [[2, 1, 2], [2, 2, 2], [2, 3, 2]], [] , [["B"]],],
	[[[1, 2, 2], [0, 0, 0]], [[2, 1, 2], [2, 3, 2]], [] , [["C"]],],
	[[[1, 2, 2], [3, 2, 1.4]], [[1.8, 1, 2.2], [1.6, 3, 1.8]], [[2.9, 1.2, -3], [2.7, 2.8, 3]], [["D"]], ],
	[[[1, 2, 2]], [[2, 1, 2], [1.8, 2, 1.2], [2, 3, 2]], [] , [["E"]],],
	[[[1, 2, 2]], [[2, 1, 2], [1.8, 2, 1.2]], [] , [["F"]],],
	[[[1, 2, 2], [3, 2.5, 1]], [[2, 1, 2], [2.8, 2, 1], [2, 3, 2]], [] , [["G"]],],
	[[[1, 2, 2], [3, 2, 2]], [[2, 2, 2]], [] , [["H"]],],
	[[[2, 2, 2]], [[2, 1, 2], [2, 3, 2]], [] , [["I"]],],
	[[[3, 2, 2]], [[2, 3, 2]], [], [["J"]],],
	[[[1, 2, 2]], [], [[2, 1.6, 4], [2, 2.4, -4]] , [["K"]],],
	[[[1, 2, 2]], [[2, 3, 2]], [] , [["L"]],],
	[[[1, 2, 2], [3, 2, 2]], [], [[1.5, 1.5, -2], [2.5, 1.5, 2]] , [["M"]],],
	[[[1, 2, 2], [3, 2, 2]], [], [[1.5, 1.5, -2], [2.5, 2.5, -2]], [["N"]],],
	[[[1, 2, 2], [3, 2, 2]], [[2, 1, 2], [2, 3, 2]], [] , [["O"]],],
	[[[1, 2, 2], [3, 1.5, 1]], [[2, 1, 2], [2, 2, 2]], [] , [["P"]],],
	[[[1, 2, 2], [3, 2, 2]], [[2, 1, 2], [2, 3, 2]], [[3, 2.75, -4],],  [["Q"]],],
	[[[1, 2, 2], [3, 1.5, 1]], [[2, 1, 2], [2, 2, 2]], [[2, 2.5, -4], ] , [["R"]], ],
	[[[1, 1.5, 1], [3, 2.5, 1]], [[2, 1, 2], [2, 3, 2], [2, 2, 2]], [] , [["S"]],],
	[[[2, 2, 2]], [[1.25, 1, 1.75], [2.75, 1, 1.75] ], [] , [["T"]],],
	[[[1, 2, 2], [3, 2, 2]], [[2, 3, 2]], [] , [["U"]],],
	[[], [], [[3, 1.9, 2],[1, 1.9, -2], [1.5, 2.5, -2], [2.5, 2.5, 2]] , [["V"]],],
	// [[], [], [[3.25, 1.6, 2],[0.75, 1.6, -2], [1.5, 2.5, -2], [2.5, 2.5, 2]] , [["V"]],],
	[[[1, 2, 2], [3, 2, 2]], [], [[1.5, 2.5, 2], [2.5, 2.5, -2]] , [["W"]],],
	[[], [], [[2, 2, -2], [2, 2, 2]], [["X"]],],
	[[[2, 2.5, 1]], [], [[1.5, 1.5, -2], [2.5, 1.5, 2]], [["Y"]], ],
	[[], [[2, 1.2, 2], [2, 2.8, 2]], [[2, 2, 2]] , [["Z"]],],
	[[], [[2, 2, 1]], [] , [["-"]],],
	[[], [[2, 3, 2]], [], [["_"]], ],
];

const fonts = preRenderFonts();

export class Font{
	constructor(isVisible, engine){
		this.value = "";
		this.group =  new THREE.Group();
		engine.scene.add(this.group);
		this.group.visible = isVisible;
		this.max_width = 0;
		this.scale = 0;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.style = "";
	}

	new(str, style, x_pos, y_pos, z_pos, scale, squish, engine){
		dispose_object(this.group);
		this.value = this.validateCharacters(str);
		this.scale = scale;
		let width = style == "thin" ? 1.2: 1.8;
		let total_chars = this.value.length;

		let x, new_char;
		for (let i = 0; i < this.value.length; i++){
			if (this.value[i] == " ")
				continue;
			x = ((total_chars % 2 ^ 1)*(0.5 * width)) + (i - Math.floor(total_chars / 2))*(width);
			new_char = fonts[style][this.value[i]].clone();
			new_char.position.set(x, 0, 0);
			this.group.add(new_char);
		}
		this.max_width = (total_chars * width) + (total_chars);
		this.group.position.set(0, 0, 0);
		this.style = style;
		this.scale = scale;
		this.x = x_pos;
		this.y = y_pos;
		this.z = z_pos;
		this.squish = squish;
		this.initPositions(engine)
	}

	update(str, engine){
		this.new(str, this.style, this.x, this.y, this.z, this.scale, this.squish, engine);
	}

	initPositions(engine){
		if (this.group.children.length == 0)
			return ;
		let sc = engine.boundaryX / this.scale;
		this.group.scale.set(sc * this.squish, sc, sc);
		this.group.position.set(engine.boundaryX * this.x, engine.boundaryY * this.y, 0);
	}

	validateCharacters(str){
		if (typeof str == "number")
			str = str.toString();
		let valid = "";
		for (let i = 0; i < str.length; i++) {
			let charCode = str[i].charCodeAt(0);
	
			if (str[i] === " " || str[i] === "-" || str[i] === "_" || str[i] === "|")
				valid += str[i];
			else if (charCode >= 65 && charCode <= 90) 
				valid += str[i];
			else if (charCode >= 97 && charCode <= 122)
				valid += String.fromCharCode(charCode - 32);
			else if (charCode >= 48 && charCode <= 57)
				valid += str[i];
		}
		return valid;
	}

	delete(){
		if (this.group)
			dispose_object(this.group);
		this.value = "";
		this.scale = 0;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		this.max_width = 0;
		this.style = "";
	}
	hide(){
		this.group.visible = false;
	}
	show(){
		this.group.visible = true;
	}
}

function preRenderFonts(){
	const fonts = {"thick" : {}, "thin" : {}};
	const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
	let new_char_thin, new_char_thick;

	for (let n = 0; n < blueprint.length; n++)
	{
		new_char_thin = new THREE.Group();
		new_char_thick = new THREE.Group();
		for (let i = 0; i < 3; i++)
		{
			for (let j = 0; j < blueprint[n][i].length; j++)
			{
				let len, rot_z = 0;
				let x = (-2 + blueprint[n][i][j][0]) / 2;
				let y = (2 - blueprint[n][i][j][1]);
				if (i == 0)
					len = blueprint[n][i][j][2];
				if (i == 1)
				{
					len = blueprint[n][i][j][2] / 2;
					rot_z = Math.PI / 2;
				}
				if (i == 2)
				{
					len = Math.abs(blueprint[n][i][j][2]) % 2 == 0 ? 1.4 : 0.7;
					let factor = -1 * (Math.ceil(blueprint[n][i][j][2] / 2) / 8);
					rot_z =  Math.PI * factor;
				}
				new_char_thick.add(thickBar(len, material, x, y, rot_z));
				new_char_thin.add(thinBar(len, material, x, y, rot_z));

			}
 		}
		new_char_thick.position.set(0, 0, 0);
		new_char_thin.position.set(0, 0, 0);
		fonts["thick"][blueprint[n][3][0][0]] = new_char_thick;
		fonts["thin"][blueprint[n][3][0][0]] = new_char_thin;
	}
	return fonts;
}

function thickBar(len, material, x, y, rot_z){
	let geo = new THREE.BoxGeometry(0.4, len, 0.9);
	let bar = new THREE.Mesh(geo, material);
	bar.position.y = y;
	bar.position.x = x;
	bar.position.z = 0;
	bar.rotation.z = rot_z;
	return bar;
}

function thinBar(len, material, x, y, rot_z){
	let geo = new THREE.BoxGeometry(0.2, len, 10);
	let bar = new THREE.Mesh(geo, material);
	bar.position.y = y;
	bar.position.x = x;
	bar.position.z = -10;
	bar.rotation.z = rot_z;
	return bar;
}