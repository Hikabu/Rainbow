
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import * as THREE from 'three';
import { MainEngine } from '../../utils/MainEngine';

let state = -1;
document.addEventListener('keydown', (event) => {
	if (state < 1 && event.key == "s")
	{
		change_state()
	}
	if (state == 1)
	{
		let total = all_balls.children.length;
		for (let i = 0; i < all_balls.children.length; i++) {
			const ball = balls.children[0];
	
			const t = i / (total - 1); // normalize index from 0 to 1
			const targetZ = maxZ - t * (maxZ - minZ);// adjust minZ/maxZ as needed
			const curveY = Math.sin(t * Math.PI); // same arch
			const targetY = minY + curveY * (maxY - minY);
			const curveX = 1 - Math.sin(t * Math.PI);  // 1 → 0 → 1
			const targetX = minX + curveX * ((maxX - minX ) * factor); 
	
			// ball.position.set(targetX, targetY, targetZ)
			const currentPos = ball.position.clone();
			ball.userData.startPosition = currentPos;
			ball.userData.animationStartTime = performance.now();
			ball.userData.animating = true;
			ball.userData.targetX = targetX;
			ball.userData.targetY = targetY;
			ball.userData.targetZ = targetZ;
	
			all_balls.add(ball);
		}
		if (event.key == "ArrowDown")
		{
			
		}
		if (event.key == "ArrowUp")
		{
			
		}
	}
	
});

const init_states = [
	()=>{enter_display()},
	()=>{enter_all()}
]
const exit_states = [
	()=>{},
	()=>{},

]

function change_state()
{
	if (state >= 0)
		exit_states[state]()
	if (state + 1 < init_states.length)
		state += 1;
	else
		state = 0
	init_states[state]()

}

let balls=null, all_balls=null;
function enter_display(){
	const total_balls = friends.length < 5 ? 5 : friends.length > 15 ? 15 : friends.length;
	const gridSize = Math.ceil(Math.sqrt(total_balls));
	const cellIndices = [];
	for (let x = 0; x < gridSize; x++) {
		for (let y = 0; y < gridSize; y++) {
				cellIndices.push({x, y});
		}
	}
	shuffleArray(cellIndices);
	balls = new THREE.Group();
	add_balls(balls, total_balls, cellIndices, gridSize)
	console.log("balls after: ", balls)
}

let duration;
let transition = false;
let friends_index;
function enter_all(){
	duration = 2000;
	transition = true;
	console.log("enter second state")
	all_balls = new THREE.Group()
	let f = 0.5;
	const total = balls.children.length;
	const minX = -width / 2 + f;
	const maxX = minX + width - f - f;
	const minY = -height / 2 + f / 2;
	const maxY =  minY + height - f;
	const minZ = -length / 2 + f / 2;
	const maxZ = minZ + length - f ;
	glass.self.add(all_balls);
	//console.log("x range ", minX, maxX)
	console.log("y range ", minY, maxY)
	console.log("z range ", minZ, maxZ)
	const factor = (1 / 5) + ((total - 5) / (15 - 5)) * (1 - 1 / 5);
	friends_index = total - 1

	for (let i = 0; i < total; i++) {
		const ball = balls.children[0];

		const t = i / (total - 1); // normalize index from 0 to 1
		const targetZ = maxZ - t * (maxZ - minZ);// adjust minZ/maxZ as needed
		const curveY = Math.sin(t * Math.PI); // same arch
		const targetY = minY + curveY * (maxY - minY);
		const curveX = 1 - Math.sin(t * Math.PI);  // 1 → 0 → 1
		const targetX = minX + curveX * ((maxX - minX ) * factor); 

		// ball.position.set(targetX, targetY, targetZ)
		const currentPos = ball.position.clone();
		ball.userData.startPosition = currentPos;
		ball.userData.animationStartTime = performance.now();
		ball.userData.animating = true;
		ball.userData.targetX = targetX;
		ball.userData.targetY = targetY;
		ball.userData.targetZ = targetZ;

		all_balls.add(ball);
	}
	glass.self.remove(balls);
	balls = null;
}


function add_balls(ball_group, total_balls, cellIndices, gridSize)
{
	for (let i = 0; i < total_balls; i++) {
		//create mesh
		let ball;
		const geometry = new THREE.BufferGeometry();
		const vertices = new Float32Array([0, 0, 0]);
		geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		const material = new THREE.PointsMaterial({
			color: 0xff00ff,
			size: 0.2,
			sizeAttenuation: true
		});
		ball = new THREE.Points(geometry, material);
	
		//bounded random pos:
		const { x, y} = cellIndices[i];
		const jitter = 0.4;
		let min_x, min_z, max_x, max_z, total_x, total_z;
		let f = 0.2;
		total_x = height - (2 * f)
		total_z = length - (2 * f)
		min_x = ((- height / 2) + f) + (total_x * (x/ gridSize))
		min_z = ((- length / 2) + f) + (total_z * (y/ gridSize))
		max_x = min_x + (total_x / gridSize);
		max_z = min_z + (total_z / gridSize);
		const pos = new THREE.Vector3(
			min_x + ((max_x - min_x) * 0.5),
			THREE.MathUtils.randFloat((- width / 2 ) +f , (width / 2) - f),
			min_z + ((max_z - min_z) * 0.5),
		);
	
		ball.position.copy(pos);

		// Save Y for floating effect
		const baseZ = ball.position.z;
		const amplitude = 0.05;
		const frequency = THREE.MathUtils.randFloat(0.0015, 0.0025);
		const offset = Math.random() * Math.PI * 2;
		ball.userData.float = { baseZ, amplitude, frequency, offset };
	
		// Add avatar label
		let avatar = friends && i < friends.length ? friends[i].avatar : null
		add_avatar(avatar, ball);
		ball_group.add(ball);
	}
	glass.self.add(ball_group)
}

