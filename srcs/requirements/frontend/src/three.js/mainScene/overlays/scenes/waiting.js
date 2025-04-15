import * as THREE from 'three';
// import {MainEngine} from '../../utils/MainEngine';
import { StateManager } from '../../../core/stateManager/StateManager';
import {createRenderTarget, createScreenMaterial } from './utils';
import { Font } from '../../../core/objectFactory/customFont3d';
import { Engine } from './pong-game/setUp/Engine';


const engine = new Engine()

function update_eng_bound(){
	engine.boundaryX *= .85;

}
update_eng_bound();
let content_body1 = new Font(false, engine);
let content_body2 = new Font(false, engine);
content_body1.new("Waiting for", "thick", 0, 0.3, 0, 15, 1.5, engine)
content_body2.new("next match", "thick", 0, -0.3, 0, 15, 1.5, engine)
content_body1.show()
content_body2.show()
const geometry = new THREE.BoxGeometry(1);
const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
const ball = new THREE.Mesh(geometry, material);
ball.receiveShadow = true;
ball.castShadow = true;
engine.scene.add(ball);
let dir = 1;
ball.position.z = 0;
function animate() {
	ball.rotation.x += 0.01;
	ball.rotation.y += 0.01;
	ball.rotation.z += 0.01;
	ball.position.z += 0.01 * dir;
	if (ball.position.z >= 0.25 || ball.position.z <= -0.25)
		dir *= -1;
  }

  //TO BE CHANGED DEPENDS ON SCREEN NOT WINDOW ...THINK
  function	resize(e) {
	engine.camera.aspect = window.innerWidth / window.innerHeight;
	engine.camera.updateProjectionMatrix();
	engine.setRendererSize(window);
	update_eng_bound();
	content_body1.initPositions(engine);
	content_body2.initPositions(engine);
}

const renderTarget = createRenderTarget();
const renderMaterial = createScreenMaterial(renderTarget);

const waiting = {
	"animate" : animate,
	"renderMaterial" : renderMaterial,
	"renderTarget" : renderTarget,
	"scene" : engine.scene,
	"camera" : engine.camera,
	"resize":resize,
}

export { waiting }