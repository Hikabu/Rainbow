import * as THREE from 'three';
import { MeshBasicMaterial, MeshStandardMaterial } from 'three/webgpu';
import { get_friends } from './fakeFriendsList';
import {width, height, length, glass} from './friendMachine'
import { MainEngine } from '../../utils/MainEngine';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { shuffleArray, updateLabel} from './utils';
import { StateManager } from '../../../core/stateManager/StateManager';
const radius = 0.3;
const min_spheres = 5
const max_spheres = 5
const engine = new MainEngine();
let duration = 5000;
let scrollVelocity = 0;
let velocityDecay = 0.95; 
let lastKeyTime = Date.now();

export class SphereGroup {
	constructor(){
		if (SphereGroup.instance)
			return SphereGroup.instance
		this.self = null;
		this.f = 0.5;
		this.total_x = height - (2 * this.f)
		this.total_z = length - (2 * this.f)	
		this.queue = []
		this.instanceGroup = []
		this.count = 0;
		this.position = "0"
		this.animate_motion = null
		this.midSphere = null
		this.delay_motion = null
		this.motion = "0"
		SphereGroup.instance = this
	}
	add(obj){
		this.instanceGroup.push(obj)
		this.count += 1;
		if (this.self)
		{
			this.self.add(obj.self)
			return this.count;
		}
		else
		{
			this.queue.push(obj.self)
			return this.count;
		}
	}
	async init(){
		this.self = new THREE.Group();
		this.self.position.set(0, 0, 0);
		this.queue.forEach(obj=>this.self.add(obj))
		this.friends_list = await get_friends()
		if (this.friends_list == null)
			this.friends_list = []
		this.total_spheres = this.friends_list.length < min_spheres ? min_spheres : this.friends_list.length > max_spheres ? max_spheres : this.friends_list.length;
		if (this.total_spheres % 2 == 0)
			this.total_spheres -=1
		// this.mode = this.friends_list.length < min_spheres ? -1 : this.friends_list.length > max_spheres ? 1 : 0;
		for (let i = 0; i < this.total_spheres; i++)
		{
			let sp = new Sphere();
			await sp.add_friend(i);
		}
		glass.self.add(this.self)
	}
	random_position(travel = false){
		if (this.position == "random")
			return
		this.position = "random"
		this.gridSize = Math.ceil(Math.sqrt(this.total_spheres));
		this.cellIndices = [];
		for (let x = 0; x < this.gridSize; x++) {
			for (let y = 0; y < this.gridSize; y++) {
				this.cellIndices.push({x, y});
			}
		}
		shuffleArray(this.cellIndices);
		this.instanceGroup.forEach(sp=>sp.random_position(travel, this.cellIndices, this.gridSize, this.f, this.total_x, this.total_z))
		if (travel)
		{
			this.change_motion("travel")
		}
	}
	scroll_position(dir = 0)
	{
		const now = Date.now();
		if (this.position == "scroll") 
		{
			lastKeyTime = now;
			return
		}
		this.position = "scroll";
		if (dir != 0)
		{
			const timeDiff = now - lastKeyTime;
			lastKeyTime = now;
			scrollVelocity *= velocityDecay;
			scrollVelocity = Math.min(scrollVelocity + 0.1, 1);
			const speedFactor = 1 + scrollVelocity * 11; //AMP UP!
			duration = 3000 / speedFactor;
		}
		else
		{
			this.startRotationZ = this.self.rotation.z
			this.animationStartTime = now
		}
		// else{
		// 	this.instanceGroup.forEach(sp=>sp.label.rotation.z = 0)
		// }
		this.instanceGroup.forEach(sp=>sp.scroll_position(this.total_spheres, dir))
		this.change_motion("travel")
	}
	resize(){
		for (let i = 0; i < this.total_spheres; i++){
			updateLabel(this.instanceGroup[i].label, this.instanceGroup[i].self)
		}
	}
	animate(){
		//this.instanceGroup.forEach(sphere=>sphere.label.lookAt(engine.camera))
		let now = Date.now()
		this.resize()
		this.animate_motion(now)
		engine.css3DRenderer.render(engine.cssScene, engine.camera);
		this.instanceGroup.forEach(sp=>sp.animate(now))
	}
	change_motion(motion){
		const actions = {
			"spin" : this.spin,
			"travel" : this.travel,
			"float" : this.float,
		}
		if (this.motion == "travel")
		{
			this.delay_motion = motion;
		}
		else
		{
			this.animate_motion = actions[motion]
			this.motion = motion
		}
	}
	spin(t){
		this.self.rotation.z += 0.002
		this.float(t)
	}
	travel(t){
		let finished = 0;
		if (this.startRotationZ)
		{
			let f = (t - this.animationStartTime) / duration;
			this.self.rotation.z = this.startRotationZ * (1 - f);
			if (f >= 1)
			{
				this.startRotationZ = null;
			}
		}
		for (let i = 0; i < this.instanceGroup.length; i++){
			finished += this.instanceGroup[i].travel(t)
		}
		if (finished == this.total_spheres)
		{
			this.duration = 3000
			if (this.position == "scroll")
				this.position = "arrived"
			this.motion = "0"
			this.instanceGroup.forEach(sp=>sp.allow_float())
			if (this.delay_motion)
			{
				this.change_motion(this.delay_motion)
				this.delay_motion = null
			}
			else
			{
				this.change_motion("float");
			}
		}
	}
	float(t){
		this.instanceGroup.forEach(sphere=>sphere.float(t))
	}
	
}