function add_avatar(avatar, ball)
{
	const div = document.createElement('div');
	div.className = 'label';
	div.style.width = '40px';
	div.style.height = '40px';
	div.style.borderRadius = '50%';
	div.style.overflow = 'hidden';
	div.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';

	const overlay = document.createElement('div');
	overlay.style.position = 'absolute';
	overlay.style.top = '0';
	overlay.style.left = '0';
	overlay.style.width = '100%';
	overlay.style.height = '100%';
	overlay.style.borderRadius = '59%';
	overlay.style.background = `
	radial-gradient(
		circle at 50% 50%,
		transparent 40%,
		rgba(0, 0, 0, 0.4) 80%,
		rgba(0, 0, 0, 0.8)
	)
	`;
	div.appendChild(overlay);
	if (avatar)
	{
		const img = document.createElement('img');
		console.log("avatar: ", avatar)
		img.src = avatar;
		img.style.width = '100%';
		img.style.height = '100%';
		img.style.objectFit = 'cover';
		div.appendChild(img);

	}
	const label = new CSS3DObject(div);
	label.userData.isLabel = true;
	label.position.set(0, 0, 0)
	label.rotation.x = - Math.PI/2;
	label.scale.set(0.012, 0.012, 0.012);
	ball.add(label);
}

export function resize(){
	if (balls)
	{
		for (let i = 0; i < balls.children.length; i++)
		{
			const ball = balls.children[i];
			const label = ball.children.find(child => child.userData.isLabel);
			if (label)
				updateLabel(label, ball, engine.camera, engine.renderer)
		}
	}
	if (all_balls)
	{
		for (let i = 0; i < all_balls.children.length; i++)
		{
			const ball = all_balls.children[i];
			const label = ball.children.find(child => child.userData.isLabel);
			if (label)
				updateLabel(label, ball, engine.camera, engine.renderer)
		}
	}
}


const engine = new MainEngine()

  
export {test, animateBalls}


function animateBalls() {

	const t = Date.now();
	//balls.rotation.x += 0.003
	if (state == 0 && balls)
	{
		balls.rotation.z += 0.002

		balls.children.forEach(ball => {
			if (ball.children[0])
				ball.children[0].lookAt(engine.camera.position);			
			const { baseZ, amplitude, frequency, offset } = ball.userData.float;
			const delta = Math.sin(t * frequency + offset) * amplitude;
			ball.position.z = baseZ + delta;
		});
	}
	if (state == 1 && all_balls)
	{
		const now = performance.now();
		all_balls.children.forEach(ball => {
			if (ball.children[0])
				ball.children[0].lookAt(engine.camera.position);
			if (ball.userData.animating)
			{
				const elapsed = now - ball.userData.animationStartTime;
				const t = Math.min(elapsed / duration, 1);
				const sx = ball.userData.startPosition.x;
				const sy = ball.userData.startPosition.y;
				const sz = ball.userData.startPosition.z;
				const tx = ball.userData.targetX;
				const ty = ball.userData.targetY;
				const tz = ball.userData.targetZ;
				ball.position.set(
					THREE.MathUtils.lerp(sx, tx, t),
					THREE.MathUtils.lerp(sy, ty, t),
					THREE.MathUtils.lerp(sz, tz, t)
				);
				if (t >= 1) {
					ball.userData.animating = false;
					ball.position.set(tx, ty, tz);
					ball.userData.float = {
						baseZ: tz,
						amplitude: 0.01 + Math.random() * 0.01,       // 0.3 to 0.6
						frequency: 2 + Math.random() * 1.5,         // 2 to 3.5 Hz
						offset: Math.random() * Math.PI * 2,        // full sine wave phase offset
						floatStartTime: now + Math.random() * 500   // slight delay for randomness
					};
				}	
			}
			else if (ball.userData.animating == false)
			{
				const { baseZ, amplitude, frequency, offset, floatStartTime } = ball.userData.float;
				const floatElapsed = (now - floatStartTime) / 1000;
				const delta = Math.sin(floatElapsed * frequency + offset) * amplitude;
				ball.position.z = baseZ + delta;
			}
		});

	}
	
  }

