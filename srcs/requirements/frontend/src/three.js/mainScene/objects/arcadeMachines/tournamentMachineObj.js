import { make_arcade_machine, create_controls } from './arcadeMachineTemplate';
import {hot, cold} from '../materialAssets'

// let i = 1;
// let array = hot;

let i = 1;
let array  =cold;

const arcade_machine_material = array[i]["arcade_machine_material"];
const border_material = array[i]["border_material"];
const joystick_material = array[i]["joystick_material"];
const button_material = array[i]["button_material"];

const machine = make_arcade_machine({
	width: 6,
	height: 1, 
	thick: 2.5,
	sideThick: 0.01,
	material: arcade_machine_material,
	border: border_material,
})

const tourMachineObj = machine.object;

create_controls(tourMachineObj, 
[
	{
		"factory" : "button",
		"factory_arguments" : [
			3, 
			button_material,
			1
		],
		"x" : 0.3,
	},
	{
		"factory" : "button",
		"factory_arguments" : [
			4, 
			button_material.slice(1),
			2
		],
		"x" : 0.7,
	},

])

const partIndex = machine.partIndex;
const surfaceIndex = machine.surfaceIndex;
const screenSurface = machine.screenSurface;

// screenSurface.self.add(screenSurface.get_borders(border_material))
const center = tourMachineObj.self.position.clone();
center.z += 2;
export {tourMachineObj, screenSurface, center, partIndex, surfaceIndex}