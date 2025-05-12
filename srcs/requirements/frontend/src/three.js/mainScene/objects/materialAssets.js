import * as THREE from 'three';
import { Part } from '../../core/objectFactory/Part'
import { OnLoad } from '../utils/OnLoad';
const materialsgroup = [//phong
	new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide}),
	new THREE.MeshStandardMaterial({ color: 0xfff000, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x0000ff, side: THREE.DoubleSide}),
	new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide}),
]
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () =>
	{
		// console.log('loading started')
	}
	loadingManager.onLoad = () =>
	{
		// console.log('loading finished')
		new OnLoad().set_texture_ready()
	}
	loadingManager.onProgress = () =>
	{
		// console.log('loading progressing')
	}
	loadingManager.onError = () =>
	{
		// console.log('loading error')
	}
const textureLoader = new THREE.TextureLoader(loadingManager);

export const noiseTexture = textureLoader.load('../../../assets/noise3.jpg');
export const screenMaterial = new THREE.MeshStandardMaterial({
	map: noiseTexture,  // Apply scanline texture
	side: THREE.FrontSide,  // Can also be THREE.BackSide depending on how you want to view the screen
	opacity: 1,
});


export const cold = [
	{
	"arcade_machine_material" : [
		new THREE.MeshStandardMaterial({ color: 0x220033, side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ color: 0x220033, side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ color: 0x331155, side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ color: 0x111122, side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ color: 0x222244, side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ color: 0x00ffee, side: THREE.DoubleSide }),
new THREE.MeshStandardMaterial({ color: 0xff00cc, side: THREE.DoubleSide }),


	],
	"border_material" : new THREE.MeshStandardMaterial({ color: 0xff00ff, side: THREE.DoubleSide }),
	"joystick_material" : [
				new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.9, roughness: 0.1, emissive: 0x880088, emissiveIntensity: 0.6, side: THREE.DoubleSide }),
		new THREE.MeshBasicMaterial({ color: 0x110011, side: THREE.DoubleSide }),
		new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.6, roughness: 0.2, side: THREE.DoubleSide }),
	],
	"button_material" : [
				new THREE.MeshStandardMaterial({ color: 0xff00ff, side: THREE.DoubleSide }),
		new THREE.MeshStandardMaterial({ color: 0x00ffff, side: THREE.DoubleSide }),
		new THREE.MeshStandardMaterial({ color: 0xffcc00, side: THREE.DoubleSide }),
		new THREE.MeshStandardMaterial({ color: 0x8800ff, side: THREE.DoubleSide }),
		new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
		new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),


	]
},
{
	"arcade_machine_material" : [
			new THREE.MeshStandardMaterial({ color: 0x220033, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x220033, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x550088, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x220022, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0xff00ff, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x00ffff, side: THREE.DoubleSide })



	],
	"border_material" : new THREE.MeshStandardMaterial({ color: 0x00ffff, side: THREE.DoubleSide }),
	"joystick_material" : [
			new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.9, roughness: 0.1, emissive: 0x440044, emissiveIntensity: 0.8, side: THREE.DoubleSide }),
	new THREE.MeshBasicMaterial({ color: 0x110011, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.5, roughness: 0.3, side: THREE.DoubleSide }),


	],
	"button_material" : [
			new THREE.MeshStandardMaterial({ color: 0xff00ff, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x00ffff, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0xffff00, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0xff9900, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),


	]
},
{
	"arcade_machine_material" : [
			new THREE.MeshStandardMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x111144, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x4444ff, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })



	],
	"border_material" : new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide }),
	"joystick_material" : [
			new THREE.MeshStandardMaterial({ color: 0x8888ff, metalness: 0.9, roughness: 0.1, emissive: 0x2222ff, emissiveIntensity: 0.6, side: THREE.DoubleSide }),
	new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x333366, metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide }),

	],
	"button_material" : [
			new THREE.MeshStandardMaterial({ color: 0x5555ff, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x88ccff, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0xccccff, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x4444aa, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
	new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide }),


	]
},
// {
// 	"arcade_machine_material" : [
// 			new THREE.MeshStandardMaterial({ color: 0x002244, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x002244, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x003366, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x001122, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x223344, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x001122, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x001122, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x3399ff, side: THREE.DoubleSide })


// 	],
// 	"border_material" : new THREE.MeshStandardMaterial({ color: 0x66ccff, side: THREE.DoubleSide }),
// 	"joystick_material" : [
// 			new THREE.MeshStandardMaterial({ color: 0x3399ff, metalness: 0.6, roughness: 0.2, side: THREE.DoubleSide }),
// 	new THREE.MeshBasicMaterial({ color: 0x002244, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x003366, metalness: 0.8, roughness: 0.1, side: THREE.DoubleSide })


// 	],
// 	"button_material" : [
// 			new THREE.MeshStandardMaterial({ color: 0x3399ff, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x00ccff, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x0099cc, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x006699, side: THREE.DoubleSide }),
// 	new THREE.MeshStandardMaterial({ color: 0x0000ff, side: THREE.DoubleSide })


// 	]
// },


];
// {
// 	"arcade_machine_material" : [

// 	],
// 	"border_material" : [

// 	],
// 	"joystick_material" : [

// 	],
// 	"button_material" : [

// 	]
// },
export const hot = [
	{
		"arcade_machine_material" : [
			new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x660000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x990000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xb30000, side: THREE.DoubleSide })
		],
		"border_material" : new THREE.MeshStandardMaterial({ color: 0xffcc00, side: THREE.DoubleSide }),
		"joystick_material" : [
			new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.9, roughness: 0.2, emissive: 0x330000, emissiveIntensity: 0.3, side: THREE.DoubleSide }),
			new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x660000, metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide }),
		],
		"button_material" : [
			new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x990000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xffff00, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide }),
		]
	},
	{
		"arcade_machine_material" : [
			new THREE.MeshStandardMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x331100, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x220000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x110000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xff2200, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xff6600, side: THREE.DoubleSide }),
		],
		"border_material" : new THREE.MeshStandardMaterial({ color: 0xff3300, side: THREE.DoubleSide }),
		"joystick_material" : [
			new THREE.MeshStandardMaterial({ color: 0xff3300, metalness: 0.8, roughness: 0.2, emissive: 0x660000, emissiveIntensity: 0.4, side: THREE.DoubleSide }),
			new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x330000, metalness: 0.4, roughness: 0.5, side: THREE.DoubleSide }),
		],
		"button_material" : [
			new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xff6600, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xffff00, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x990000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x330000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),
		]
	},
	{
		"arcade_machine_material" : [
			new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x202020, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x2a2a2a, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x1f1f1f, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide })
		],
		"border_material" : new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
		"joystick_material" : [
			new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.9, roughness: 0.1, emissive: 0x111111, emissiveIntensity: 1, side: THREE.DoubleSide }),
			new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.85, roughness: 0.1, side: THREE.DoubleSide })
		],
		"button_material" : [
			new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xfff000, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xff00ff, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0xf0f0ff, side: THREE.DoubleSide }),
			new THREE.MeshStandardMaterial({ color: 0x0000ff, side: THREE.DoubleSide })
		]
	},
];
