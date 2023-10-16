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
  setupInstancedMapObjects,
  updateInstancedMeshes,
} from '../objects/mapObjects';
import { getMaterial } from './materials';

import {
  CuboidRoomData,
  CylindricalRoomData,
  DoorData,
  PathData,
  PortalData,
  RoomData,
} from '../../data/data.types';
import { MapBounds } from './mapScene.types';
import { isCuboidRoomData, isCylindricalRoomData } from '../../data/data.types';

import featureConfig from '../../config/features.json';
import pathsJson from '../../data/paths.json';
import roomsJson from '../../data/rooms.json';
import doorsJson from '../../data/doors.json';
import portalsJson from '../../data/portals.json';

const pathsData = pathsJson as PathData[];
const roomsData = roomsJson as RoomData[];
const doorsData = doorsJson as DoorData[];
const portalsData = portalsJson as PortalData[];

export let mapScene: Scene;
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

  // Split rooms data into cuboid and cylindircal
  const cuboidRoomsData = [];
  const cylindricalRoomsData = [];

  for (const room of roomsData) {
    if (isCuboidRoomData(room)) cuboidRoomsData.push(room);
    else if (isCylindricalRoomData(room)) cylindricalRoomsData.push(room);
  }

  // Sort doors so deprecated ones are at the end of the array
  const sortedDoorsData = doorsData.sort(
    (a, b) => Number(a.deprecated) - Number(b.deprecated),
  );

  // Add map elements
  const {
    cuboidRoomObjects,
    cylindricalRoomObjects,
    portalObjects,
    doorObjects,
  } = setupInstancedMapObjects(
    cuboidRoomsData,
    cylindricalRoomsData,
    portalsData,
    sortedDoorsData,
  );
  mapScene.add(cuboidRoomObjects);
  mapScene.add(cylindricalRoomObjects);
  mapScene.add(portalObjects);
  mapScene.add(doorObjects);

  initMapObjects<CuboidRoomData>(cuboidRoomsData, (object, id) => {
    const roomLabel = createRoom(object, id);
    if (roomLabel !== null) {
      mapScene.add(roomLabel);
    }

    const { corners } = object;
    checkMapBounds(corners[0][0], corners[1][1], corners[0][2]);
    checkMapBounds(corners[1][0], corners[0][1], corners[1][2]);

    return true;
  });

  initMapObjects<CylindricalRoomData>(cylindricalRoomsData, (object, id) => {
    const roomLabel = createRoom(object, id);
    if (roomLabel !== null) {
      mapScene.add(roomLabel);
    }

    const { radius, height, bottomCenter } = object;
    checkMapBounds(
      bottomCenter[0] - radius,
      bottomCenter[1],
      bottomCenter[2] - radius,
    );
    checkMapBounds(
      bottomCenter[0] + radius,
      bottomCenter[1] + height,
      bottomCenter[2] + radius,
    );

    return true;
  });

  initMapObjects<PathData>(pathsData, (object, id) => {
    const { pathMesh, debugPathLabel } = createPath(object, id);
    if (debugPathLabel !== null) {
      mapScene.add(debugPathLabel);
    }

    if (pathMesh !== null) {
      mapScene.add(pathMesh);

      const { points } = object;
      for (const point of points) {
        checkMapBounds(...point);
      }

      return true;
    }
    return false;
  });

  initMapObjects<DoorData>(sortedDoorsData, (object, id) => {
    const debugDoorLabel = createDoor(object, id);

    if (debugDoorLabel !== null) {
      mapScene.add(debugDoorLabel);
    }

    const { location } = object;
    checkMapBounds(...location);

    return true;
  });

  initMapObjects<PortalData>(portalsData, (object, id) => {
    const portalLabel = createPortal(object, id);
    mapScene.add(portalLabel);

    const { location } = object;
    checkMapBounds(...location);

    return true;
  });

  updateInstancedMeshes();
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

export function checkMapBounds(x: number, y: number, z: number) {
  if (x < mapBounds.xMin) mapBounds.xMin = x;
  if (x > mapBounds.xMax) mapBounds.xMax = x;
  if (y < mapBounds.yMin) mapBounds.yMin = y;
  if (y > mapBounds.yMax) mapBounds.yMax = y;
  if (z < mapBounds.zMin) mapBounds.zMin = z;
  if (z > mapBounds.zMax) mapBounds.zMax = z;
}

function calculateMapCenter() {
  const { xMin, yMin, xMax, yMax, zMin, zMax } = mapBounds;
  mapBounds.center[0] = (xMin + xMax) / 2;
  mapBounds.center[1] = (yMin + yMax) / 2;
  mapBounds.center[2] = (zMin + zMax) / 2;
}

export function getMapBounds() {
  return mapBounds;
}
