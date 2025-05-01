import * as THREE from 'three';

import { MainEngine } from '../../utils/MainEngine';
const engine = new MainEngine();

function createRenderTarget() {
    const renderTarget = new THREE.WebGLRenderTarget(2048, 2048, {
        minFilter: THREE.LinearFilter, // Change minFilter to NearestFilter
        magFilter: THREE.LinearFilter, // Change magFilter to NearestFilter
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        samples: 8,
    });

   // renderTarget.texture.encoding = THREE.sRGBEncoding;
    renderTarget.texture.anisotropy = engine.renderer.capabilities.getMaxAnisotropy();
    renderTarget.texture.generateMipmaps = false; // Disable mipmaps
    renderTarget.depthTexture = new THREE.DepthTexture(2048, 2048);
    renderTarget.depthTexture.type = THREE.UnsignedShortType;
    renderTarget.depthTexture.format = THREE.DepthFormat;


    const texture = renderTarget.texture;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return renderTarget;
}

function createScreenMaterial(renderTarget) {
    const renderMaterial = new THREE.MeshBasicMaterial({
        map: renderTarget.texture,
    });
    return renderMaterial;
}


export {createRenderTarget, createScreenMaterial}