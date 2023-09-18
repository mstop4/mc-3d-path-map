import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

export type AnimateParams = {
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
}

export function setupScene(): AnimateParams {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // cube
  const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
  const cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
  scene.add( cube );

  // lines
  const lineMaterial = new LineMaterial( { color: 0x0000ff, linewidth: 0.5 } );
  lineMaterial.worldUnits = true;
  const points = [];
  points.push(-2, 0, 0);
  points.push(0, 2, 0);
  points.push(2, 0, 0);

  const lineGeometry = new LineGeometry().setPositions( points );
  const line = new Line2( lineGeometry, lineMaterial );
  line.computeLineDistances();
	line.scale.set( 1, 1, 1 );
  scene.add(line);

  camera.position.z = 5
;

  return {
    scene,
    camera,
    renderer
  };
}

export function render(params: AnimateParams) {
	requestAnimationFrame(() => render(params));

  const {
    scene,
    camera,
    renderer,
  } = params;

	renderer.render( scene, camera );
}