import { OrthographicCamera, type WebGLRenderer, Vector3 } from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { getMapBounds } from './mapScene';
import {
  autoRotateSpeed,
  guiScaleSize,
  ratios,
  viewScale,
} from './camera.config';
import { CameraState } from '../setup/camera.types';

export let camera: OrthographicCamera;
export let cameraControls: MapControls;
const cameraStates: CameraState[] = [];
let lastZoom: number;
let initialCameraPosition: Vector3;
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
  cameraControls.autoRotateSpeed = autoRotateSpeed;

  const { center, xMin, xMax, zMin, zMax } = getMapBounds();
  initialCameraPosition = new Vector3(
    center[0] - 1,
    center[1] + 1,
    center[2] + 1,
  );
  lastZoom = 0;

  const xLength = xMax - xMin;
  const zLength = zMax - zMin;
  const diagonalLength = Math.sqrt(Math.pow(xLength, 2) + Math.pow(zLength, 2));

  saveCameraState(new Vector3(...center), initialCameraPosition, 1); // Isometric Camera
  saveCameraState(
    new Vector3(...center),
    new Vector3(center[0], 127, center[2]),
    1,
  ); // Overhead Camera
  saveCameraState(
    new Vector3(center[0], 64, center[2]),
    new Vector3(center[0] - 1, 64, center[2]),
    1,
  ); // Side Camera (East)
  saveCameraState(
    new Vector3(center[0], 64, center[2]),
    new Vector3(center[0], 64, center[2] + 1),
    1,
  ); // Side Camera (North)
  saveCameraState(
    new Vector3(...center),
    initialCameraPosition,
    (ratios.isometricZoom / diagonalLength) *
      (window.innerHeight / ratios.windowHeight),
  ); // Demo Camera

  scaleNumberElem = document.getElementById('scaleNumber');

  if (scaleNumberElem !== null) {
    onZoomChanged();
    cameraControls.addEventListener('change', onZoomChanged);
  }

  loadCameraState(0);
}

function onZoomChanged() {
  if (camera.zoom !== lastZoom && scaleNumberElem !== null) {
    const rawScaleNumber = (ratios.zoomToScaleGUI / camera.zoom) * guiScaleSize;
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
  return initialCameraPosition;
}
