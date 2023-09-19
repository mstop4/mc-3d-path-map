import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createPath, createRoom } from './create';

import pathsData from './data/paths.json';
import roomsData from './data/rooms.json';

const camX = -100;
const camY = 100;
const camZ = -100;

let scene: THREE.Scene;
let camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
let cameraControls: OrbitControls;
let renderer: THREE.WebGLRenderer;
const materials: Record<string, THREE.Material|LineMaterial> = {};

function initMaterials() {
   materials.room = new THREE.MeshStandardMaterial({ color: 0xffffff, opacity: 0.75, transparent: true});
   materials.ogTunnel = new LineMaterial({ color: 0x8090FF, linewidth: 0.0025 });  // Overground Tunnel
   materials.ugTunnel = new LineMaterial({ color: 0x80B0D0, linewidth: 0.0025 });  // Underground Tunnel
   materials.cBridge = new LineMaterial({ color: 0x80FF80, linewidth: 0.0025 });   // Covered Bridge
   materials.oBridge = new LineMaterial({ color: 0xFFD040, linewidth: 0.0025 });   // Open Bridge
   materials.exPath = new LineMaterial({ color: 0xC00000, linewidth: 0.0025 });    // External Path
   materials.nCave = new LineMaterial({ color: 0xC06000, linewidth: 0.0025 });     // Natural Cave
}

export function setupScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
  // camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10000);
  renderer = new THREE.WebGLRenderer();
  
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  cameraControls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.AmbientLight( 0xffffff ); // soft white light
  scene.add( light );
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 1;
  scene.add( directionalLight );

  initMaterials();

  for (let room of roomsData) {
    const cube = createRoom(room);
    scene.add(cube);
  }

  // lines

  
  for (let path of pathsData) {
    const line = createPath(path);
    if (line) {
      scene.add(line);
    }
  }

  camera.position.set(camX, camY, camZ);
  camera.lookAt(camX + 1, camY - 1, camZ + 1);
  cameraControls.update();
}

export function getMaterials(): Record<string, THREE.Material> {
  return materials;
}

export function render() {
	requestAnimationFrame(render);

  cameraControls.update();
	renderer.render( scene, camera );
}