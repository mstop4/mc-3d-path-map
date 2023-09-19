import * as THREE from 'three';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';

import { PathData, RoomData } from './types';
import { type LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

export function createPath(pathData: PathData, material: LineMaterial) {
  const { points: rawPoints } = pathData;
  const points = rawPoints.flat(1);

  const lineGeometry = new LineGeometry().setPositions( points );
  const line = new Line2( lineGeometry, material );
  line.computeLineDistances();
  line.scale.set( 1, 1, 1 );
  return line;
}

export function createRoom(roomData: RoomData, material: THREE.Material) {
  const { corners } = roomData;
  const width = Math.abs(corners[1][0] - corners[0][0]) + 1;
  const height = Math.abs(corners[1][1] - corners[0][1]) + 1;
  const length = Math.abs(corners[1][2] - corners[0][2]) + 1;

  const cubeGeometry = new THREE.BoxGeometry( width, height, length );
  const cube = new THREE.Mesh( cubeGeometry, material );
  cube.position.x = (corners[0][0] + corners[1][0]) / 2;
  cube.position.y = (corners[0][1] + corners[1][1]) / 2;
  cube.position.z = (corners[0][2] + corners[1][2]) / 2;
  return cube;
}