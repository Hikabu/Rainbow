import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { Part } from './Part';

class Object {
	constructor(part){
		this.basePart = part;
		this.self = new THREE.Group();
		this.self.add(this.basePart.self);
		//this.mesh = new THREE.Group();
		//this.mesh.add(this.basePart.mesh)
		this.self.userData.instance = this;
		this.onclick = null;
		this.self.raycasting = true;
		this.self.receiveShadow = true;
		this.self.castShadow = true;
	}
	add_object(Xpercent, Ypercent, index, inputObj, axisUp = [0, 1, 0], axisForward = 1, obj_height = true, height_depth = 1){
		// console.log("in object ... add new object");
		let object;
		if (inputObj instanceof THREE.Object3D)
		{
			object = inputObj;
		}
		else if(!(inputObj instanceof CSS3DObject))
		{
			object = inputObj.self;
		}	
		obj_height = (inputObj instanceof CSS3DObject) ? false : true;
		// console.log("index-> ", index);
		let children_i = index.shift();
		// console.log("children_i", children_i, "next_i", index);
		this.self.children[children_i].userData.instance.add_object(Xpercent, Ypercent, index, object, axisUp, axisForward, obj_height, height_depth)
		if (!(inputObj instanceof CSS3DObject))
			this.self.add(object)
		// if (!(part instanceof CSS3DObject))
		// 	this.self.add(object)
	}
	add_onclick(ft) {
		this.onclick = ft
	}
	handle_click(raycaster) {
		if (this.onclick) {
			// console.log("clicked handled");
			this.onclick();
			return true;
		}
	
		// console.log("handle click");
		// console.log("self : ", this.self)
		const intersectsShape = raycaster.intersectObject(this.self);
		// console.log(intersectsShape);
	
		for (let i = 0; i < intersectsShape.length; i++) {
			// console.log("Intersected object:", intersectsShape[i].object);

			const instance = intersectsShape[i].object.userData.instance;
			// console.log("instance: ", instance)
			if (instance && typeof instance.handle_click === "function") {
				const result = instance.handle_click(raycaster);
				if (result === true) {
					// console.log("inner obj intersect");
					return true;
				}
			}
		}
		return false;
	}
	get_bbox(){
		this.self.updateMatrixWorld();
		const bbox = new THREE.Box3().setFromObject(this.self);
		return bbox;
	}
}

export { Object };
