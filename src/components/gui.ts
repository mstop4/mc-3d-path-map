import { GUI } from 'dat.gui';
import { getMapObjects, loadCameraState } from '../setup';

let gui: GUI;

const options = {
  visible: {
    labels: true,
    deprecatedPaths: true,
    simpleMaterials: false,
  },
  moveCameraIso: () => loadCameraState(0),
  moveCameraOverhead: () => loadCameraState(1),
  moveCameraSideEast: () => loadCameraState(2),
  moveCameraSideNorth: () => loadCameraState(3),
};

export function setupGUI() {
  gui = new GUI();
  const showHideFolder = gui.addFolder('Show/Hide');

  showHideFolder
    .add(options.visible, 'labels')
    .name('Labels')
    .onChange(toggleLabels);
  showHideFolder
    .add(options.visible, 'deprecatedPaths')
    .name('Deprecated Paths')
    .onChange(toggleDeprecatedPaths);
  showHideFolder
    .add(options.visible, 'simpleMaterials')
    .name('Simple Colours')
    .onChange(toggleSimpleMaterials);
  showHideFolder.open();

  const cameraFolder = gui.addFolder('Position Camera');
  cameraFolder.add(options, 'moveCameraIso').name('Isometric');
  cameraFolder.add(options, 'moveCameraOverhead').name('Overhead');
  cameraFolder.add(options, 'moveCameraSideEast').name('Side (Facing East)');
  cameraFolder.add(options, 'moveCameraSideNorth').name('Side (Facing North)');
}

function toggleLabels() {
  const { labelObjects } = getMapObjects();

  for (const label of labelObjects) {
    label.visible = options.visible.labels;
  }
}

function toggleDeprecatedPaths() {
  const { pathObjects, doorObjects } = getMapObjects();

  for (const path of pathObjects) {
    if (path.userData.deprecated) {
      path.visible = options.visible.deprecatedPaths;
    }
  }

  for (const door of doorObjects) {
    if (door.userData.deprecated) {
      door.visible = options.visible.deprecatedPaths;
    }
  }
}

function toggleSimpleMaterials() {
  const { pathObjects } = getMapObjects();

  for (const path of pathObjects) {
    path.material = options.visible.simpleMaterials
      ? path.userData.simpleMaterial
      : path.userData.defaultMaterial;
  }
}
