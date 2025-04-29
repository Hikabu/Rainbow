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

const texture = textureLoader.load('../../../assets/image1.jpg');
texture.colorSpace = THREE.SRGBColorSpace;

const noiseTexture = textureLoader.load('../../../assets/noise3.jpg');
// noiseTexture.wrapS = THREE.RepeatWrapping;
// noiseTexture.wrapT = THREE.RepeatWrapping;
// noiseTexture.repeat.set(3, 3); // Adjust the repetition of the texture
// noiseTexture.minFilter = THREE.LinearFilter; 
// texture.colorSpace = THREE.LinearEncoding;

const textureMat =   new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, opacity: 1 });

const singleMaterial = materialsgroup[1];

const lineBasicMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 5 });

const part_sym_2d = new Part(
	[[0, 0], [0, 1], [2, 1], [2, 0]], 
	1,
	textureMat,
);

const part_sym_3d = new Part(
	[[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], 
	1,
	materialsgroup[2]
);

const part_asym = new Part(
	[[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], 
	[[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]],
	materialsgroup
);

// const part_asym_ang = new Part(
// 	[[0, 0, -2], [0, 1, -2], [1, 1, -2], [1, 0, -2]], 
// 	[[1, 1, 1], [1, 2, 0], [2, 2, 0], [2, 1, 1]],
// 	materialsgroup
// )

const geo = new THREE.BoxGeometry(1, 1, 1);
const threeCube = new THREE.Mesh(geo, singleMaterial);

const part_asym_ang = 2;

//NEW  SHARED ASSETS

// const screenMaterial = new THREE.MeshStandardMaterial({
// 	color: 0xffffff,
// 	emissive: 0xffffff,
// 	emissiveIntensity: 1,
// 	roughness: 0,
// 	metalness: 0 
//   });

  const screenMaterial = new THREE.MeshStandardMaterial({
	map: noiseTexture,  // Apply scanline texture
	side: THREE.FrontSide,  // Can also be THREE.BackSide depending on how you want to view the screen
	opacity: 1,
});

// const screenMaterial = new THREE.ShaderMaterial({
//     uniforms: {
//         texture: { value: noiseTexture },
//         brightness: { value: 1.5 },
//         resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) } // Pass screen resolution
//     },
// 	fragmentShader: `
// 	uniform sampler2D u_texture; // Renamed the uniform here as well
// 	uniform float brightness;
// 	uniform vec2 resolution; // Declare resolution uniform

// 	void main() {
// 		// Normalize texture coordinates and sample the texture
// 		vec2 uv = gl_FragCoord.xy / resolution.xy; // Normalize the coordinates to [0, 1]
// 		vec4 color = texture(u_texture, uv); // Sample the texture using normalized coordinates
// 		color.rgb *= brightness; // Multiply by brightness to make the noise more visible
// 		gl_FragColor = color;
// 	}
// `
// });



export { materialsgroup, singleMaterial, lineBasicMaterial, 
	part_sym_2d, part_sym_3d, 
	part_asym, part_asym_ang,
	threeCube,

	screenMaterial,
}