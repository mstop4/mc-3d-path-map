import * as THREE from 'three';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';

import { type LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

import { PathData, RoomData } from './types';
import { getMaterials } from './setup';

export function createPath(pathData: PathData) {
  try {
    const { points: rawPoints, type } = pathData;
    const points = rawPoints.flat(1);
    const material = getMaterials()[type] as LineMaterial;

    const lineGeometry = new LineGeometry().setPositions( points );
    const line = new Line2( lineGeometry, material );
    line.computeLineDistances();
    line.scale.set( 1, 1, 1 );
    return line;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
}

export function createRoom(roomData: RoomData) {
  const { corners } = roomData;
  const material = getMaterials().room as THREE.MeshStandardMaterial;

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