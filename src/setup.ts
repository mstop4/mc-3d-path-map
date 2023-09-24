import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { createDoor, createPath, createPortal, createRoom } from './create';

import { DoorData, PathData, PortalData, RoomData } from './types';

import featureConfig from './config/features.json';
import materialDefs from './config/materials';

import pathsData from './data/paths.json';
import roomsData from './data/rooms.json';
import doorsData from './data/doors.json';
import portalsData from './data/portals.json';

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
const materials: Record<string, THREE.Material | LineMaterial> = {};

function initMaterials() {
  const { mesh, line } = materialDefs;

  for (const materialName in mesh) {
    const materialDef = mesh[materialName];
    materials[materialName] = new THREE.MeshStandardMaterial(materialDef);
  }

  for (const materialName in line) {
    const materialDef = line[materialName];
    materials[materialName] = new LineMaterial(materialDef);
  }
}

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

  window.addEventListener('resize', onWindowResize, false);
}

export function getMaterials(): Record<string, THREE.Material> {
  return materials;
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
