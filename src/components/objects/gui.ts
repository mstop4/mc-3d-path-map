import { GUI } from 'dat.gui';
import { getMapObjects } from '../setup/mapScene';
import { loadCameraState } from '../setup/camera';
import { hideLegend, showLegend, switchLegend } from './legend';

let gui: GUI;

const colourModeKeys = {
  default: 'Full',
  ext: 'Interior/Exterior',
  nat: 'Natural/Artificial',
};

const options = {
  visible: {
    labels: true,
    deprecatedPaths: true,
    legend: true,
  },
  colourMode: colourModeKeys.default,
  moveCameraIso: () => loadCameraState(0),
  moveCameraOverhead: () => loadCameraState(1),
  moveCameraSideEast: () => loadCameraState(2),
  moveCameraSideNorth: () => loadCameraState(3),
};

export function setupGUI() {
  gui = new GUI();
  gui
    .add(options, 'colourMode', Object.values(colourModeKeys))
    .name('Colour Mode')
    .onChange(changeColourMode);

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
    .add(options.visible, 'legend')
    .name('Legend')
    .onChange(toggleLegend);

  const cameraFolder = gui.addFolder('Position Camera');
  cameraFolder.add(options, 'moveCameraIso').name('Isometric');
  cameraFolder.add(options, 'moveCameraOverhead').name('Overhead');
  cameraFolder.add(options, 'moveCameraSideEast').name('Facing East');
  cameraFolder.add(options, 'moveCameraSideNorth').name('Facing North');
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

function changeColourMode() {
  const { pathObjects } = getMapObjects();
  let materialKey;

  switch (options.colourMode) {
    case colourModeKeys.default:
      materialKey = 'defaultMaterial';
      switchLegend(0);
      break;

    case colourModeKeys.ext:
      materialKey = 'extSimpleMaterial';
      switchLegend(1);
      break;

    case colourModeKeys.nat:
      materialKey = 'natSimpleMaterial';
      switchLegend(2);
      break;

    default:
      materialKey = 'defaultMaterial';
      switchLegend(0);
  }

  for (const path of pathObjects) {
    path.material = path.userData[materialKey];
  }
}

function toggleLegend() {
  if (options.visible.legend) {
    showLegend();
  } else {
    hideLegend();
  }
}