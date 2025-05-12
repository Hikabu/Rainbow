import * as THREE from 'three';
import { order_path, update_min_max } from '../../mainScene/utils/utils';
import { or, orthographicDepthToViewZ } from 'three/tsl';

function get_geometry_normal_vector(geometry)
{
	geometry.computeVertexNormals();
	return new THREE.Vector3(geometry.attributes.normal.array[0], geometry.attributes.normal.array[1], geometry.attributes.normal.array[2]);
}

function reverse_order(points){
	const new_points = [points[0]];
	for (let i = points.length - 1; i >= 1; i--)
		new_points.push(points[i]);
	points = new_points;
}

function reverse_order_in_pairs(points){
	const new_points = [points[0], points[1]];
	for (let i = points.length - 1; i >= 1; i--)
	{
		i--;
		new_points.push(points[i]);
		i++;
		new_points.push(points[i]);
		i--;
	}
	points = new_points;
}

function clean_vector(v, decimals = 5) {
    let factor = Math.pow(10, decimals);
    return new THREE.Vector3(
        Math.round((Math.abs(v.x) < 1e-10 ? 0 : v.x) * factor) / factor,
        Math.round((Math.abs(v.y) < 1e-10 ? 0 : v.y) * factor) / factor,
        Math.round((Math.abs(v.z) < 1e-10 ? 0 : v.z) * factor) / factor
    );
}

class Shape {
	constructor(points, isAbstract = false, normal =null, all_quads = false)
	{
		this.z = 0;
		if (points[0].length == 3)
		{

			for (let i = 0; i < points.length; i++)
			{
				this.z += points[i][2];
			}
			if (this.z != 0)
				this.z /= points.length
		}
		this.vertex3d = [];
		this.vertex3d = points;
		this.vertex2d = [];
		this.material = null;
		this.self = null;
		this.normal = null;
		this.onclick = null;
		this.bbox = null;
		isAbstract == false ? this.quad_geo() : this.abstract_geo(normal, all_quads);
	}
	quad_geo(){
		this.geometry = new THREE.BufferGeometry();
		const vertices = [];
		for (let i = 0; i < this.vertex3d.length; i++)
			vertices.push(this.vertex3d[i][0], this.vertex3d[i][1], this.vertex3d[i][2]);
		this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		const indices = [0, 1, 2, 2, 3, 0];
		this.geometry.setIndex(indices);
		this.calc_uvs();
	}
	abstract_geo(normal, all_quads){
		this.normal = normal;
		const shape = new THREE.Shape();
		this.vertex2d = this.vertex3d.map(v => [v[0], v[1]]);
		shape.moveTo(this.vertex3d[0][0], this.vertex3d[0][1]);
		for (let i = 1; i < this.vertex3d.length; i++)
		{
			shape.lineTo(this.vertex3d[i][0], this.vertex3d[i][1]);
		}
		shape.closePath();
		this.geometry = new THREE.ShapeGeometry(shape);
		if (all_quads)
			this.calc_uvs()
	}
	calc_uvs()
	{
		let curr = get_geometry_normal_vector(this.geometry);
		let target = new THREE.Vector3(0, 0, 1);
		let quaternion = new THREE.Quaternion().setFromUnitVectors(curr, target);
		this.vertex2d = this.vertex3d.map(p => {
			let v = new THREE.Vector3(p[0], p[1], p[2]);
			v.applyQuaternion(quaternion);
			return clean_vector(v);
		});
		const limits = update_min_max(this.vertex2d);
		const minX = limits.min[0]
		const minY = limits.min[1]
		const maxX = limits.max[0]
		const maxY = limits.max[1]
		let uvs =[];
		this.vertex2d.forEach((v)=>{
			uvs.push((v.x - minX) / (maxX - minX));
			uvs.push((v.y - minY) / (maxY - minY));
			// const u = (v.x - minX) / (maxX - minX);
			// const v_ = 1 - (v.y - minY) / (maxY - minY); // <-- flipped Y
			// uvs.push(u, v_);
		});
		uvs = [
			1, 0,  // bottom-left
			0, 0,  // bottom-right
			0, 1,  // top-right
			1, 1   // top-left
		  ];
		this.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
	}
	add_material(material)
	{
		if (this.material == null)
		{
			this.material = material;
			this.self = new THREE.Mesh(this.geometry, this.material);
			this.self.position.z = this.z;
			this.self.userData.instance = this;
		}
		else
		{
			this.self.material = material;
			this.self.material.needsUpdate = true;
		}
	}

	update_material(attribute, value){
		if (this.self == null)
		{
			console.log("Error: no mesh!");
			return;
		}
		if (attribute == "color")
			this.self.material.color.set(value);
		else if (attribute == "roughness")
			this.self.material.roughness = value;
		else if (attribute == "metalness")
			this.self.material.metalness = value;
		else
		{
			console.log("Error: did not recognise material attribute!");
			return ;
		}
		this.self.material.needsUpdate = true;
	}
	get_borders(lineBasicMaterial){
		// console.log(this.geometry, "this geometry");
		const border = new THREE.LineLoop(this.geometry, lineBasicMaterial);
		if (this.z != 0)
			border.position.z -= this.z;
		border.userData.instance = this;
		border.userData.raycaster = false;
		return (border);
	}

	get_points(xPercent, yPercent){
		let limits = update_min_max(this.vertex2d);
		// console.log("limits: ", limits);
		let x = limits.min[0] + ((limits.max[0]- limits.min[0]) * xPercent);
		let y = limits.min[1] + ((limits.max[1]- limits.min[1]) * yPercent);
		let z = limits.min[2];
		const curr = new THREE.Vector3(0, 0, 1);
		const target = get_geometry_normal_vector(this.geometry);
		// console.log("target: ", target)
		if (curr.x == target.x && curr.y == target.y && curr.z == target.z)
			return [x, y, this.vertex3d[0][2]];
		let point = new THREE.Vector3(x, y, z);
		//return (point.x, point.y, point.z)
		let quaternion = new THREE.Quaternion().setFromUnitVectors(curr, target);
		let transformed_point = clean_vector(point.applyQuaternion(quaternion));
		return [transformed_point.x, transformed_point.y, transformed_point.z];
	}

	get_normal(point, parentComponent){
		if (this.normal == null)
		{
			this.normal = get_geometry_normal_vector(this.geometry);
			const origin = new THREE.Vector3(point[0], point[1],point[2]);
			const raycaster = new THREE.Raycaster();
			raycaster.set(origin, this.normal);
			const intersection = raycaster.intersectObject(parentComponent);
			const validIntersections = [];
			for (let i = 0; i < intersection.length; i++)
			{
				if (!(intersection[i].distance == 0 && ! intersection[i].object.userData.raycaster))
					validIntersections.push(intersection[i]);
			}
			if (validIntersections.length > 0)
			{
				this.geometry.index.array = this.geometry.index.array.reverse();
				this.normal = get_geometry_normal_vector(this.geometry);
				reverse_order(this.vertex2d);
				reverse_order(this.vertex3d);
				reverse_order_in_pairs(this.geometry.attributes.uv);
			}
		}
		return this.normal;
	}
	add_onclick(ft) {this.onclick = ft};
	handle_click(){
		if (this.onclick)
			this.onclick();
	}
}

export { Shape };