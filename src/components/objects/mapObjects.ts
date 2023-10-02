import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { getMaterial } from '../setup/materials';

import { defaultPathProps } from '../../config/pathProps';

import { type LineMaterial } from 'three/addons/lines/LineMaterial.js';
import {
  DoorData,
  PathData,
  PortalData,
  RoomData,
  isCuboidRoomData,
  isCylindricalRoomData,
} from '../../types';

const doorThickness = 0.25;
const doorHeight = 2;
const baseDoorWidth = 1;

const portalSize = 1;
const portalWidthSegments = 4;
const portalHeightSegments = 2;

export function createPath(pathData: PathData, id: number) {
  const { points: rawPoints, type, visible, deprecated } = pathData;
  if (!visible) return null;
  if (rawPoints.length === 0) return null;

  const points = rawPoints.flat(1);

  const defaultMaterial = (
    deprecated ? getMaterial(`${type}Deprecated`) : getMaterial(type)
  ) as LineMaterial;

  const { isExterior, isNatural } = defaultPathProps[type];

  const extSimpleMaterial = isExterior
    ? getMaterial(`simpleExterior${deprecated ? 'Deprecated' : ''}`)
    : (getMaterial(
        `simpleInterior${deprecated ? 'Deprecated' : ''}`,
      ) as LineMaterial);
  const natSimpleMaterial = isNatural
    ? getMaterial(`simpleNatural${deprecated ? 'Deprecated' : ''}`)
    : (getMaterial(
        `simpleArtificial${deprecated ? 'Deprecated' : ''}`,
      ) as LineMaterial);

  const pathGeom = new LineGeometry().setPositions(points);
  const pathMesh = new Line2(pathGeom, defaultMaterial);
  pathMesh.computeLineDistances();
  pathMesh.scale.set(1, 1, 1);
  pathMesh.updateMatrixWorld();

  pathMesh.name = `Path${id}`;
  pathMesh.userData.type = type;
  pathMesh.userData.deprecated = deprecated;
  pathMesh.userData.defaultMaterial = defaultMaterial;
  pathMesh.userData.extSimpleMaterial = extSimpleMaterial;
  pathMesh.userData.natSimpleMaterial = natSimpleMaterial;

  return pathMesh;
}

export function createRoom(roomData: RoomData, id: number) {
  let roomMesh: THREE.Mesh | null = null;
  const material = getMaterial('room') as THREE.MeshStandardMaterial;

  if (isCuboidRoomData(roomData)) {
    const { corners } = roomData;

    const width = Math.abs(corners[1][0] - corners[0][0]) + 1;
    const height = Math.abs(corners[1][1] - corners[0][1]) + 1;
    const length = Math.abs(corners[1][2] - corners[0][2]) + 1;

    const roomGeom = new THREE.BoxGeometry(width, height, length);
    roomMesh = new THREE.Mesh(roomGeom, material);
    roomMesh.position.x = (corners[0][0] + corners[1][0]) / 2;
    roomMesh.position.y = (corners[0][1] + corners[1][1]) / 2;
    roomMesh.position.z = (corners[0][2] + corners[1][2]) / 2;
  } else if (isCylindricalRoomData(roomData)) {
    const { height, radius, bottomCenter } = roomData;

    const roomGeom = new THREE.CylinderGeometry(
      radius + 1,
      radius + 1,
      height + 1,
      8,
      3,
    );
    roomMesh = new THREE.Mesh(roomGeom, material);
    roomMesh.position.x = bottomCenter[0];
    roomMesh.position.y = bottomCenter[1] + height / 2;
    roomMesh.position.z = bottomCenter[2];
  }

  let roomLabel = null;

  if (roomMesh !== null) {
    roomMesh.name = `Room${id}`;

    // Create room label
    if (roomData.displayLabel) {
      roomMesh.layers.enableAll();
      const labelDiv = document.createElement('div');
      labelDiv.className = 'portalLabel';
      labelDiv.textContent = roomData.label;

      roomLabel = new CSS2DObject(labelDiv);
      roomLabel.center.set(0.5, 1.5);
      roomMesh.add(roomLabel);
      roomLabel.layers.set(0);
    }

    roomMesh.updateMatrixWorld();
  }

  return {
    roomMesh,
    roomLabel,
  };
}

export function createDoor(doorData: DoorData, id: number) {
  const { quantity, location, orientation, deprecated } = doorData;
  const material = getMaterial('door');
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
  doorMesh.updateMatrixWorld();

  doorMesh.name = `Door${id}`;
  doorMesh.userData.deprecated = deprecated;

  return doorMesh;
}

export function createPortal(portalData: PortalData, id: number) {
  const { label, location } = portalData;
  const material = getMaterial('portal');

  // Create portal marker
  const portalGeom = new THREE.SphereGeometry(
    portalSize,
    portalWidthSegments,
    portalHeightSegments,
  );
  const portalMesh = new THREE.Mesh(portalGeom, material);
  portalMesh.position.x = location[0];
  portalMesh.position.y = location[1] + portalSize / 2;
  portalMesh.position.z = location[2];
  portalMesh.name = `Portal${id}`;

  // Create portal label
  portalMesh.layers.enableAll();
  const portalDiv = document.createElement('div');
  portalDiv.className = 'portalLabel';
  portalDiv.textContent = label;

  const portalLabel = new CSS2DObject(portalDiv);
  portalLabel.center.set(0.5, 1.5);
  portalMesh.add(portalLabel);
  portalLabel.layers.set(0);
  portalMesh.updateMatrixWorld();

  return {
    portalMesh,
    portalLabel,
  };
}