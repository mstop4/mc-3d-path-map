import {
  Scene,
  Mesh,
  AmbientLight,
  DirectionalLight,
  PlaneGeometry,
} from 'three';
import {
  createDoor,
  createPath,
  createPortal,
  createRoom,
} from '../objects/mapObjects';
import { getMaterial } from './materials';

import { type CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  Coordinates,
  DoorData,
  MapBounds,
  PathData,
  PortalData,
  RoomData,
} from '../../types';

import featureConfig from '../../config/features.json';
import pathsData from '../../data/paths';
import roomsData from '../../data/rooms';
import doorsData from '../../data/doors';
import portalsData from '../../data/portals';

export let mapScene: Scene;
const roomObjects: Mesh[] = [];
const doorObjects: Mesh[] = [];
const portalObjects: Mesh[] = [];
const pathObjects: Mesh[] = [];
const labelObjects: CSS2DObject[] = [];
const mapBounds: MapBounds = {
  center: [0, 64, 0],
  xMin: 0,
  xMax: 0,
  yMin: 64,
  yMax: 64,
  zMin: 0,
  zMax: 0,
};

export function setupMapScene() {
  mapScene = new Scene();

  // Set up lights
  const light = new AmbientLight(0xffffff); // soft white light
  mapScene.add(light);
  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 1;
  mapScene.add(directionalLight);

  // Lava
  if (featureConfig.lavaGeometry) {
    const lavaGeom = new PlaneGeometry(1500, 1500);
    const lavaMesh = new Mesh(lavaGeom, getMaterial('lava'));
    lavaMesh.rotation.x = Math.PI / 2;
    lavaMesh.position.y = 32;
    mapScene.add(lavaMesh);
  }

  // Add map elements
  initMapObjects<RoomData>(roomsData, (object, id) => {
    const { roomMesh, roomLabel } = createRoom(object, id);
    let incrementId = false;

    if (roomMesh !== null) {
      roomObjects.push(roomMesh);
      mapScene.add(roomMesh);
      incrementId = true;
    }

    if (roomLabel !== null) {
      labelObjects.push(roomLabel);
    }

    if (object.shape === 'cuboid') {
      const { corners } = object;
      checkMapBounds([corners[0][0], corners[1][1], corners[0][2]]);
      checkMapBounds([corners[1][0], corners[0][1], corners[1][2]]);
    } else if (object.shape === 'cylinder') {
      const { radius, height, bottomCenter } = object;
      checkMapBounds([
        bottomCenter[0] - radius,
        bottomCenter[1],
        bottomCenter[2] - radius,
      ]);
      checkMapBounds([
        bottomCenter[0] + radius,
        bottomCenter[1] + height,
        bottomCenter[2] + radius,
      ]);
    }

    return incrementId;
  });

  initMapObjects<PathData>(pathsData, (object, id) => {
    const pathMesh = createPath(object, id);
    if (pathMesh !== null) {
      pathObjects.push(pathMesh);
      mapScene.add(pathMesh);

      const { points } = object;
      for (const point of points) {
        checkMapBounds(point);
      }

      return true;
    }
    return false;
  });

  initMapObjects<DoorData>(doorsData, (object, id) => {
    const doorMesh = createDoor(object, id);
    doorObjects.push(doorMesh);
    mapScene.add(doorMesh);

    const { location } = object;
    checkMapBounds(location);

    return true;
  });

  initMapObjects<PortalData>(portalsData, (object, id) => {
    const { portalMesh, portalLabel } = createPortal(object, id);
    portalObjects.push(portalMesh);
    mapScene.add(portalMesh);

    const { location } = object;
    checkMapBounds(location);

    if (portalLabel !== null) {
      labelObjects.push(portalLabel);
    }

    return true;
  });

  calculateMapCenter();
}

function initMapObjects<T>(
  data: T[],
  createObjFunc: (object: T, id: number) => boolean,
) {
  let id = 0;

  for (const object of data) {
    const incrementId = createObjFunc(object, id);
    if (incrementId) id++;
  }
}

function checkMapBounds(point: Coordinates) {
  if (point[0] < mapBounds.xMin) mapBounds.xMin = point[0];
  if (point[0] > mapBounds.xMax) mapBounds.xMax = point[0];
  if (point[1] < mapBounds.yMin) mapBounds.yMin = point[1];
  if (point[1] > mapBounds.yMax) mapBounds.yMax = point[1];
  if (point[2] < mapBounds.zMin) mapBounds.zMin = point[2];
  if (point[2] > mapBounds.zMax) mapBounds.zMax = point[2];
}

function calculateMapCenter() {
  const { xMin, yMin, xMax, yMax, zMin, zMax } = mapBounds;
  mapBounds.center[0] = (xMin + xMax) / 2;
  mapBounds.center[1] = (yMin + yMax) / 2;
  mapBounds.center[2] = (zMin + zMax) / 2;
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

export function getMapBounds() {
  return mapBounds;
}
