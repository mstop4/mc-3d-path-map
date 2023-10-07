import {
  Object3D,
  Mesh,
  type MeshStandardMaterial,
  InstancedMesh,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  Vector3,
  MathUtils,
} from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { getMaterial } from '../setup/materials';

import {
  baseDoorWidth,
  doorHeight,
  doorThickness,
  portalHeightSegments,
  portalSize,
  portalWidthSegments,
} from './mapObjects.config';
import { defaultPathProps } from '../../config/pathProps';

import { type LineMaterial } from 'three/addons/lines/LineMaterial.js';
import {
  DoorData,
  PathData,
  PortalData,
  RoomData,
  isCuboidRoomData,
  isCylindricalRoomData,
} from '../../data/data.types';

const dummy = new Object3D();
const upVector = new Vector3(0, 1, 0);

const roomObjects: Mesh[] = [];
let doorObjects: InstancedMesh;
let portalObjects: InstancedMesh;
const pathObjects: Mesh[] = [];
const labelObjects: CSS2DObject[] = [];

let numAllDoors: number;
let numActiveDoors: number;

export function setupInstancedMapObjects(
  portalsData: PortalData[],
  doorsData: DoorData[],
) {
  // Create portals
  const portalMaterial = getMaterial('portal');
  const portalGeom = new SphereGeometry(
    portalSize,
    portalWidthSegments,
    portalHeightSegments,
  );

  portalObjects = new InstancedMesh(
    portalGeom,
    portalMaterial,
    portalsData.length,
  );

  // Create doors
  const doorMaterial = getMaterial('door');
  const doorGeom = new BoxGeometry(doorThickness, doorHeight, baseDoorWidth);

  doorObjects = new InstancedMesh(doorGeom, doorMaterial, doorsData.length);
  const firstDeprecatedDoorIndex = doorsData.findIndex(door => door.deprecated);

  // Count number of doors and how manyare not deprecated
  numAllDoors = doorsData.length;
  numActiveDoors =
    firstDeprecatedDoorIndex !== -1
      ? firstDeprecatedDoorIndex
      : doorsData.length;

  return {
    portalObjects,
    doorObjects,
  };
}

export function updateInstancedMeshes() {
  portalObjects.instanceMatrix.needsUpdate = true;
  doorObjects.instanceMatrix.needsUpdate = true;
}

export function toggleDeprecatedDoors(visible: boolean) {
  doorObjects.count = visible ? numAllDoors : numActiveDoors;
  doorObjects.instanceMatrix.needsUpdate = true;
}

export function createPath(pathData: PathData, id: number) {
  const { points: rawPoints, type, visible, deprecated } = pathData;
  if (!visible) return null;
  if (rawPoints.length === 0) return null;

  const points = rawPoints.flat(1);

  const defaultMaterial = (
    deprecated ? getMaterial(`${type}_deprecated`) : getMaterial(type)
  ) as LineMaterial;

  const cbfMaterial = (
    deprecated
      ? getMaterial(`cb_${type}_deprecated`)
      : getMaterial(`cb_${type}`)
  ) as LineMaterial;

  const { isExterior, isNatural } = defaultPathProps[type];

  const extSimpleMaterial = isExterior
    ? getMaterial(`simpleExterior${deprecated ? '_deprecated' : ''}`)
    : (getMaterial(
        `simpleInterior${deprecated ? '_deprecated' : ''}`,
      ) as LineMaterial);
  const natSimpleMaterial = isNatural
    ? getMaterial(`simpleNatural${deprecated ? '_deprecated' : ''}`)
    : (getMaterial(
        `simpleArtificial${deprecated ? '_deprecated' : ''}`,
      ) as LineMaterial);

  const pathGeom = new LineGeometry().setPositions(points);
  const pathMesh = new Line2(pathGeom, defaultMaterial);
  pathMesh.computeLineDistances();

  // TODO: Is there a way to decimate LineGeometry for LOD purposes?
  // SimplifyModifier doesn't work because LineGeometry uses instanced geometry

  pathMesh.name = `Path${id}`;
  pathMesh.userData.type = type;
  pathMesh.userData.deprecated = deprecated;
  pathMesh.userData.defaultMaterial = defaultMaterial;
  pathMesh.userData.cbfMaterial = cbfMaterial;
  pathMesh.userData.extSimpleMaterial = extSimpleMaterial;
  pathMesh.userData.natSimpleMaterial = natSimpleMaterial;
  pathObjects.push(pathMesh);

  return pathMesh;
}

