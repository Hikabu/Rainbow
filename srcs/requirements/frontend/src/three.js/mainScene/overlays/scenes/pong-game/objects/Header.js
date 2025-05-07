import { Font } from "../../../../../core/objectFactory/customFont3d";
import * as THREE from 'three';

export class Header {
	constructor(visibility, engine){
		this.name1 = new Font(visibility, engine);
		this.name2 = new Font(visibility, engine);
		this.score1 = new Font(visibility, engine);
		this.score2 = new Font(visibility, engine);
	}
	
	new(visibility, name1, name2, engine){
		this.name1.new(name1, "thick", -0.7, 0.8, 0, 0, 1.5, engine);
		this.name2.new(name2, "thick", +0.7, 0.8, 0, 0, 1.5, engine);
		let scale = this.name1.max_width > this.name2.max_width ? this.name1.max_width : this.name2.max_width; 
		scale *= 2.2;
		this.name1.scale = scale;
		this.name2.scale = scale;
		this.name1.initPositions(engine);
		this.name2.initPositions(engine);
		let scale2 = 15;
		this.score1.new(0, "thin", -0.22, 0.9, 0, scale2, 1, engine);
		this.score2.new(0, "thin", 0.22, 0.9, 0,scale2, 1, engine);
		if (visibility == "hide")
			this.hide();
	}

	newGroup(side, value, engine){
		let group = new THREE.Group();
		typeof value == "number" ? this.digitTo3D(value, group) : this.stringTo3D(value, group);
		engine.scene.add(group);
		return {"group": group, "side": side, "value": value};
	}
	
	initPositions(engine){
		this.name1.initPositions(engine);
		this.name2.initPositions(engine);
		this.score1.initPositions(engine);
		this.score2.initPositions(engine);
	}
	
	updateScores(newScore1, newScore2, engine){
		if (newScore1 != this.score1.value)
			this.score1.update(newScore1, engine);
		if (newScore2 != this.score2.value)
			this.score2.update(newScore2, engine);
	}

	hide(){
		this.name1.hide();
		this.name2.hide();
		this.score1.hide();
		this.score2.hide();
	}
	
	show(){
		this.name1.show();
		this.name2.show();
		this.score1.show();
		this.score2.show();
	}
}