import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createPath, createRoom } from './create';

import { RenderParams } from './types';

import pathsData from './data/paths.json';
import roomsData from './data/rooms.json';

const camX = -100;
const camY = 100;
const camZ = -100;

export function setupScene(): RenderParams {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer();
  
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const cameraControls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.AmbientLight( 0xffffff ); // soft white light
  scene.add( light );
  const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 1;
  scene.add( directionalLight );

  // cube
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, opacity: 0.75, transparent: true});

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

export function render(params: RenderParams) {
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