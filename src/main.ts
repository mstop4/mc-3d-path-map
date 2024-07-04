import { Raycaster, Vector2 } from 'three';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';
import {
  camera,
  cameraControls,
  loadCameraState,
  setupCamera,
  setupCameraControls,
} from './components/setup/camera';
import {
  labelRenderer,
  renderer,
  setupRenderers,
} from './components/setup/renderer';
import { initMaterials } from './components/setup/materials';
import { getCurrentWorld, setupWorlds } from './components/setup/mapScene';
import { addStatsPanel, updateStatsPanel } from './components/objects/stats';
import { setupGUI } from './components/objects/gui';
import { setupLegend } from './components/objects/legend';

import featureConfig from './config/features.json';
import { viewScale } from './components/setup/camera.config';

let viewHelper: ViewHelper;
let raycaster: Raycaster;
let pointer: Vector2;

async function setup() {
  initMaterials();
  setupCamera();
  setupRenderers();
  if (featureConfig.raycasterOn) {
    raycaster = new Raycaster();
    pointer = new Vector2();
  }

  await setupWorlds();
  const currentWorld = getCurrentWorld();
  viewHelper = new ViewHelper(camera, renderer.domElement);

  setupLegend();
  setupCameraControls(renderer);
  loadCameraState(currentWorld, 0);

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
  const { mapScene } = getCurrentWorld();

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

  if (import.meta.env.DEV) {
    updateStatsPanel();
  }

  labelRenderer.render(mapScene, camera);
  viewHelper.render(renderer);
}

await setup();
render();
