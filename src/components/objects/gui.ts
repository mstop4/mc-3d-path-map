import { GUI } from 'dat.gui';
import { getMapObjects } from '../objects/mapObjects';
import { cameraControls, loadCameraState } from '../setup/camera';
import { hideLegend, showLegend, switchLegend } from './legend';
import {
  allColourModeKeys,
  colourModesAvailable,
  activeColourModes,
} from './gui.config';

let gui: GUI;

const options = {
  visible: {
    labels: true,
    deprecatedPaths: true,
    legend: true,
  },
  colourMode: activeColourModes[colourModesAvailable[0]],
  moveCameraDemo: () => toggleCameraPostion(4, true),
  moveCameraIso: () => toggleCameraPostion(0, false),
  moveCameraOverhead: () => toggleCameraPostion(1, false),
  moveCameraSideEast: () => toggleCameraPostion(2, false),
  moveCameraSideNorth: () => toggleCameraPostion(3, false),
};

export function setupGUI() {
  gui = new GUI();
  gui
    .add(options, 'colourMode', Object.values(activeColourModes))
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
  cameraFolder.add(options, 'moveCameraDemo').name('Demo');
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
    case allColourModeKeys.default:
      materialKey = 'defaultMaterial';
      switchLegend(0);
      break;

    case allColourModeKeys.cbf:
      materialKey = 'cbfMaterial';
      switchLegend(1);
      break;

    case allColourModeKeys.ext:
      materialKey = 'extSimpleMaterial';
      switchLegend(2);
      break;

    case allColourModeKeys.nat:
      materialKey = 'natSimpleMaterial';
      switchLegend(3);
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

function toggleCameraPostion(index: number, autoRotate: boolean) {
  loadCameraState(index);
  cameraControls.autoRotate = autoRotate;
}
