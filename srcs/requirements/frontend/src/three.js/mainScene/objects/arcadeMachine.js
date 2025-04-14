import * as THREE from 'three';
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

const arcadeMachine = new THREE.Group();

function get_shape(total_height, total_width)
{
	const h_ratios = [0, 0.5, 0.6, 0.65, 0.85, 0.9, 0.98, 1];
	const w_ratios = [0, 0.7, 0.75, 0.8, 0.85, 0.88, 1];
	const h = h_ratios.map(ratio => ratio * total_height);
	const w = w_ratios.map(ratio => ratio * total_width);
	const squareShape = new THREE.Shape();
	squareShape.moveTo(w[0], h[0]);
	squareShape.lineTo(w[0], h[6]);
	squareShape.lineTo(w[3], h[7]);
	squareShape.lineTo(w[3], h[5]);
	squareShape.lineTo(w[1], h[4]);
	squareShape.lineTo(w[2], h[3]);
	squareShape.lineTo(w[5], h[2]);
	squareShape.lineTo(w[5], h[1]);
	squareShape.lineTo(w[4], h[1]);
	squareShape.lineTo(w[4], h[0]);
	return squareShape;
}
const scale = 0.2;
const height = 6 * scale;
const width = 3 * scale;

const materials = [
	new THREE.MeshStandardMaterial({ color: 0x0000ff ,}),
	new THREE.MeshStandardMaterial({ color: 0x0000ff ,}),
	new THREE.MeshStandardMaterial({ color: 0xff00ff ,}),

];
const baseShape = get_shape(height, width);
const baseGeometry = new THREE.ExtrudeGeometry(baseShape, { depth: width, bevelEnabled: false });
baseGeometry.rotateY(-Math.PI / 2);

const base = new THREE.Mesh(baseGeometry, materials);
arcadeMachine.add(base);

const edgesGeometry = new THREE.EdgesGeometry(baseGeometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 1 });
// const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
// arcadeMachine.add(edges);


////
const edgesPositions = edgesGeometry.attributes.position.array;
// edgesPositions.rotation.y = -Math.PI / 2;
const filteredEdges = [];
let shape = new THREE.Shape();
let shapeGroup = [];
for (let i = 0; i < edgesPositions.length; i += 3) {
    const startVertex = new THREE.Vector3(edgesPositions[i], edgesPositions[i + 1], edgesPositions[i + 2]);
    const endVertex = new THREE.Vector3(edgesPositions[i + 3], edgesPositions[i + 4], edgesPositions[i + 5]);
	if (i == 0)
		shape.moveTo(startVertex.z, startVertex.y);
	else if (endVertex.z == 0 && startVertex.z == 0)
	{
		shapeGroup.push(shape);
		shape = new THREE.Shape();
		shape.moveTo(startVertex.z, startVertex.y);
	}
	// else
	// 	shape.lineTo(startVertex.x, startVertex.y);
	else if (i + 3  > edgesPositions.length || (edgesPositions[i + 3 + 2] == 0  && edgesPositions[i + 5] == 0));
		shape.lineTo(endVertex.z, endVertex.y);
	if ( i != 6 * 15 && i != 6 * 12 && i % 6 == 0) {
        filteredEdges.push(startVertex.x, startVertex.y, startVertex.z, endVertex.x, endVertex.y, endVertex.z);
    }
}

let materialtest = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const shapetest = new THREE.Mesh(new THREE.ShapeGeometry(shapeGroup[0]), materialtest);
// arcadeMachine.add(shapetest);
const filteredEdgesGeometry = new THREE.BufferGeometry();
filteredEdgesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(filteredEdges, 3));
const filteredEdgesLine = new THREE.LineSegments(filteredEdgesGeometry, edgesMaterial);
// arcadeMachine.add(filteredEdgesLine);



const shape1 = new THREE.Shape();

shape1.moveTo( );
shape1.lineTo( );
shape1.lineTo( );
shape1.lineTo( );


const Lgeometry = new THREE.ShapeGeometry( shape1 );
const Lmaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const Lmesh = new THREE.Mesh( Lgeometry, Lmaterial ) ;
arcadeMachine.add( Lmesh );

// arcadeMachine.rotation.y = -Math.PI / 2;
arcadeMachine.add(filteredEdgesLine);


arcadeMachine.receiveShadow = true;
arcadeMachine.castShadow = true;
arcadeMachine.position.y = -0.45;
arcadeMachine.position.z = 2;

arcadeMachine.scale.set(2, 2, 2);
export { arcadeMachine }