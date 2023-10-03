import * as THREE from 'three';
import {
  createDoor,
  createPath,
  createPortal,
  createRoom,
} from '../objects/mapObjects';
import { getMaterial } from './materials';

import { type CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { DoorData, PathData, PortalData, RoomData } from '../../types';

import featureConfig from '../../config/features.json';
import pathsData from '../../data/paths';
import roomsData from '../../data/rooms';
import doorsData from '../../data/doors';
import portalsData from '../../data/portals';

export let mapScene: THREE.Scene;
const roomObjects: THREE.Mesh[] = [];
const doorObjects: THREE.Mesh[] = [];
const portalObjects: THREE.Mesh[] = [];
const pathObjects: THREE.Mesh[] = [];
const labelObjects: CSS2DObject[] = [];

export function setupMapScene() {
  mapScene = new THREE.Scene();

  // Set up lights
  const light = new THREE.AmbientLight(0xffffff); // soft white light
  mapScene.add(light);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.x = 1;
  directionalLight.position.y = 1;
  directionalLight.position.z = 1;
  mapScene.add(directionalLight);

  // Lava
  if (featureConfig.lavaGeometry) {
    const lavaGeom = new THREE.PlaneGeometry(1500, 1500);
    const lavaMesh = new THREE.Mesh(lavaGeom, getMaterial('lava'));
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

    return incrementId;
  });

  initMapObjects<PathData>(pathsData, (object, id) => {
    const pathMesh = createPath(object, id);
    if (pathMesh !== null) {
      pathObjects.push(pathMesh);
      mapScene.add(pathMesh);
      return true;
    }
    return false;
  });

  initMapObjects<DoorData>(doorsData, (object, id) => {
    const doorMesh = createDoor(object, id);
    doorObjects.push(doorMesh);
    mapScene.add(doorMesh);
    return true;
  });

  initMapObjects<PortalData>(portalsData, (object, id) => {
    const { portalMesh, portalLabel } = createPortal(object, id);
    portalObjects.push(portalMesh);
    mapScene.add(portalMesh);

    if (portalLabel !== null) {
      labelObjects.push(portalLabel);
    }

    return true;
  });
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

export function getMapObjects() {
  return {
    roomObjects,
    pathObjects,
    doorObjects,
    portalObjects,
    labelObjects,
  };
}
