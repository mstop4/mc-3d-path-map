import { Vector3 } from 'three';

export type CameraState = {
  target: Vector3;
  position: Vector3;
  zoom: number;
};