export function createRoom(roomData: RoomData, id: number) {
  let roomMesh: Mesh | null = null;
  const material = getMaterial('room') as MeshStandardMaterial;

  if (isCuboidRoomData(roomData)) {
    const { corners } = roomData;

    const width = Math.abs(corners[1][0] - corners[0][0]) + 1;
    const height = Math.abs(corners[1][1] - corners[0][1]) + 1;
    const length = Math.abs(corners[1][2] - corners[0][2]) + 1;

    const roomGeom = new BoxGeometry(width, height, length);
    roomMesh = new Mesh(roomGeom, material);
    roomMesh.position.x = (corners[0][0] + corners[1][0]) / 2;
    roomMesh.position.y = (corners[0][1] + corners[1][1]) / 2;
    roomMesh.position.z = (corners[0][2] + corners[1][2]) / 2;
  } else if (isCylindricalRoomData(roomData)) {
    const { height, radius, bottomCenter } = roomData;

    const roomGeom = new CylinderGeometry(
      radius + 1,
      radius + 1,
      height + 1,
      8,
      3,
    );
    roomMesh = new Mesh(roomGeom, material);
    roomMesh.position.x = bottomCenter[0];
    roomMesh.position.y = bottomCenter[1] + height / 2;
    roomMesh.position.z = bottomCenter[2];
  }

  if (roomMesh !== null) {
    roomMesh.name = `Room${id}`;
    roomObjects.push(roomMesh);

    // Create room label
    if (roomData.displayLabel) {
      roomMesh.layers.enableAll();
      const labelDiv = document.createElement('div');
      labelDiv.className = 'portalLabel';
      labelDiv.textContent = roomData.label;

      const roomLabel = new CSS2DObject(labelDiv);
      roomLabel.center.set(0.5, 1.5);
      roomMesh.add(roomLabel);
      roomLabel.layers.set(0);
      labelObjects.push(roomLabel);
    }

    roomMesh.updateMatrixWorld();
  }

  return roomMesh;
}

export function createDoor(doorData: DoorData, id: number) {
  const { quantity, location, orientation } = doorData;

  // Create door marker
  resetDummyObject();
  dummy.position.set(location[0], location[1] + doorHeight / 2, location[2]);
  if (orientation === 'z') {
    dummy.setRotationFromAxisAngle(upVector, MathUtils.degToRad(90));
  }
  dummy.scale.set(1, 1, quantity);
  dummy.updateMatrix();
  doorObjects.setMatrixAt(id, dummy.matrix);
}

export function createPortal(portalData: PortalData, id: number) {
  const { label, location } = portalData;

  // Create portal marker
  resetDummyObject();
  dummy.position.set(location[0], location[1] + portalSize / 2, location[2]);
  dummy.updateMatrix();
  portalObjects.setMatrixAt(id, dummy.matrix);

  // Create portal label
  const portalDiv = document.createElement('div');
  portalDiv.className = 'portalLabel';
  portalDiv.textContent = label;

  const portalLabel = new CSS2DObject(portalDiv);
  portalLabel.center.set(0.5, 1.5);
  labelObjects.push(portalLabel);

  portalLabel.position.set(
    location[0],
    location[1] + portalSize / 2,
    location[2],
  );
  portalLabel.layers.set(0);

  return portalLabel;
}

export function getMapObjects() {
  return {
    roomObjects,
    pathObjects,
    doorObjects,
    portalObjects,
    labelObjects,
  };
}

function resetDummyObject() {
  // dummy.matrix.identity() doesn't work for some reason
  dummy.position.set(0, 0, 0);
  dummy.setRotationFromAxisAngle(upVector, 0);
  dummy.scale.set(1, 1, 1);
}
