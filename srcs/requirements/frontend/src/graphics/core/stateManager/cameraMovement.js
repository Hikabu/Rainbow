
import { arcadeMachine } from "../../mainScene/objects/arcadeMachine";
import { MainEngine } from "../../mainScene/utils/MainEngine";
import { StateManager } from "./StateManager";
import * as THREE from 'three';



const engine = new MainEngine();

let scrollDelta = 0;
const scrollThreshold = 400;
let isAnimating = false;

window.addEventListener("wheel", (event) => {
	const stateManager = new StateManager();
	if (isAnimating || event.deltaY * 100 * stateManager.allowedDirection < 0)
		return ;
	scrollDelta += event.deltaY;
	engine.camera.position.z += event.deltaY * 0.00001;
	if (Math.abs(scrollDelta) > scrollThreshold) {
		isAnimating = true;
		let direction = scrollDelta > 0 ? 1 : -1;
		scrollDelta = 0;
		stateManager.changeState(new StateManager().currentStateIndex + direction);
	}
});


function moveCamera(data, onComplete) {
	gsap.killTweensOf(engine.camera);
	gsap.killTweensOf(engine.camera.position);
	gsap.killTweensOf(engine.camera.rotation);
	isAnimating = true;
	const tl = gsap.timeline({ 
		defaults: { duration: data.duration || 2, ease: data.ease || "power2.out" } 
	});
	if (data.pos) {
		tl.to(engine.camera.position, { 
			x: data.pos[0], 
			y: data.pos[1], 
			z: data.pos[2],
			onUpdate: () =>{ new StateManager().resize()
				// engine.camera.position.x += (Math.random() - 0.5) * 0.2;
				// engine.camera.position.y += (Math.random() - 0.5) * 0.2;
				// engine.camera.position.z += (Math.random() - 0.5) * 0.2;
			},

			overwrite: "auto",
		}, 0);
	}
	if (data.rot) {
		tl.to(engine.camera.rotation, { 
			x: data.rot[0], 
			y: data.rot[1], 
			z: data.rot[2] 
		}, 0);
	}
	if (data.fov !== undefined) {
		tl.to(engine.camera, { 
			fov: data.fov,
			onUpdate: () => engine.camera.updateProjectionMatrix() 
		}, 0);
	}
	if (data.lookAt) {
		tl.to({}, { 
			onUpdate: () => engine.camera.lookAt(data.lookAt)
		}, 0);
	}
	tl.eventCallback("onComplete", () => {
		isAnimating = false;
		new StateManager().resize();
		onComplete();
		engine.camera.position.x = data.pos[0];
		engine.camera.position.y = data.pos[1];
		engine.camera.position.z = data.pos[2];
	});
}
function shakeCamera(camera, intensity = 0, duration = 2000) {
    let startTime = performance.now();
    let prev_position = camera.position;
    function update() {
        let elapsed = performance.now() - startTime;
        if (elapsed < duration) {
			intensity += 0.005
            camera.position.x += (Math.random() - 0.5) * intensity;
            camera.position.y += (Math.random() - 0.5) * intensity;
            camera.position.z += (Math.random() - 0.5) * intensity;
            requestAnimationFrame(update);

        } else {
            camera.position.set(prev_position.x, prev_position.y, prev_position.z); // Reset to default position
        }
    }
    
    update();
}

function shakeCameraWithRotation(camera, intensity = 0.1, duration = 5000, rotationAmount = 0.1) {
    let startTime = performance.now();
    let prevPosition = camera.position.clone();
    let prevRotation = camera.rotation.clone();
    function update() {
        let elapsed = performance.now() - startTime;
        if (elapsed < duration) {
            let t = elapsed * 0.005;
            camera.position.x += (Math.random() - 0.5) * intensity;
            camera.position.y += (Math.random() - 0.5) * intensity;
            camera.position.z += (Math.random() - 0.5) * intensity;
            camera.rotation.z += Math.sin(t * 4) * rotationAmount * (Math.random() - 0.5) ;
            requestAnimationFrame(update);
        } else {
            camera.position.copy(prevPosition);
            camera.rotation.copy(prevRotation);
        }
    }
    update();
}

function fitCameraToObject(object, camera) {
	const box = new THREE.Box3();  // Initialize an empty bounding box
    object.children.forEach(child => {
        child.updateMatrixWorld(true); // Ensure world matrices are updated
        box.expandByObject(child);    // Expand the box to include the child’s bounding box
    });

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const aspect = window.innerWidth / window.innerHeight;
    
    let fov = THREE.MathUtils.degToRad(camera.fov); 
    let distance;

    if (aspect >= 1) {
        distance = (size.x / 2) / Math.tan(fov / 2);
    } else {
        distance = (size.y / 2) / Math.tan(fov / 2);
    }
    camera.position.set(0, 0, distance + maxDim);
    camera.lookAt(box.getCenter(new THREE.Vector3()));
}


export {moveCamera}