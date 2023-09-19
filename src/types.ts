import { type OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type RenderParams = {
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