import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createDoor, createPath, createPortal, createRoom } from './create';

import { DoorData, PathData, PortalData, RoomData } from './types';

import pathsData from './data/paths.json';
import roomsData from './data/rooms.json';
import doorsData from './data/doors.json';
import portalsData from './data/portals.json';

const camX = -100;
const camY = 100;
const camZ = -100;

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let cameraControls: OrbitControls;
let renderer: THREE.WebGLRenderer;
let stats: Stats;
const materials: Record<string, THREE.Material | LineMaterial> = {};

function initMaterials() {
  materials.room = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    opacity: 0.5,
    transparent: true,
  });
  materials.door = new THREE.MeshStandardMaterial({
    color: 0xe0a060,
    opacity: 0.75,
    transparent: true,
  });
  materials.portal = new THREE.MeshStandardMaterial({
    color: 0xc000ff,
  });
  materials.ogTunnel = new LineMaterial({ color: 0x8090ff, linewidth: 0.0025 }); // Overground Tunnel
  materials.ugTunnel = new LineMaterial({ color: 0x80b0d0, linewidth: 0.0025 }); // Underground Tunnel
  materials.cBridge = new LineMaterial({ color: 0x80ff80, linewidth: 0.0025 }); // Covered Bridge
  materials.oBridge = new LineMaterial({ color: 0xffd040, linewidth: 0.0025 }); // Open Bridge
  materials.exPath = new LineMaterial({ color: 0xc00000, linewidth: 0.0025 }); // External Path
  materials.nCave = new LineMaterial({ color: 0xc06000, linewidth: 0.0025 }); // Natural Cave
  materials.ladder = new LineMaterial({ color: 0xffffff, linewidth: 0.0025 }); // Ladder
  materials.bastion = new LineMaterial({ color: 0x404080, linewidth: 0.0025 }); // Bastion
}

export function setupScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  // camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 10000);
  renderer = new THREE.WebGLRenderer();
  stats = new Stats();
  document.body.appendChild(stats.dom);

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  cameraControls = new OrbitControls(camera, renderer.domElement);

  const light = new THREE.AmbientLight(0xffffff); // soft white light
  scene.add(light);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 1;
  scene.add(directionalLight);

  initMaterials();

  for (const room of roomsData as RoomData[]) {
    const roomMesh = createRoom(room);
    if (roomMesh !== null) {
      scene.add(roomMesh);
    }
  }

  for (const path of pathsData as PathData[]) {
    const pathMesh = createPath(path);
    if (pathMesh !== null) {
      scene.add(pathMesh);
    }
  }

  for (const door of doorsData as DoorData[]) {
    const doorMesh = createDoor(door);
    if (doorMesh !== null) {
      scene.add(doorMesh);
    }
  }

  for (const portal of portalsData as PortalData[]) {
    const portalMesh = createPortal(portal);
    if (portalMesh !== null) {
      scene.add(portalMesh);
    }
  }

  camera.position.set(camX, camY, camZ);
  camera.lookAt(camX + 1, camY - 1, camZ + 1);
  cameraControls.update();

  window.addEventListener('resize', onWindowResize, false);
}

export function getMaterials(): Record<string, THREE.Material> {
  return materials;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function render() {
  requestAnimationFrame(render);

  stats.update();
  cameraControls.update();
  renderer.render(scene, camera);
}
