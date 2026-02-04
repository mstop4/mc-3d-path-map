import { Object3D, LOD, Vector3, MathUtils } from 'three';
// @ts-expect-error no type declarations for simplify-3d
import simplify from 'simplify-3d';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { getMaterial } from '../setup/materials';

import { doorHeight, lodConfig, portalSize } from './mapObjects.config';
import { defaultPathProps } from '../../config/pathProps';
import featureConfig from '../../config/features.json';

import { type LineMaterial } from 'three/addons/lines/LineMaterial.js';

import {
  Coordinates,
  DoorData,
  PathData,
  BaseData,
  RoomData,
  isCuboidRoomData,
  isCylindricalRoomData,
} from '../../data/data.types';
import { WorldData } from '../setup/mapScene.types';

const dummy = new Object3D();
const upVector = new Vector3(0, 1, 0);

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

export function updateInstancedMeshes(world: WorldData) {
  const {
    cuboidRoomObjects,
    cylindricalRoomObjects,
    portalObjects,
    doorObjects,
  } = world;
  cuboidRoomObjects.instanceMatrix.needsUpdate = true;
  cylindricalRoomObjects.instanceMatrix.needsUpdate = true;
  portalObjects.instanceMatrix.needsUpdate = true;
  doorObjects.instanceMatrix.needsUpdate = true;
}

export function toggleDeprecatedDoors(world: WorldData, visible: boolean) {
  const { doorObjects, numActiveDoors, numAllDoors } = world;
  doorObjects.count = visible ? numAllDoors : numActiveDoors;
  doorObjects.instanceMatrix.needsUpdate = true;
}

export function createPath(world: WorldData, pathData: PathData, id: number) {
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
  world.pathObjects.push(pathLOD);

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
    world.pathLabels.push(returnValues.debugPathLabel);
  }

  return returnValues;
}

export function createRoom(world: WorldData, roomData: RoomData, id: number) {
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
    world.roomLabels.push(roomLabel);
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
    world.cuboidRoomObjects?.setMatrixAt(id, dummy.matrix);

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
    world.cylindricalRoomObjects?.setMatrixAt(id, dummy.matrix);

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

export function createDoor(world: WorldData, doorData: DoorData, id: number) {
  const { quantity, location, orientation } = doorData;

  // Create door marker
  resetDummyObject();
  dummy.position.set(location[0], location[1] + doorHeight / 2, location[2]);
  if (orientation === 'z') {
    dummy.setRotationFromAxisAngle(upVector, MathUtils.degToRad(90));
  }
  dummy.scale.set(1, 1, quantity);
  dummy.updateMatrix();
  world.doorObjects?.setMatrixAt(id, dummy.matrix);

  let debugDoorLabel = null;

  if (import.meta.env.DEV && featureConfig.debugForceLabels) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'portalLabel';
    labelDiv.textContent = `Door${id + 1}`;

    debugDoorLabel = new CSS2DObject(labelDiv);
    debugDoorLabel.center.set(0.5, 1.5);
    debugDoorLabel.layers.set(0);

    debugDoorLabel.position.set(location[0], location[1], location[2]);
    world.doorLabels.push(debugDoorLabel);
  }

  return debugDoorLabel;
}

export function createPortal(
  world: WorldData,
  portalData: BaseData,
  id: number,
) {
  const {
    label,
    location,
    // eslint-disable-next-line
    rating, // not used yet
    dogs,
    cats,
    foxes,
    horses,
    happyGhasts,
    ...userData
  } = portalData;

  // Create portal marker
  resetDummyObject();
  dummy.position.set(location[0], location[1] + portalSize / 2, location[2]);
  dummy.updateMatrix();
  world.portalObjects?.setMatrixAt(id, dummy.matrix);

  // Create portal label
  const portalDiv = document.createElement('div');
  portalDiv.classList.add('portalLabel');
  portalDiv.textContent = label;

  const portalLabel = new CSS2DObject(portalDiv);
  portalLabel.center.set(0.5, 1.5);
  portalLabel.userData = userData;
  portalLabel.userData.dogs = dogs > 0;
  portalLabel.userData.cats = cats > 0;
  portalLabel.userData.foxes = foxes > 0;
  portalLabel.userData.horses = horses > 0;
  portalLabel.userData.happyGhasts = happyGhasts > 0;

  world.portalLabels.push(portalLabel);

  portalLabel.position.set(
    location[0],
    location[1] + portalSize / 2,
    location[2],
  );
  portalLabel.layers.set(0);

  return portalLabel;
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
