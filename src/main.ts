import * as THREE from 'three';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';
import {
  camera,
  cameraControls,
  setupCamera,
  setupCameraControls,
  viewScale,
} from './components/setup/camera';
import {
  labelRenderer,
  renderer,
  setupRenderers,
} from './components/setup/renderer';
import { initMaterials } from './components/setup/materials';
import { mapScene, setupMapScene } from './components/setup/mapScene';
import { addStatsPanel, updateStatsPanel } from './components/objects/stats';
import { setupGUI } from './components/objects/gui';
import { setupLegend } from './components/objects/legend';

import featureConfig from './config/features.json';

let viewHelper: ViewHelper;
let raycaster: THREE.Raycaster;
let pointer: THREE.Vector2;

function setup() {
  initMaterials();
  setupCamera();
  setupRenderers();
  if (featureConfig.raycasterOn) {
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
  }

  setupMapScene();
  viewHelper = new ViewHelper(camera, renderer.domElement);

  setupLegend();
  setupCameraControls(renderer);
  if (import.meta.env.DEV) {
    addStatsPanel();
  }

  if (featureConfig.raycasterOn) {
    window.addEventListener('pointermove', onPointerDown);
  }
  window.addEventListener('resize', onWindowResize);

  setupGUI();
}

function onPointerDown(event: MouseEvent) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
}

function onWindowResize() {
  camera.left = -window.innerWidth / viewScale;
  camera.right = window.innerWidth / viewScale;
  camera.top = window.innerHeight / viewScale;
  camera.bottom = -window.innerHeight / viewScale;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  requestAnimationFrame(render);

  if (featureConfig.raycasterOn) {
    raycaster.setFromCamera(pointer, camera);
    const hitObjects = raycaster.intersectObjects(mapScene.children, true);
    if (hitObjects.length > 0) {
      console.log(hitObjects[0].object.name);
    }
  }
  cameraControls.update();
  renderer.clear();
  renderer.render(mapScene, camera);
  labelRenderer.render(mapScene, camera);
  viewHelper.render(renderer);
  if (import.meta.env.DEV) {
    updateStatsPanel();
  }
}

setup();
render();
