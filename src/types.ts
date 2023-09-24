import { type OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type PathTypes =
  | 'ugTunnel'
  | 'ogTunnel'
  | 'cBridge'
  | 'oBridge'
  | 'exPath'
  | 'nCave'
  | 'ladder'
  | 'bastion'
  | 'nFortress';
export type RoomTypes = 'ugRoom' | 'ogRoom';
export type DoorTypes = 'ex' | 'conn';
export type DoorOrientation = 'x' | 'y' | 'z';
export type Coordinates = [number, number, number];

export type SceneComponents = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  cameraControls: OrbitControls;
  renderer: THREE.WebGLRenderer;
};

export type PathData = {
  type: PathTypes;
  visible: boolean;
  points: Coordinates[];
};

export type RoomData = {
  label: string;
  displayLabel: boolean;
  type: RoomTypes;
  corners: [Coordinates, Coordinates];
};

export type DoorData = {
  quantity: 1 | 2;
  orientation: DoorOrientation;
  type: DoorTypes;
  location: Coordinates;
};

export type PortalData = {
  label: string;
  location: Coordinates;
};
