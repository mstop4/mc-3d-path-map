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

type BaseRoomData = {
  label: string;
  displayLabel: boolean;
  type: RoomTypes;
};

type CuboidRoomData = BaseRoomData & {
  shape: 'cuboid';
  corners: [Coordinates, Coordinates];
};

type CylindricalRoomData = BaseRoomData & {
  shape: 'cylinder';
  bottomCenter: Coordinates;
  height: number;
  radius: number;
};

export type RoomData = CuboidRoomData | CylindricalRoomData;

export function isCuboidRoomData(
  roomData: RoomData,
): roomData is CuboidRoomData {
  return roomData.shape === 'cuboid';
}

export function isCylindricalRoomData(
  roomData: RoomData,
): roomData is CuboidRoomData {
  return roomData.shape === 'cylinder';
}

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
