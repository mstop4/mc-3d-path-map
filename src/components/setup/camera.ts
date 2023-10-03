import { OrthographicCamera, type WebGLRenderer, Vector3 } from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { CameraState } from '../../types';

export let camera: OrthographicCamera;
export let cameraControls: MapControls;
let lastZoom: number;

const camX = -1;
const camY = 1;
const camZ = 1;
export const viewScale = 4;
const zoomConst = 0.5133420832795057; // used to calculate the relationship between camera zoom and the scale on the gui
const guiScaleSize = 100;

const cameraStates: CameraState[] = [];
let scaleNumberElem: HTMLElement | null;

export function setupCamera() {
  camera = new OrthographicCamera(
    -window.innerWidth / viewScale,
    window.innerWidth / viewScale,
    window.innerHeight / viewScale,
    -window.innerHeight / viewScale,
    -1000,
    1000,
  );
}

export function setupCameraControls(renderer: WebGLRenderer) {
  cameraControls = new MapControls(camera, renderer.domElement);
  cameraControls.enableDamping = false;
  camera.position.set(camX, camY, camZ);
  camera.lookAt(0, 0, 0);
  cameraControls.update();
  lastZoom = 0;
  scaleNumberElem = document.getElementById('scaleNumber');

  if (scaleNumberElem !== null) {
    onZoomChanged();
    cameraControls.addEventListener('change', onZoomChanged);
  }

  const initCameraPos = getInitialCameraPosition();

  saveCameraState(new Vector3(0, 0, 0), initCameraPos, 1); // Isometric Camera
  saveCameraState(new Vector3(0, 0, 0), new Vector3(0, initCameraPos.y, 0), 1); // Overhead Camera
  saveCameraState(new Vector3(0, 64, 0), new Vector3(-1, 64, 0), 1); // Side Camera (East)
  saveCameraState(new Vector3(0, 64, 0), new Vector3(0, 64, 1), 1); // Side Camera (North)
}

function onZoomChanged() {
  if (camera.zoom !== lastZoom && scaleNumberElem !== null) {
    const rawScaleNumber = (zoomConst / camera.zoom) * guiScaleSize;
    let formattedScaleNumber: string;

    if (rawScaleNumber >= 10) {
      formattedScaleNumber = Math.round(rawScaleNumber).toString();
    } else if (rawScaleNumber >= 1) {
      formattedScaleNumber = (Math.round(rawScaleNumber * 10) / 10).toFixed(1);
    } else {
      formattedScaleNumber = (Math.round(rawScaleNumber * 100) / 100).toFixed(
        2,
      );
    }

    scaleNumberElem.innerHTML = `${formattedScaleNumber} blocks`;
    lastZoom = camera.zoom;
  }
}

export function saveCameraState(
  target: Vector3,
  position: Vector3,
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
  return new Vector3(camX, camY, camZ);
}
