import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

import pathsData from './data/paths.json';
import roomsData from './data/rooms.json';

const camX = 30;
const camY = 100;
const camZ = 30;

export type AnimateParams = {
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
}

export type PathData = {
  type: string,
  points: number[][],
}

export type RoomData = {
  type: string,
  corners: number[][],
}

export function createPath(pathData: PathData, material: LineMaterial) {
  const { points: rawPoints } = pathData;
  const points = rawPoints.flat(1);

  const lineGeometry = new LineGeometry().setPositions( points );
  const line = new Line2( lineGeometry, material );
  line.computeLineDistances();
	line.scale.set( 1, 1, 1 );
  return line;
}

export function createRoom(roomData: RoomData, material: THREE.MeshBasicMaterial) {
  const { corners } = roomData;
  const width = Math.abs(corners[1][0] - corners[0][0]);
  const length = Math.abs(corners[1][1] - corners[0][1]);
  const height = Math.abs(corners[1][2] - corners[0][2]);

  const cubeGeometry = new THREE.BoxGeometry( width, length, height );
  const cube = new THREE.Mesh( cubeGeometry, material );
  cube.position.x = corners[0][0] + width / 2;
  cube.position.y = corners[0][1] + length / 2;
  cube.position.z = corners[0][2] + height / 2;
  return cube;
}

export function setupScene(): AnimateParams {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // cube
  const cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  const cube = createRoom(roomsData[0], cubeMaterial);
  scene.add( cube );

  // lines
  const lineMaterial = new LineMaterial( { color: 0x0000ff, linewidth: 0.25 } );
  lineMaterial.worldUnits = true;
  
  for (let path of pathsData) {
    const line = createPath(path, lineMaterial);
    scene.add(line);
  }

  camera.position.set(camX, camY, camZ);
  camera.lookAt(camX - 1, camY - 1, camZ - 1);

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