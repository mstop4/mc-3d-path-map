import {
  Object3D,
  LOD,
  InstancedMesh,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  Vector3,
  MathUtils,
} from 'three';
// @ts-expect-error no type declarations for simplify-3d
import simplify from 'simplify-3d';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { getMaterial } from '../setup/materials';

import {
  baseDoorWidth,
  doorHeight,
  doorThickness,
  lodConfig,
  portalHeightSegments,
  portalSize,
  portalWidthSegments,
} from './mapObjects.config';
import { defaultPathProps } from '../../config/pathProps';
import featureConfig from '../../config/features.json';

import { type LineMaterial } from 'three/addons/lines/LineMaterial.js';

import {
  Coordinates,
  DoorData,
  PathData,
  PortalData,
  RoomData,
  isCuboidRoomData,
  isCylindricalRoomData,
} from '../../data/data.types';

const dummy = new Object3D();
const upVector = new Vector3(0, 1, 0);

let cuboidRoomObjects: InstancedMesh;
let cylindricalRoomObjects: InstancedMesh;
let doorObjects: InstancedMesh;
let portalObjects: InstancedMesh;
const pathObjects: LOD[] = [];
const roomLabels: CSS2DObject[] = [];
const doorLabels: CSS2DObject[] = [];
const portalLabels: CSS2DObject[] = [];
const pathLabels: CSS2DObject[] = [];

let numAllDoors: number;
let numActiveDoors: number;

function pointsArrayToVectors(array: Coordinates[]) {
  return array.map(point => {
    return { x: point[0], y: point[1], z: point[2] };
  });
}

function vectorsToFlatPointsArray(
  array: { x: number; y: number; z: number }[],
) {
  const pointsArray = [];
  for (const point of array) {
    pointsArray.push(point.x, point.y, point.z);
  }

  return pointsArray;
}

export function setupInstancedMapObjects(
  cuboidRoomsData: RoomData[],
  cylindricalRoomsData: RoomData[],
  portalsData: PortalData[],
  doorsData: DoorData[],
) {
  // Create rooms
  const roomMaterial = getMaterial('room');
  const cuboidRoomGeom = new BoxGeometry(1, 1, 1);
  const cylindricalRoomGeom = new CylinderGeometry(1, 1, 1, 8, 3);

  cuboidRoomObjects = new InstancedMesh(
    cuboidRoomGeom,
    roomMaterial,
    cuboidRoomsData.length,
  );

  cylindricalRoomObjects = new InstancedMesh(
    cylindricalRoomGeom,
    roomMaterial,
    cylindricalRoomsData.length,
  );

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
    cuboidRoomObjects,
    cylindricalRoomObjects,
    portalObjects,
    doorObjects,
  };
}

export function updateInstancedMeshes() {
  cuboidRoomObjects.instanceMatrix.needsUpdate = true;
  cylindricalRoomObjects.instanceMatrix.needsUpdate = true;
  portalObjects.instanceMatrix.needsUpdate = true;
  doorObjects.instanceMatrix.needsUpdate = true;
}

export function toggleDeprecatedDoors(visible: boolean) {
  doorObjects.count = visible ? numAllDoors : numActiveDoors;
  doorObjects.instanceMatrix.needsUpdate = true;
}

export function createPath(pathData: PathData, id: number) {
  const { points: rawPoints, type, visible, deprecated } = pathData;
  const returnValues: {
    pathMesh: null | LOD;
    debugPathLabel: null | CSS2DObject;
  } = {
    pathMesh: null,
    debugPathLabel: null,
  };
  if (!visible) return returnValues;
  if (rawPoints.length === 0) return returnValues;

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

  // Create LOD meshes
  const vectorPoints = pointsArrayToVectors(rawPoints);
  const pathLOD = new LOD();

  for (const config of lodConfig) {
    let pathGeom;

    if (config.tolerance > 0) {
      const simpleVectorPoints = simplify(vectorPoints, config.tolerance, true);
      const points = vectorsToFlatPointsArray(simpleVectorPoints);
      pathGeom = new LineGeometry().setPositions(points);
    } else {
      pathGeom = new LineGeometry().setPositions(rawPoints.flat(1));
    }
    const pathMesh = new Line2(pathGeom, defaultMaterial);
    pathMesh.computeLineDistances();
    pathMesh.updateMatrix();
    pathMesh.matrixAutoUpdate = false;
    pathLOD.addLevel(pathMesh, config.distance);
  }

  pathLOD.updateMatrix();
  pathLOD.matrixAutoUpdate = false;

  pathLOD.name = `Path${id}`;
  pathLOD.userData.type = type;
  pathLOD.userData.deprecated = deprecated;
  pathLOD.userData.defaultMaterial = defaultMaterial;
  pathLOD.userData.cbfMaterial = cbfMaterial;
  pathLOD.userData.extSimpleMaterial = extSimpleMaterial;
  pathLOD.userData.natSimpleMaterial = natSimpleMaterial;
  pathObjects.push(pathLOD);

  returnValues.pathMesh = pathLOD;

  if (import.meta.env.DEV && featureConfig.debugForceLabels) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'portalLabel';
    labelDiv.textContent = pathLOD.name;

    returnValues.debugPathLabel = new CSS2DObject(labelDiv);
    returnValues.debugPathLabel.center.set(0.5, 1.5);
    returnValues.debugPathLabel.layers.set(0);

    const center = getPathCenter(rawPoints);
    returnValues.debugPathLabel.position.set(center[0], center[1], center[2]);
    pathLabels.push(returnValues.debugPathLabel);
  }

  return returnValues;
}

