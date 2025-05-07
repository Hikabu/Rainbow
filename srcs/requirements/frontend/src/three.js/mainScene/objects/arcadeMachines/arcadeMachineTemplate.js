import { Object } from '../../../core/objectFactory/Object'
import { Part } from '../../../core/objectFactory/Part';
import { noiseTexture } from '../materialAssets';
import { scale_points, cube_points, arcade_points, arcade_side_points } from '../geoAssets';
import * as THREE from 'three';

const defaultScreenMaterial =  new THREE.MeshStandardMaterial({
	map: noiseTexture,
	side: THREE.FrontSide,
	opacity: 1,
});


export function make_arcade_machine({height, width, thick, material, border = null, screenBorderThick = 0, sideThick = 0, screenMaterial = defaultScreenMaterial})
{
	const obj = new Object(new Part(
		scale_points(arcade_points, height, width), 
		thick,
		material
	));
	if (border){
		obj.basePart.add_borders([3, 5, 6, 4, 7], border)
		// obj.basePart.add_borders([4, 7], border)
	}
	if (sideThick > 0)
	{
		const sideL = new Part(//should be on blue aka index 0
			scale_points(arcade_side_points, height, width), 
			sideThick,
			material[0],
		);
		const sideR= new Part(
			scale_points(arcade_side_points, height, width), 
			sideThick,
			material[0],
		);
		obj.add_object(0.5, 0.5, [0, 0], sideL, [0, 1, 0])
		obj.add_object(0.5, 0.5, [0, 1], sideR, [0, 1, 0], -1)
		if (border){
			sideL.add_borders([2, 3, 4, 5, 6, 7], border)
			sideR.add_borders([2, 3, 4, 5, 6, 7], border)
		}
	}
	const dimension = thick * 0.7
	const screen = new Object(new Part(scale_points(cube_points, dimension, dimension), 0.001, new THREE.MeshStandardMaterial({ color: 0x0000ff, side: THREE.DoubleSide }), true))
	obj.add_object(0.5, 0.5, [0, 5], screen, [0, 1, 0], 1)
	screen.basePart.shapes[0].geometry.scale(1, 1, -1);
	screen.basePart.shapes[0].geometry.computeVertexNormals();
	const partIndex = 1;
	const surfaceIndex = 0;
	return ({"object" : obj, "screenObj:": screen, "screenSurface" : screen.basePart.shapes[0], "partIndex" : partIndex, "surfaceIndex": surfaceIndex});
}

function create_joystick(material){
	let mat;
	mat = (! (Array.isArray(material))) ? material : material.length < 2 ? material[material.length - 1] : material[1];
	const joystick = new Object(new Part(scale_points(cube_points, 0.03, 0.03), 0.5, mat))
	const geometry = new THREE.SphereGeometry(0.08, 64, 64); // radius 1, segments
	const geometryb = new THREE.ConeGeometry(0.15, 0.15, 64, 64)
	mat = (! (Array.isArray(material))) ? material : material.length < 3 ? material[material.length - 1] : material[2];
	const base = new THREE.Mesh(geometryb, mat);
	joystick.add_object(0.5, 0.5, [0, 1], base, [0,0,1], 1, true)
	base.rotation.x += Math.PI/2
	mat = (! (Array.isArray(material))) ? material : material[0];
	const ball = new THREE.Mesh(geometry, mat);
	joystick.add_object(0.5, 0.5, [0, 0], ball, [0,0,1], 1, true, 0.8)
	return joystick;
}

function create_button(amount, material,  rows = 1,radius = 0.05) {
	const group = new THREE.Group();
	const geometry = new THREE.CylinderGeometry(radius, radius, 0.1, 16);
	const spacing = radius * 4;

	let prev_row = 0;
	let buttonsPerRow = Math.ceil(amount / rows);
	let og_buttonsPerRow = buttonsPerRow;
	for (let i = 0; i < amount; i++) {
		let mat = (! (Array.isArray(material))) ? material : material.length < i + 1 ? material[material.length - 1] : material[i];
		const button = new THREE.Mesh(geometry, mat);
		button.rotation.x = Math.PI / 2;
		const row = Math.floor(i / og_buttonsPerRow);
		if (row + 2 >= rows && prev_row != row && amount - i < buttonsPerRow)
			buttonsPerRow = amount - i;
		prev_row = row;
		const col = i % buttonsPerRow;
		let xOffset = (col - (buttonsPerRow - 1) / 2) * spacing;
		if (buttonsPerRow == 1)
			xOffset = 0;
		const yOffset = -((row - (rows - 1) / 2) * spacing);
		button.position.set(xOffset, yOffset, 0);
		group.add(button);
	}
	return group;
}

export function create_controls(machine, controls){
	const base = new Object(new Part(scale_points(cube_points, 2.5, 0.5), 0.01, new THREE.MeshBasicMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: 0,
	})))
	const factory = {
		"joystick" : create_joystick,
		"button" : create_button,
	}
	const re_position = {
		"joystick" : (obj)=>{obj.self.rotation.x += Math.PI/8},
		"button" : ()=>{}

	}
	const pos = {
		"center" : 0.5,
		"right" : 0.8,
		"left" : 0.2,
	}
	const posY = {
		"joystick" : 0.3,
		"button" : 0.55
	}
	controls.forEach(control => {
		const obj = factory[control.factory](... control.factory_arguments);
		let x = Number.isFinite(control.x) ? control.x : pos[control.x];
		base.add_object(x , posY[control.factory], [0, 0], obj, [0, 1, 0], 1, true, 0.5)
		re_position[control.factory](obj)
	})
	machine.add_object(0.5, 0.5, [0, 4], base, [0, 0, 1], true)	
	base.self.rotation.z += Math.PI / 2;
	base.self.position.y -= 0.8;
	base.self.position.z += 1;
	base.self.position.x -= 0.35;
}

export function add_controls(side, controls, obj){
	let controlObj;
	if (controls == "handle")
	{
		controlObj = create_handle(new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }))
	}
	obj.add_object(0.5, 0.5, [0, 4], controlObj, [0, 0, 1], true, )
	controlObj.self.rotation.z += Math.PI / 2;
	controlObj.self.position.y -= 0.8;
	controlObj.self.position.z += 1;
	controlObj.self.position.x -= 0.35;
}
