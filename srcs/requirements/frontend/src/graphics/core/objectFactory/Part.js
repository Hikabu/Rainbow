import * as THREE from 'three';
import { Shape } from "./Shape";
import { order_path, mapToCenter } from '../../mainScene/utils/utils';

class Part {
	constructor(pointsLeftXY, pointsRightXY, materials){
		this.width = 0;
		this.shapes = [];
		this.self = null;
		this.joined_parts = [];
		if (! Array.isArray(pointsRightXY))
			this.init_symetrical(pointsLeftXY, pointsRightXY);
		else if (pointsLeftXY.length == pointsRightXY.length)
			this.init_asymetrical(pointsLeftXY, pointsRightXY);
		else
			throw new Error("Incorrect parameters");
		if (materials)
			this.add_material(materials);
		else
			console.log("forgot to add materials!");
		this.onclick = null;
	}
	init_symetrical(points, thickness){
		this.width = thickness;
		if (points[0].length == 2)
		{
			for (let i = 0; i < points.length; i++)
				points[i] = [points[i][0], points[i][1], 0];
		}
		let t_points = points.map(p => {
			let v = [p[0], p[1], thickness];
			return v;
		})
		return this.init_asymetrical(points, t_points);
	}
	init_asymetrical(pLeft, pRight){
		const newPoints = mapToCenter(pLeft, pRight);
		pRight = order_path(newPoints.right);
		this.shapes[0] =  new Shape(pRight);
		pLeft = order_path(newPoints.left);
		this.shapes[1] = new Shape(pLeft);
		for (let i = 0; i < pRight.length; i++){
			const currRight = pRight[i];
			const nextRight = i + 1 < pRight.length ? pRight[i + 1] : pRight[0];	
			const currLeft = pLeft[i];
			const nextLeft = i + 1 < pLeft.length ? pLeft[i + 1] : pLeft[0];
			this.shapes.push(new Shape([currRight, nextRight, nextLeft, currLeft]));
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
		for (let i = 0; i < this.shapes.length; i++)
			this.self.add(this.shapes[i].self);
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

	add_object(xPercent, yPercent, index, object, obj_height, obj_axis){
		object.updateMatrixWorld();
		const bbox = new THREE.Box3().setFromObject(object);
		let object_half_len = obj_height ? (bbox.max.y - bbox.min.y) * 0.5: 0;
		const surface = this.shapes[index];
		const point = surface.get_points(xPercent, yPercent);

		const curr_orientation = new THREE.Vector3(obj_axis[0], obj_axis[1], obj_axis[2]);
		const target = surface.get_normal(point, this.self);
		let quaternion = new THREE.Quaternion();
		quaternion.setFromUnitVectors(curr_orientation, target);
		object.applyQuaternion(quaternion);
		object.position.set(
			point[0] + (target.x * object_half_len),
			point[1] + (target.y * object_half_len),
			point[2] + (target.z * object_half_len) 
		);
		this.self.add(object);
		this.joined_parts.push(object);
	}
}

export { Part };
