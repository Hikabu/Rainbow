import * as THREE from 'three';

const backgeometry = new THREE.BoxGeometry(1, 1, 1);
let indices = backgeometry.index.array;
let deleteTOP = true;
let new_indices = [];
for (let i = 0; i < indices.length; i++) {
  if ((i >= 24 && i <= 29) || (deleteTOP && i >= 12 && i <= 17) )
	continue;
  new_indices.push(indices[i]);
}
backgeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(new_indices), 1));
backgeometry.computeVertexNormals();
const side = THREE.DoubleSide;
let backmaterials = [];
backmaterials.push(new THREE.MeshStandardMaterial({ color: 0xFF0000, side: side,}))//RIGHT
backmaterials.push(new THREE.MeshStandardMaterial({ color: 0x00FF00, side: side,}))//LEFT
if (!deleteTOP)
	backmaterials.push(new THREE.MeshStandardMaterial({ color: 0x0000FF, side: side,}))//TOP
backmaterials.push(new THREE.MeshStandardMaterial({ color: 0x001b3a, side: side,}))//BOTTOM
backmaterials.push(new THREE.MeshStandardMaterial({ color: 0x001b3a , side: side,}));//BACK
const backBox = new THREE.Mesh(backgeometry, backmaterials);
backBox.scale.x = 20
backBox.scale.y = 10
backBox.scale.z = 5
backBox.position.z = 2
backBox.position.y = 4.5
backBox.receiveShadow = true;
backBox.castShadow = true;


export { backBox }
