import {
  Scene,
  Mesh,
  AmbientLight,
  DirectionalLight,
  PlaneGeometry,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  InstancedMesh,
} from 'three';
import {
  createDoor,
  createPath,
  createPortal,
  createRoom,
  updateInstancedMeshes,
} from '../objects/mapObjects';
import { getMaterial } from './materials';

import {
  baseDoorWidth,
  doorHeight,
  doorThickness,
  portalHeightSegments,
  portalSize,
  portalWidthSegments,
} from '../objects/mapObjects.config';

import {
  CuboidRoomData,
  CylindricalRoomData,
  DoorData,
  PathData,
  BaseData,
  RoomData,
} from '../../data/data.types';
import { WorldData } from './mapScene.types';
import { isCuboidRoomData, isCylindricalRoomData } from '../../data/data.types';

import featureConfig from '../../config/features.json';
import dataManifest from '../../data/manifest.json';

const allWorlds: Record<string, WorldData> = {};
let currentWorldName = 'bunnySnek';

// Define geometry for rooms, portals, and doors
// Materials are gotten at setup-time
const cuboidRoomGeom = new BoxGeometry(1, 1, 1);
const cylindricalRoomGeom = new CylinderGeometry(1, 1, 1, 8, 3);

const portalGeom = new SphereGeometry(
  portalSize,
  portalWidthSegments,
  portalHeightSegments,
);

const doorGeom = new BoxGeometry(doorThickness, doorHeight, baseDoorWidth);

export async function setupWorlds() {
  for (const worldManifest of dataManifest) {
    const { id, paths, rooms, doors, bases } = worldManifest;

    const { default: pathsJson } = await import(paths);
    const { default: roomsJson } = await import(rooms);
    const { default: doorsJson } = await import(doors);
    const { default: basesJson } = await import(bases);

    const pathsData = pathsJson as PathData[];
    const roomsData = roomsJson as RoomData[];
    const doorsData = doorsJson as DoorData[];
    const basesData = basesJson as BaseData[];

    setupWorld(id, pathsData, roomsData, doorsData, basesData);
  }
}

export function getWorld(worldName: string) {
  return allWorlds[worldName];
}

export function getCurrentWorld() {
  return allWorlds[currentWorldName];
}

