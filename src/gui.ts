import { GUI } from 'dat.gui';
import { getMapObjects } from './setup';

let gui: GUI;

const options = {
  visible: {
    labels: true,
    deprecatedPaths: true,
  },
};

export function setupGUI() {
  gui = new GUI();
  gui.add(options.visible, 'labels').onChange(toggleLabels);
  gui.add(options.visible, 'deprecatedPaths').onChange(toggleDeprecatedPaths);
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
