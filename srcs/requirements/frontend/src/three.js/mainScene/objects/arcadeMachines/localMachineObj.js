import { make_arcade_machine, create_controls } from './arcadeMachineTemplate';
import {hot, cold} from '../materialAssets'

// let i = 2;
// let array = hot;
let i = 2;
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

const localMachineObj = machine.object;

create_controls(localMachineObj, 
[
	{
		"factory" : "joystick",
		"factory_arguments" : [joystick_material],
		"x" : "left",
	},
	{
		"factory" : "joystick",
		"factory_arguments" : [joystick_material],
		"x" : "right",
	},
])

const partIndex = machine.partIndex;
const surfaceIndex = machine.surfaceIndex;
const screenSurface = machine.screenSurface;
const center = localMachineObj.self.position.clone();
center.z += 2;
export {localMachineObj, screenSurface, center, partIndex, surfaceIndex}