export class Sphere {
	constructor(){
		// this.geometry = new THREE.SphereGeometry(radius, 32, 32)
		// this.material = new MeshStandardMaterial({color: 0xff00ff, side: THREE.FrontSide})
		// this.self = new THREE.Mesh(this.geometry, this.material)
		this.self = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), new MeshStandardMaterial({color: 0xff00ff, side: THREE.FrontSide}))
		this.self.userData.instance = this;
		this.self.position.set(0, 0, 0);
		this.i = new SphereGroup().add(this);
		this.og_i = this.i
		this.secondTarget = null;
		this.animationStartTime = null;
		this.inSecondLeg = false;
		this.div = document.createElement('div');
		this.div.className = 'label';
		this.div.style.width = '40px';
		this.div.style.height = '40px';
		this.div.style.borderRadius = '50%';
		this.div.style.overflow = 'hidden';
		this.div.style.visibility = 'hidden';
		this.overlay = document.createElement('div');
		this.label = new CSS3DObject(this.div);
		this.label.position.set(0, 0, 0)
		this.label.rotation.x = -Math.PI/2;
		this.label.scale.set(0.015, 0.015, 0.015);
		engine.cssScene.add(this.label)
		this.animate = ()=>{}
	}
	random_position(travel = false, cellIndices, gridSize, f, total_x, total_z){
		const {x, y} = cellIndices[this.i];
		let min_x = ((- height / 2) + f) + (total_x * (x/ gridSize))
		let min_z = ((- length / 2) + f) + (total_z * (y/ gridSize))
		let max_x = min_x + (total_x / gridSize);
		let max_z = min_z + (total_z / gridSize);
		const pos = new THREE.Vector3(
			min_x + ((max_x - min_x) * 0.5),
			THREE.MathUtils.randFloat((- width / 2 ) +f , (width / 2) - f),
			min_z + ((max_z - min_z) * 0.5),
		);
		if (!travel)
		{
			this.self.position.copy(pos);
			this.allow_float()
		}
		else
		{
			this.targetX = pos.x
			this.targetY = pos.y
			this.targetZ = pos.z
			this.animationStartTime = Date.now()
			this.startPosition.x = this.self.position.x
			this.startPosition.y = this.self.position.y
			this.startPosition.z = this.self.position.z
			//this.startRotationZ = new SphereGroup().self.rotation.z
		}
	}
	scroll_position(total, dir){
		this.position = "scroll"
		this.i += dir;
		if (dir == 0)
		{
			this.i = this.og_i
		}
		if (this.i < 1 )
		{
			this.i = total;
			this.secondTarget = true;
		}
		else if (this.i > total)
		{
			this.i = 1;
			this.secondTarget = true;
		}
		
		let f = 0.5;
		const minX = -width / 2 + f;
		const maxX = minX + width - f - f;
		const minY = -height / 2 + f / 2;
		const maxY =  minY + height - f;
		const minZ = -length / 2 + f ;
		const maxZ = minZ + length - f -f;
		
		const factor = (1 / 12) + ((total - 5) / (15 - 5)) * (1 - 1 / 10);
		const t = (this.i - 1) / (total - 1); // normalize index from 0 to 1
	
		this.targetZ = maxZ - t * (maxZ - minZ);// adjust minZ/maxZ as needed
		const curveY = Math.sin(t * Math.PI); // same arch
		this.targetY = minY + curveY * (maxY - minY);
		if (this.i == Math.ceil(total / 2)) 
		{
			new SphereGroup().midSphere = this;
			this.targetY = maxY + radius;
		}
		const curveX = 1 - Math.sin(t * Math.PI);  // 1 → 0 → 1
		this.targetX = minX + curveX * ((maxX - minX ) * factor); 
		// this.targetX = 0 - width / 4;
		// this.targetY = 0;
		this.startPosition = this.self.position.clone();
		//this.startRotationZ = new SphereGroup().self.rotation.z
		this.animationStartTime = Date.now();
		if (this.secondTarget)
		{
			this.secondTarget = new THREE.Vector3(this.targetX, this.targetY, this.targetZ)
			this.targetX = 0;
			this.targetY = 0;
			this.hideAvatar(0.45)
			if (this.i == 1)
			{
				this.targetZ = - length / 2 - radius;
				this.secondStart = new THREE.Vector3(this.targetX, this.targetY, length / 2 + radius )
			}
			else
			{
				this.targetZ = length / 2 + radius;
				this.secondStart = new THREE.Vector3(this.targetX, this.targetY,  - length / 2 - radius )
			}
		}
	}
	allow_float(){
		this.baseZ = this.self.position.z;
		this.amplitude = 0.015 + Math.random() * 0.01;
		this.frequency = 2 + Math.random() * 1.5,
		this.offset = Math.random() * Math.PI * 2;
		this.floatStartTime = Date.now() + Math.random() * 500
	}
	travel(now){
		let len = this.secondTarget ? duration / 2 : duration;
		const elapsed = now - this.animationStartTime;
		const t = Math.min(elapsed / len, 1);
		if (t >= 1)
		{
			if (this.secondTarget && !this.inSecondLeg)
			{
				this.showAvatar(0.45)
				this.inSecondLeg = true;
				this.startPosition = new THREE.Vector3(this.secondStart.x, this.secondStart.y, this.secondStart.z)
				this.self.position.set(this.startPosition.x, this.startPosition.y, this.startPosition.z)
				this.targetX = this.secondTarget.x;
				this.targetY = this.secondTarget.y;
				this.targetZ = this.secondTarget.z;
				this.animationStartTime = now;
				return 0;
			}
			else
			{
				this.self.position.set(this.targetX, this.targetY, this.targetZ)
				this.secondTarget = null;
				this.secondStart = null;
				this.inSecondLeg = false;
				return 1
			}
		}
		const sx = this.startPosition.x;
		const sy = this.startPosition.y;
		const sz = this.startPosition.z;
		const tx = this.targetX;
		const ty = this.targetY;
		const tz = this.targetZ;
		const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
		const easedT = easeOutCubic(t);
		this.self.position.set(
			THREE.MathUtils.lerp(sx, tx, easedT),
			THREE.MathUtils.lerp(sy, ty, easedT),
			THREE.MathUtils.lerp(sz, tz, easedT)
		);
		return 0
	}
	float(t){
		if (t < this.floatStartTime) return;
		if (!this.hasStartedFloat) {
			this.baseZ = this.self.position.z;
			this.hasStartedFloat = true;
		}
		const floatElapsed = (t - this.floatStartTime) / 1000;
		const delta = Math.sin(floatElapsed * this.frequency + this.offset) * this.amplitude;
		const rampUp = Math.min(floatElapsed / 1.0, 1); 
		this.self.position.z = this.baseZ + delta * rampUp;
	}
	async add_friend(index)
	{
		this.friend = await get_friends(index);
		if (this.friend == null)
			return;
		const img = document.createElement('img');
		img.src = this.friend.avatar;
		img.style.width = '100%';
		img.style.height = '100%';
		img.style.objectFit = 'cover';
		this.div.appendChild(img);
	}
	hideAvatar(len = null) {
		if (this.friend && this.div.style.visibility == "visible")
		{
			let length = len ? len : duration
			this.animationStartTime = Date.now()
			this.animate = (now)=>{
				let t = (now - this.animationStartTime) / length;
				this.div.style.opacity = 1 - t;
				if (t >= 1)
				{
					this.div.style.visibility = "hidden"
					this.animate = ()=>{}
				}
			}
		}
		this.div.style.visibility = 'hidden';
	}
	showAvatar(len = null) {
		if (this.friend && this.div.style.visibility == "hidden")
			{
			this.div.style.opacity = 0;
			this.div.style.visibility = "visible"
			let length = len ? duration * len : duration
			this.animationStartTime = Date.now()
			this.animate = (now)=>{
				let t = (now - this.animationStartTime) / length;
				this.div.style.opacity = t;
				if (t >= 1)
				{
					this.div.style.opacity = 1
					this.animate = ()=>{}
				}
			}
		}
	}
	selected()
	{
		this.div.style.boxShadow = '0 0 10px 5px rgba(255, 255, 255, 0.8)';
		this.div.style.boxShadow = '0 0 10px 5px rgb(84, 253, 188)';
	}
	deselected(){
		this.div.style.boxShadow = '';
	}
	// friend_offline(){
	// 	this.div.style.boxShadow = '';
	// }
	// friend_online(){
	// 	this.div.style.boxShadow = '0 0 10px 5px rgba(255, 255, 255, 0.8)';
	// }

}
