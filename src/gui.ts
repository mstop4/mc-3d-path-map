import { GUI } from 'dat.gui';
import { getMapObjects } from './setup';

let gui: GUI;

const options = {
  labelsVisible: true,
};

export function setupGUI() {
  gui = new GUI();
  gui.add(options, 'labelsVisible').onChange(toggleLabels);
}

function toggleLabels() {
  const { labelObjects } = getMapObjects();

  for (const label of labelObjects) {
    label.visible = options.labelsVisible;
  }
}
