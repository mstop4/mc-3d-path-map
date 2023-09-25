import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { createDoor, createPath, createPortal, createRoom } from './create';
import { getMaterials, initMaterials } from './materials';

import { DoorData, PathData, PortalData, RoomData } from './types';

import featureConfig from './config/features.json';

import pathsData from './data/paths';
import roomsData from './data/rooms';
import doorsData from './data/doors';
import portalsData from './data/portals';

const camX = -1;
const camY = 1;
const camZ = 1;
const viewScale = 4;

let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;
let cameraControls: MapControls;
let renderer: THREE.WebGLRenderer;
let labelRenderer: CSS2DRenderer;
let stats: Stats;

// const roomObjects = [];
// const doorObjects = [];
// const portalObjects = [];
// const pathObjects = [];

export function setupScene() {
  // Set up scene and camera
  scene = new THREE.Scene();
  // camera = new THREE.PerspectiveCamera(
  //   90,
  //   window.innerWidth / window.innerHeight,
  //   0.1,
  //   1000,
  // );
  camera = new THREE.OrthographicCamera(
    -window.innerWidth / viewScale,
    window.innerWidth / viewScale,
    window.innerHeight / viewScale,
    -window.innerHeight / viewScale,
    -1000,
    1000,
  );

  // Set up 3D and 2D renderers
  renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.className = 'labelRenderer';
  document.body.appendChild(labelRenderer.domElement);

  // Add Stats panel
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // Set up camera controls
  cameraControls = new MapControls(camera, renderer.domElement);
  cameraControls.enableDamping = false;

  camera.position.set(camX, camY, camZ);
  camera.lookAt(camX + 1, camY - 1, camZ + 1);
  cameraControls.update();

  // Set up lights
  const light = new THREE.AmbientLight(0xffffff); // soft white light
  scene.add(light);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 1;
  scene.add(directionalLight);

  initMaterials();

  // Lava
  if (featureConfig.lavaGeometry) {
    const lavaGeom = new THREE.PlaneGeometry(1500, 1500);
    const lavaMesh = new THREE.Mesh(lavaGeom, getMaterials().lava);
    lavaMesh.rotation.x = Math.PI / 2;
    lavaMesh.position.y = 32;
    scene.add(lavaMesh);
  }

  // Add map elements
  initObjects<RoomData>(roomsData, createRoom);
  initObjects<PathData>(pathsData, createPath);
  initObjects<DoorData>(doorsData, createDoor);
  initObjects<PortalData>(portalsData, createPortal);

  window.addEventListener('resize', onWindowResize, false);
}

function initObjects<T>(
  data: T[],
  createObjFunc: (data: T) => THREE.Mesh | null,
) {
  for (const object of data) {
    const mesh = createObjFunc(object);
    if (mesh !== null) {
      scene.add(mesh);
    }
  }
}

function onWindowResize() {
  camera.left = -window.innerWidth / viewScale;
  camera.right = window.innerWidth / viewScale;
  camera.top = window.innerHeight / viewScale;
  camera.bottom = -window.innerHeight / viewScale;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

export function render() {
  requestAnimationFrame(render);

  stats.update();
  cameraControls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
