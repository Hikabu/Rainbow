import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { InstanceNode } from 'three/webgpu';
import { fitCameraToObject, onResizeCamMove } from '../../core/stateManager/cameraMovement';
class MainEngine {
	constructor(){
		if (MainEngine.instance)
			return MainEngine.instance;
		this.sceneInitialized = false;
		this.setUpContainer();
		this.setUpScene();
		this.setUpRenderer();
		this.setUpLights();
		this.blockRaycast = false;
		this.stateManager = null;
		this.isCamMoving = false;
		this.camera_target = new THREE.Vector3();
		MainEngine.instance = this;
	}
	addContainerWrapper(wrapper){
		wrapper.appendChild(this.container);
		this.resizeObserver = new ResizeObserver(() => this.resize());
		this.resizeObserver.observe(this.container);
		this.resize();
		// console.log("add container wrapper")
	}
	removeContainerWrapper(){
		this.container?.remove();
		this.resizeObserver?.disconnect();
	}
	setUpContainer(){
		this.container = document.createElement('div');
		this.container.style.position = 'relative'; // important for proper internal positioning
		this.container.style.width = '100%';
		this.container.style.height = '100%';
		this.container.style.overflow = 'hidden';
	}
	setUpScene(){
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
		this.camera.position.z = 10;
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.clickableObjects = [];
	}
	setUpRenderer(){
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.container.appendChild(this.renderer.domElement);

		this.css3DRenderer = new CSS3DRenderer();
		this.css3DRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
		this.css3DRenderer.domElement.style.position = "absolute";
		this.css3DRenderer.domElement.style.top = 0;
		this.container.appendChild(this.css3DRenderer.domElement);
		// console.log("engine initiliazed")
	}
	setUpLights(){
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
		this.scene.add(ambientLight);

		const topLight = new THREE.SpotLight(0x0053f9, 50);
		topLight.position.set(0, 6, 2);
		topLight.castShadow = true;
		this.scene.add(topLight);

		const spotLight = new THREE.SpotLight(0xd34dee, 50);
		spotLight.position.set(0, 2, 5);
		// spotLight.position.set(0, 0, 3.5);
		spotLight.castShadow = true;
		this.scene.add(spotLight);
	}
	animate(){
		this.renderer.render(this.scene, this.camera);
		this.stateManager.animate();
	}
	add(newObject, clickable){
		if (newObject instanceof THREE.Group) {
			// console.log("adding group: ", newObject)
			this.scene.add(newObject)
			if (clickable) {
				newObject.children.forEach(child => {
					// console.log("child: ", child)
					if (child instanceof THREE.Object3D)
						this.clickableObjects.push(child);
					else
						this.clickableObjects.push(child.self);
				});
			}
			return;
		}
		if (! (newObject instanceof THREE.Object3D))
			newObject = newObject.self;
		this.scene.add(newObject);
		if (clickable)
			this.clickableObjects.push(newObject);
	}
	resize(){	
		this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
		this.css3DRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
	
		this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
		this.camera.updateProjectionMatrix();
		//console.log("RESIZE")
		if (this.stateManager)
		{
			let state = this.stateManager.currentState;
			// this.camera.position.set(fitCameraToObject(state.targetObject, state.targetNormal, state.targetPadding))
			// let camera_pos =  
			if (state)
			{
				if (this.isCamMoving)
					onResizeCamMove(fitCameraToObject(state.targetObject, state.targetNormal, state.targetPadding))
				else
					this.camera.position.copy(fitCameraToObject(state.targetObject, state.targetNormal, state.targetPadding))
				this.stateManager.resize();
			}
			// else console.log("NO STATE")
				// console.log("pos ", camera_pos);)
		}
		// else 
		// 	console.log("NO STATE MANAGER")

	}
	blockRaycast_to_true(){
		this.blockRaycast = true;
	}
	click(event){
		if (this.blockRaycast == true)
		{
			this.blockRaycast = false;
			return
		}
		this.mousemove(event);
		this.raycaster.setFromCamera(this.mouse, this.camera);	
		for (let i = 0; i < this.clickableObjects.length; i++)
		{
			if (! this.clickableObjects[i].userData.instance)
				continue ;
			const bbox = this.clickableObjects[i].userData.instance.get_bbox();
			const intersectsModel = this.raycaster.ray.intersectBox(bbox, new THREE.Vector3());
			if (intersectsModel)
			{
				this.clickableObjects[i].userData.instance.handle_click(this.raycaster);
				return ;
			}
		}
	}
	mousemove(event){
		const bounds = this.container.getBoundingClientRect();
		this.mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
		this.mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
	}
	// mousemove(event){
	// 	this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	// 	this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	// }
}


export { MainEngine }