function setupWorld(
  worldName: string,
  pathsData: PathData[],
  roomsData: RoomData[],
  doorsData: DoorData[],
  basesData: BaseData[],
) {
  // Process map object data
  // Split rooms data into cuboid and cylindrical
  const cuboidRoomsData: CuboidRoomData[] = [];
  const cylindricalRoomsData: CylindricalRoomData[] = [];

  for (const room of roomsData) {
    if (isCuboidRoomData(room)) cuboidRoomsData.push(room);
    else if (isCylindricalRoomData(room)) cylindricalRoomsData.push(room);
  }

  // Sort doors so deprecated ones are at the end of the array
  const sortedDoorsData = doorsData.sort(
    (a, b) => Number(a.deprecated) - Number(b.deprecated),
  );
  const firstDeprecatedDoorIndex = sortedDoorsData.findIndex(
    door => door.deprecated,
  );

  // Count number of doors and how many are not deprecated
  const numAllDoors = doorsData.length;
  const numActiveDoors =
    firstDeprecatedDoorIndex !== -1
      ? firstDeprecatedDoorIndex
      : doorsData.length;

  // Get materials for room, protal, and door geometries
  const roomMaterial = getMaterial('room');
  const portalMaterial = getMaterial('portal');
  const doorMaterial = getMaterial('door');

  // Create world data
  const newWorld: WorldData = {
    mapScene: new Scene(),
    cuboidRoomObjects: new InstancedMesh(
      cuboidRoomGeom,
      roomMaterial,
      cuboidRoomsData.length,
    ),
    cylindricalRoomObjects: new InstancedMesh(
      cylindricalRoomGeom,
      roomMaterial,
      cylindricalRoomsData.length,
    ),
    doorObjects: new InstancedMesh(doorGeom, doorMaterial, doorsData.length),
    portalObjects: new InstancedMesh(
      portalGeom,
      portalMaterial,
      basesData.length,
    ),
    pathObjects: [],
    roomLabels: [],
    doorLabels: [],
    portalLabels: [],
    pathLabels: [],
    numAllDoors,
    numActiveDoors,
    mapBounds: {
      center: [0, 64, 0],
      xMin: 0,
      xMax: 0,
      yMin: 64,
      yMax: 64,
      zMin: 0,
      zMax: 0,
    },
  };

  const { mapScene } = newWorld;

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

  const {
    cuboidRoomObjects,
    cylindricalRoomObjects,
    portalObjects,
    doorObjects,
  } = newWorld;

  mapScene.add(cuboidRoomObjects);
  mapScene.add(cylindricalRoomObjects);
  mapScene.add(portalObjects);
  mapScene.add(doorObjects);

  initMapObjects<CuboidRoomData>(cuboidRoomsData, (object, id) => {
    const roomLabel = createRoom(newWorld, object, id);
    if (roomLabel !== null) {
      mapScene.add(roomLabel);
    }

    const { corners } = object;
    checkMapBounds(newWorld, corners[0][0], corners[1][1], corners[0][2]);
    checkMapBounds(newWorld, corners[1][0], corners[0][1], corners[1][2]);

    return true;
  });

  initMapObjects<CylindricalRoomData>(cylindricalRoomsData, (object, id) => {
    const roomLabel = createRoom(newWorld, object, id);
    if (roomLabel !== null) {
      mapScene.add(roomLabel);
    }

    const { radius, height, bottomCenter } = object;
    checkMapBounds(
      newWorld,
      bottomCenter[0] - radius,
      bottomCenter[1],
      bottomCenter[2] - radius,
    );
    checkMapBounds(
      newWorld,
      bottomCenter[0] + radius,
      bottomCenter[1] + height,
      bottomCenter[2] + radius,
    );

    return true;
  });

  initMapObjects<PathData>(pathsData, (object, id) => {
    const { pathMesh, debugPathLabel } = createPath(newWorld, object, id);
    if (debugPathLabel !== null) {
      mapScene.add(debugPathLabel);
    }

    if (pathMesh !== null) {
      mapScene.add(pathMesh);

      const { points } = object;
      for (const point of points) {
        checkMapBounds(newWorld, ...point);
      }

      return true;
    }
    return false;
  });

  initMapObjects<DoorData>(sortedDoorsData, (object, id) => {
    const debugDoorLabel = createDoor(newWorld, object, id);

    if (debugDoorLabel !== null) {
      mapScene.add(debugDoorLabel);
    }

    const { location } = object;
    checkMapBounds(newWorld, ...location);

    return true;
  });

  initMapObjects<BaseData>(basesData, (object, id) => {
    const portalLabel = createPortal(newWorld, object, id);
    mapScene.add(portalLabel);

    const { location } = object;
    checkMapBounds(newWorld, ...location);

    return true;
  });

  updateInstancedMeshes(newWorld);
  calculateMapCenter(newWorld);

  allWorlds[worldName] = newWorld;
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

export function checkMapBounds(
  world: WorldData,
  x: number,
  y: number,
  z: number,
) {
  const { mapBounds } = world;

  if (x < mapBounds.xMin) mapBounds.xMin = x;
  if (x > mapBounds.xMax) mapBounds.xMax = x;
  if (y < mapBounds.yMin) mapBounds.yMin = y;
  if (y > mapBounds.yMax) mapBounds.yMax = y;
  if (z < mapBounds.zMin) mapBounds.zMin = z;
  if (z > mapBounds.zMax) mapBounds.zMax = z;
}

function calculateMapCenter(world: WorldData) {
  const { mapBounds } = world;

  const { xMin, yMin, xMax, yMax, zMin, zMax } = mapBounds;
  mapBounds.center[0] = (xMin + xMax) / 2;
  mapBounds.center[1] = (yMin + yMax) / 2;
  mapBounds.center[2] = (zMin + zMax) / 2;
}
