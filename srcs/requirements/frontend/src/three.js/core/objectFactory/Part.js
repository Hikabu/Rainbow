import * as THREE from 'three';
import { Shape } from "./Shape";
import { order_path, mapToCenter } from '../../mainScene/utils/utils';

import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

class Part {
	constructor(pointsLeftXY, pointsRightXY, materials){
		this.width = 0;
		this.shapes = [];
		this.self = null;
		//this.mesh = null;
		this.joined_parts = [];
		this.pointsRight = pointsRightXY;
		this.pointsLeft = pointsLeftXY;
		this.validatePoints();
		if (this.pointsRight == null)
		{
			console.log("Incorrect parameters");
			return;
		}
		this.init();
		if (materials)
			this.add_material(materials);
		else
			console.log("forgot to add materials!");
		this.onclick = null;
	}
	validatePoints()
	{
		if (! Array.isArray(this.pointsLeft))
		{
			console.log("no left points")
			this.pointsRight = null;
		}
		else if (! Array.isArray(this.pointsRight))
		{
			this.width = this.pointsRight / 2;
			if (this.pointsLeft[0].length == 2)
			{
				for (let i = 0; i < this.pointsLeft.length; i++)
					this.pointsLeft[i] = [this.pointsLeft[i][0], this.pointsLeft[i][1], - this.width];
			}
			this.pointsRight = this.pointsLeft.map(p => {
				let v = [p[0], p[1], this.width];
				return v;
			})
		}
		else if (this.pointsLeft.length != this.pointsRight.length)
		{
			console.log("incorrect length")
			this.pointsRight = null;
		}
	}
	init(){
		const newPoints = mapToCenter(this.pointsLeft, this.pointsRight);
		this.pointsLeft = newPoints.left;
		this.pointsRight = newPoints.right;
		this.pointsRight = order_path(this.pointsRight);
		this.pointsLeft = order_path(this.pointsLeft);
		this.shapes[0] =  new Shape(this.pointsRight, true);
		this.shapes[1] = new Shape(this.pointsLeft, true);
		for (let i = 0; i < this.pointsRight.length; i++){
			const currRight = this.pointsRight[i];
			const nextRight = i + 1 < this.pointsRight.length ? this.pointsRight[i + 1] : this.pointsRight[0];	
			const currLeft = this.pointsLeft[i];
			const nextLeft = i + 1 < this.pointsLeft.length ? this.pointsLeft[i + 1] : this.pointsLeft[0];
			this.shapes.push(new Shape([currRight, nextRight, nextLeft, currLeft], false));
		}
	}
	add_material(materials){
		if (! Array.isArray(materials))
		{
			for (let i = 0; i < this.shapes.length; i++)
				this.shapes[i].add_material(materials);
		}
		else
		{
			for (let i = 0; i < this.shapes.length; i++)
			{
				let j = i < materials.length ? i : materials.length - 1;
				this.shapes[i].add_material(materials[j]);
			}
		}
		if (!this.self);
			this.init_group();		
	}
	center_group(){
		let box = new THREE.Box3().setFromObject(this.self);
   		let center = new THREE.Vector3();
    	box.getCenter(center);
		this.self.children.forEach(child => { child.position.sub(center);});
	}
	init_group(){
		this.self = new THREE.Group();
		// this.mesh = new THREE.Group();
		for (let i = 0; i < this.shapes.length; i++)
		{
			// this.mesh.add(this.shapes[i].self);
			this.self.add(this.shapes[i].self);
		}
		// this.self = this.mesh.clone()
		this.self.userData.instance = this;
		//this.center_group();
	}
	add_borders(map, lineBasicMaterial){
		if (!lineBasicMaterial)
		{
			console.log("ERROR: you forgot to add material to add border!");
			return;
		}
		if (!Array.isArray(map))
		{
			console.log("ERROR: map in add_border should be an array!");
			return ;
		}
		if (map.length == 0)
		{
			for (let i = 0; i < this.shapes.length; i++)
				map.push(i);
		}
		for (let i = 0; i < map.length; i++)
		{
			let material = Array.isArray(lineBasicMaterial) ? lineBasicMaterial[i] : lineBasicMaterial;
			this.self.add(this.shapes[map[i]].get_borders(material));
		}
	}

	// add_object(xPercent, yPercent, index, object, obj_height, obj_up){
	// 	const surface = this.shapes[index];
	// 	const point = surface.get_points(xPercent, yPercent);
	// 	const forward = surface.get_normal(point, this.self).normalize();
	// 	const up = new THREE.Vector3(obj_up[0], obj_up[1], obj_up[2]); // choose your up vector
	// 	const right = new THREE.Vector3().crossVectors(up, forward).normalize();
	// 	const adjustedUp = new THREE.Vector3().crossVectors(forward, right).normalize();
	// 	const matrix = new THREE.Matrix4();
	// 	matrix.makeBasis(right, adjustedUp, forward);
	// 	object.quaternion.setFromRotationMatrix(matrix);
	// 	object.updateMatrixWorld(true);
	// 	const bbox = new THREE.Box3().setFromObject(object);
	// 	let object_half_len = obj_height ? (bbox.max.y - bbox.min.y) * 0.5: 0;
	// 	console.log("point before: ", point);
	// 	// if (object instanceof CSS3DObject && (forward.x != 0 || forward.y != 0 || forward.z != 1)) {
	// 	// 	let min = surface.get_points(0, 0);
	// 	// 	let max = surface.get_points(1, 1);
	// 	// 	let len = [[max[0] - min[0]], [max[1] - min[1]]];
	// 	// 	point[0] -= (len[0] * 0.5);
	// 	// 	point[1] -= (len[1] * 0.5);
	// 	// 	console.log("point after: ", point);
	// 	// 	console.log("forward: ", forward);
	// 	// }
	// 	// object.position.set(
	// 	// 	point[0] + (forward.x * object_half_len),
	// 	// 	point[1] + (forward.y * object_half_len),
	// 	// 	point[2] + (forward.z * object_half_len) 
	// 	// );
	// 	object.position.set(
	// 		point[0],
	// 		point[1],
	// 		point[2],
	// 	);
	// 	this.self.add(object);
	// 	this.joined_parts.push(object);
	// }
	add_object(xPercent, yPercent, index, object, obj_height, obj_up) {
		const surface = this.shapes[index];
		const point = surface.get_points(xPercent, yPercent);
		const forward = surface.get_normal(point, this.self).normalize();
		const up = new THREE.Vector3(obj_up[0], obj_up[1], obj_up[2]);
		const right = new THREE.Vector3().crossVectors(up, forward).normalize();
		const adjustedUp = new THREE.Vector3().crossVectors(forward, right).normalize();
	
		// Apply quaternion to object based on forward, up, right
		const matrix = new THREE.Matrix4();
		matrix.makeBasis(right, adjustedUp, forward);
		object.quaternion.setFromRotationMatrix(matrix);
		object.updateMatrixWorld(true);
	
		// Get object's bounding box size
		const bbox = new THREE.Box3().setFromObject(object);
		let object_half_len = obj_height ? (bbox.max.y - bbox.min.y) * 0.5 : 0;
	

			object.position.set(
				point[0] + (forward.x * object_half_len),
				point[1] + (forward.y * object_half_len),
				point[2] + (forward.z * object_half_len)
			);
	
		// Add object to scene and tracking
		this.self.add(object);
		this.joined_parts.push(object);
	}
	
}

export { Part };
