import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

import pathsData from './data/paths.json';
import roomsData from './data/rooms.json';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const camX = -100;
const camY = 100;
const camZ = -100;

export type AnimateParams = {
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  cameraControls: OrbitControls,
  renderer: THREE.WebGLRenderer,
}

export type PathData = {
  type: string,
  points: number[][],
}

export type RoomData = {
  label: string,
  displayLabel: boolean,
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
  const width = Math.abs(corners[1][0] - corners[0][0]) + 1;
  const height = Math.abs(corners[1][1] - corners[0][1]) + 1;
  const length = Math.abs(corners[1][2] - corners[0][2]) + 1;

  const cubeGeometry = new THREE.BoxGeometry( width, height, length );
  const cube = new THREE.Mesh( cubeGeometry, material );
  cube.position.x = (corners[0][0] + corners[1][0]) / 2;
  cube.position.y = (corners[0][1] + corners[1][1]) / 2;
  cube.position.z = (corners[0][2] + corners[1][2]) / 2;
  return cube;
}

export function setupScene(): AnimateParams {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer();
  
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const cameraControls = new OrbitControls(camera, renderer.domElement);

  // cube
  const cubeMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );

  for (let room of roomsData) {
    const cube = createRoom(room, cubeMaterial);
    scene.add(cube);
  }

  // lines
  const lineMaterial = new LineMaterial( { color: 0x0000ff, linewidth: 1 } );
  lineMaterial.worldUnits = true;
  
  for (let path of pathsData) {
    const line = createPath(path, lineMaterial);
    scene.add(line);
  }

  camera.position.set(camX, camY, camZ);
  camera.lookAt(camX + 1, camY - 1, camZ + 1);
  cameraControls.update();

  return {
    scene,
    camera,
    cameraControls,
    renderer
  };
}

export function render(params: AnimateParams) {
	requestAnimationFrame(() => render(params));

  const {
    scene,
    camera,
    cameraControls,
    renderer,
  } = params;

  cameraControls.update();
	renderer.render( scene, camera );
}