export function createRoom(roomData: RoomData, id: number) {
  // Create room label
  let roomLabel: CSS2DObject | null = null;

  if (
    roomData.displayLabel ||
    (import.meta.env.DEV && featureConfig.debugForceLabels)
  ) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'portalLabel';
    labelDiv.textContent = roomData.label;

    roomLabel = new CSS2DObject(labelDiv);
    roomLabel.center.set(0.5, 1.5);
    roomLabel.layers.set(0);
    roomLabels.push(roomLabel);
  }

  if (isCuboidRoomData(roomData)) {
    const { corners } = roomData;

    resetDummyObject();
    dummy.position.set(
      (corners[0][0] + corners[1][0]) / 2,
      (corners[0][1] + corners[1][1]) / 2,
      (corners[0][2] + corners[1][2]) / 2,
    );
    dummy.scale.set(
      Math.abs(corners[1][0] - corners[0][0]) + 1,
      Math.abs(corners[1][1] - corners[0][1]) + 1,
      Math.abs(corners[1][2] - corners[0][2]) + 1,
    );
    dummy.updateMatrix();
    cuboidRoomObjects.setMatrixAt(id, dummy.matrix);

    if (roomLabel !== null) {
      roomLabel.position.set(
        (corners[0][0] + corners[1][0]) / 2,
        (corners[0][1] + corners[1][1]) / 2,
        (corners[0][2] + corners[1][2]) / 2,
      );
    }
  } else if (isCylindricalRoomData(roomData)) {
    const { height, radius, bottomCenter } = roomData;

    resetDummyObject();
    dummy.position.set(
      bottomCenter[0],
      bottomCenter[1] + height / 2,
      bottomCenter[2],
    );
    dummy.scale.set(radius + 1, radius + 1, height + 1);
    dummy.updateMatrix();
    cylindricalRoomObjects.setMatrixAt(id, dummy.matrix);

    if (roomLabel !== null) {
      roomLabel.position.set(
        bottomCenter[0],
        bottomCenter[1] + height / 2,
        bottomCenter[2],
      );
    }
  }

  return roomLabel;
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

  let debugDoorLabel = null;

  if (import.meta.env.DEV && featureConfig.debugForceLabels) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'portalLabel';
    labelDiv.textContent = `Door${id + 1}`;

    debugDoorLabel = new CSS2DObject(labelDiv);
    debugDoorLabel.center.set(0.5, 1.5);
    debugDoorLabel.layers.set(0);

    debugDoorLabel.position.set(location[0], location[1], location[2]);
    doorLabels.push(debugDoorLabel);
  }

  return debugDoorLabel;
}

export function createPortal(portalData: PortalData, id: number) {
  const { label, location, hasEnderChest, hasCherryTree } = portalData;

  // Create portal marker
  resetDummyObject();
  dummy.position.set(location[0], location[1] + portalSize / 2, location[2]);
  dummy.updateMatrix();
  portalObjects.setMatrixAt(id, dummy.matrix);

  // Create portal label
  const portalDiv = document.createElement('div');
  portalDiv.classList.add('portalLabel');
  portalDiv.textContent = label;

  const portalLabel = new CSS2DObject(portalDiv);
  portalLabel.center.set(0.5, 1.5);
  portalLabel.userData.enderChest = hasEnderChest;
  portalLabel.userData.cherryTree = hasCherryTree;
  portalLabels.push(portalLabel);

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
    cuboidRoomObjects,
    cylindricalRoomObjects,
    pathObjects,
    doorObjects,
    portalObjects,
    roomLabels,
    portalLabels,
    doorLabels,
    pathLabels,
  };
}

function resetDummyObject() {
  // dummy.matrix.identity() doesn't work for some reason
  dummy.position.set(0, 0, 0);
  dummy.setRotationFromAxisAngle(upVector, 0);
  dummy.scale.set(1, 1, 1);
}

function getPathCenter(rawPoints: Coordinates[]) {
  const coordsSum = [0, 0, 0];

  for (const point of rawPoints) {
    coordsSum[0] += point[0];
    coordsSum[1] += point[1];
    coordsSum[2] += point[2];
  }

  return [
    coordsSum[0] / rawPoints.length,
    coordsSum[1] / rawPoints.length,
    coordsSum[2] / rawPoints.length,
  ];
}
