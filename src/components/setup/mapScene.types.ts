import type { Scene, InstancedMesh, LOD } from 'three';
import type { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Coordinates } from '../../data/data.types';
import { CameraState } from './camera.types';

export type ModuleImport = {
  default: Object;
};

export type WorldData = {
  mapScene: Scene;
  cuboidRoomObjects: InstancedMesh;
  cylindricalRoomObjects: InstancedMesh;
  doorObjects: InstancedMesh;
  portalObjects: InstancedMesh;
  pathObjects: LOD[];
  roomLabels: CSS2DObject[];
  doorLabels: CSS2DObject[];
  portalLabels: CSS2DObject[];
  pathLabels: CSS2DObject[];
  numAllDoors: number;
  numActiveDoors: number;
  mapBounds: MapBounds;
  cameraStates: CameraState[];
};

export type MapBounds = {
  center: Coordinates;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
};
