import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { createDoor, createPath, createPortal, createRoom } from './create';
import { getMaterial, initMaterials } from './materials';

import { type CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { DoorData, PathData, PortalData, RoomData } from './types';

import featureConfig from './config/features.json';

import pathsData from './data/paths';
import roomsData from './data/rooms';
import doorsData from './data/doors';
import portalsData from './data/portals';
import { setupGUI } from './gui';

const camX = -1;
const camY = 1;
const camZ = 1;
const viewScale = 4;

let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;
let cameraControls: MapControls;
let renderer: THREE.WebGLRenderer;
let labelRenderer: CSS2DRenderer;
let raycaster: THREE.Raycaster;
let pointer: THREE.Vector2;
let stats: Stats;

const roomObjects: THREE.Mesh[] = [];
const doorObjects: THREE.Mesh[] = [];
const portalObjects: THREE.Mesh[] = [];
const pathObjects: THREE.Mesh[] = [];
const labelObjects: CSS2DObject[] = [];

export function setupScene() {
  // Set up scene, camera, raycaster
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(
    -window.innerWidth / viewScale,
    window.innerWidth / viewScale,
    window.innerHeight / viewScale,
    -window.innerHeight / viewScale,
    -1000,
    1000,
  );
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  // Set up 3D and 2D renderers
  renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.className = 'labelRenderer';
  document.body.appendChild(labelRenderer.domElement);

  // Add Stats panel
  if (import.meta.env.DEV) {
    stats = new Stats();
    document.body.appendChild(stats.dom);
  }

  // Set up camera controls
  cameraControls = new MapControls(camera, renderer.domElement);
  cameraControls.enableDamping = false;

  camera.position.set(camX, camY, camZ);
  camera.lookAt(camX + 1, camY - 1, camZ + 1);
  cameraControls.update();
  cameraControls.saveState();

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
    const lavaMesh = new THREE.Mesh(lavaGeom, getMaterial('lava'));
    lavaMesh.rotation.x = Math.PI / 2;
    lavaMesh.position.y = 32;
    scene.add(lavaMesh);
  }

  // Add map elements
  initMapObjects<RoomData>(roomsData, (object, id) => {
    const { roomMesh, roomLabel } = createRoom(object, id);
    let incrementId = false;

    if (roomMesh !== null) {
      roomObjects.push(roomMesh);
      scene.add(roomMesh);
      incrementId = true;
    }

    if (roomLabel !== null) {
      labelObjects.push(roomLabel);
    }

    return incrementId;
  });

  initMapObjects<PathData>(pathsData, (object, id) => {
    const pathMesh = createPath(object, id);
    if (pathMesh !== null) {
      pathObjects.push(pathMesh);
      scene.add(pathMesh);
      return true;
    }
    return false;
  });

  initMapObjects<DoorData>(doorsData, (object, id) => {
    const doorMesh = createDoor(object, id);
    doorObjects.push(doorMesh);
    scene.add(doorMesh);
    return true;
  });

  initMapObjects<PortalData>(portalsData, (object, id) => {
    const { portalMesh, portalLabel } = createPortal(object, id);
    portalObjects.push(portalMesh);
    scene.add(portalMesh);

    if (portalLabel !== null) {
      labelObjects.push(portalLabel);
    }

    return true;
  });

  if (featureConfig.raycasterOn) {
    window.addEventListener('pointermove', onPointerDown);
  }
  window.addEventListener('resize', onWindowResize);

  setupGUI();
}

export function getMapObjects() {
  return {
    roomObjects,
    pathObjects,
    doorObjects,
    portalObjects,
    labelObjects,
  };
}

function initMapObjects<T>(
  data: T[],
  createObjFunc: (object: T, id: number) => boolean,
) {
  let id = 0;

  for (const object of data) {
    const incrementId = createObjFunc(object, id);
    if (incrementId) id++;
  }
}

export function resetCamera() {
  cameraControls.reset();
}

function onPointerDown(event: MouseEvent) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
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

  if (featureConfig.raycasterOn) {
    raycaster.setFromCamera(pointer, camera);
    const hitObjects = raycaster.intersectObjects(scene.children, true);
    if (hitObjects.length > 0) {
      console.log(hitObjects[0].object.name);
    }
  }

  cameraControls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  stats.update();
}
