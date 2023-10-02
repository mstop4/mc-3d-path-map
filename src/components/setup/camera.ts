import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { CameraState } from '../../types';

export let camera: THREE.OrthographicCamera;
export let cameraControls: MapControls;

const camX = -1;
const camY = 1;
const camZ = 1;
export const viewScale = 4;

const cameraStates: CameraState[] = [];

export function setupCamera() {
  camera = new THREE.OrthographicCamera(
    -window.innerWidth / viewScale,
    window.innerWidth / viewScale,
    window.innerHeight / viewScale,
    -window.innerHeight / viewScale,
    -1000,
    1000,
  );
}

export function setupCameraControls(renderer: THREE.WebGLRenderer) {
  cameraControls = new MapControls(camera, renderer.domElement);
  cameraControls.enableDamping = false;
  camera.position.set(camX, camY, camZ);
  camera.lookAt(0, 0, 0);
  cameraControls.update();

  const initCameraPos = getInitialCameraPosition();

  saveCameraState(new THREE.Vector3(0, 0, 0), initCameraPos, 1); // Isometric Camera
  saveCameraState(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, initCameraPos.y, 0),
    1,
  ); // Overhead Camera
  saveCameraState(new THREE.Vector3(0, 64, 0), new THREE.Vector3(-1, 64, 0), 1); // Side Camera (East)
  saveCameraState(new THREE.Vector3(0, 64, 0), new THREE.Vector3(0, 64, 1), 1); // Side Camera (North)
}

export function saveCameraState(
  target: THREE.Vector3,
  position: THREE.Vector3,
  zoom: number,
) {
  cameraStates.push({
    target,
    position,
    zoom,
  });

  return cameraStates.length;
}

export function loadCameraState(index: number) {
  if (index >= cameraStates.length) return;
  const state = cameraStates[index];

  cameraControls.target.copy(state.target);
  camera.position.copy(state.position);
  camera.zoom = state.zoom;
  camera.updateProjectionMatrix();
  cameraControls.update();
}

export function getInitialCameraPosition() {
  return new THREE.Vector3(camX, camY, camZ);
}
