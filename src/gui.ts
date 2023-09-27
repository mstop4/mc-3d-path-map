import { GUI } from 'dat.gui';
import { getMapObjects, resetCamera } from './setup';

let gui: GUI;

const options = {
  visible: {
    labels: true,
    deprecatedPaths: true,
    simpleMaterials: false,
  },
  resetCamera,
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
  gui.add(options, 'resetCamera').name('Reset Camera');
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
