import * as THREE from 'three';
import { MainEngine } from '../../utils/MainEngine';
const engine = new MainEngine();
function createRenderTarget(){
	const renderTarget = new THREE.WebGLRenderTarget(2048, 2048, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		type: THREE.UnsignedByteType,
		samples: 8,
	  });
	
	renderTarget.texture.anisotropy = engine.renderer.capabilities.getMaxAnisotropy();
	renderTarget.texture.generateMipmaps = true;
	renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
	renderTarget.depthTexture = new THREE.DepthTexture();
	renderTarget.depthTexture.format = THREE.DepthFormat;
	renderTarget.depthTexture.type = THREE.UnsignedShortType;
	
	renderTarget.texture.minFilter = THREE.LinearFilter;
	renderTarget.texture.magFilter = THREE.LinearFilter;
	const texture = renderTarget.texture;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	const renderMaterial = new THREE.MeshStandardMaterial({
		map: texture,
		emissive: new THREE.Color(1, 1, 1),
		emissiveMap: texture,
		emissiveIntensity: 10,
		roughness: 0.5,
		metalness: 0.5,
	});
	return renderTarget;
}

function createScreenMaterial(renderTarget){
	const renderMaterial = new THREE.MeshStandardMaterial({
		map: renderTarget.texture,
		emissive: new THREE.Color(1, 1, 1),
		emissiveMap: renderTarget.texture,
		emissiveIntensity: 10,
		roughness: 0.5,
		metalness: 0.5,
	});
	return renderMaterial;
}



export {createRenderTarget, createScreenMaterial}