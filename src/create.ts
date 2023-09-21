import * as THREE from 'three';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';

import { type LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

import { DoorData, PathData, PortalData, RoomData } from './types';
import { getMaterials } from './setup';

const doorThickness = 0.25;
const doorHeight = 2;
const baseDoorWidth = 1;

const portalSize = 1;
const portalWidthSegments = 4;
const portalHeightSegments = 2;

export function createPath(pathData: PathData) {
  try {
    const { points: rawPoints, type } = pathData;
    if (rawPoints.length === 0) return null;
    const points = rawPoints.flat(1);
    const material = getMaterials()[type] as LineMaterial;

    const pathGeom = new LineGeometry().setPositions(points);
    const pathMesh = new Line2(pathGeom, material);
    pathMesh.computeLineDistances();
    pathMesh.scale.set(1, 1, 1);
    return pathMesh;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    return null;
  }
}

export function createRoom(roomData: RoomData) {
  try {
    const { corners } = roomData;
    const material = getMaterials().room as THREE.MeshStandardMaterial;

    const width = Math.abs(corners[1][0] - corners[0][0]) + 1;
    const height = Math.abs(corners[1][1] - corners[0][1]) + 1;
    const length = Math.abs(corners[1][2] - corners[0][2]) + 1;

    const roomGeom = new THREE.BoxGeometry(width, height, length);
    const roomMesh = new THREE.Mesh(roomGeom, material);
    roomMesh.position.x = (corners[0][0] + corners[1][0]) / 2;
    roomMesh.position.y = (corners[0][1] + corners[1][1]) / 2;
    roomMesh.position.z = (corners[0][2] + corners[1][2]) / 2;
    return roomMesh;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    return null;
  }
}

export function createDoor(doorData: DoorData) {
  try {
    const { quantity, location, orientation } = doorData;
    const material = getMaterials().door;
    let width, length, height;

    if (orientation === 'x') {
      width = doorThickness;
      length = quantity * baseDoorWidth;
      height = doorHeight;
    } else {
      width = quantity * baseDoorWidth;
      length = doorThickness;
      height = doorHeight;
    }

    const doorGeom = new THREE.BoxGeometry(width, height, length);
    const doorMesh = new THREE.Mesh(doorGeom, material);
    doorMesh.position.x = location[0];
    doorMesh.position.y = location[1] + height / 2;
    doorMesh.position.z = location[2];

    return doorMesh;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    return null;
  }
}

export function createPortal(portalData: PortalData) {
  try {
    const { location } = portalData;
    const material = getMaterials().portal;

    const portalGeom = new THREE.SphereGeometry(
      portalSize,
      portalWidthSegments,
      portalHeightSegments,
    );
    const portalMesh = new THREE.Mesh(portalGeom, material);
    portalMesh.position.x = location[0];
    portalMesh.position.y = location[1] + portalSize / 2;
    portalMesh.position.z = location[2];

    return portalMesh;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
    return null;
  }
}
