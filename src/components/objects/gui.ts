import { type Line2 } from 'three/addons/lines/Line2.js';
import { GUI } from 'dat.gui';
import { getMapObjects, toggleDeprecatedDoors } from '../objects/mapObjects';
import { cameraControls, loadCameraState } from '../setup/camera';
import { hideLegend, showLegend, switchLegend } from './legend';
import {
  allColourModeKeys,
  colourModesAvailable,
  activeColourModes,
  allCameraPositionsKeys,
} from './gui.config';

let gui: GUI;

const options = {
  visible: {
    labels: true,
    deprecatedPaths: true,
    legend: true,
  },
  colourMode: activeColourModes[colourModesAvailable[0]],
  cameraPosition: allCameraPositionsKeys.isometric,
};

export function setupGUI() {
  gui = new GUI();
  gui
    .add(options, 'colourMode', Object.values(activeColourModes))
    .name('Colour Mode')
    .onChange(changeColourMode);

  gui
    .add(options, 'cameraPosition', Object.values(allCameraPositionsKeys))
    .name('Camera Position')
    .onChange(changeCameraPosition);

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
}

function toggleLabels() {
  const { labelObjects } = getMapObjects();

  for (const label of labelObjects) {
    label.visible = options.visible.labels;
  }
}

function toggleDeprecatedPaths() {
  const { pathObjects } = getMapObjects();

  for (const path of pathObjects) {
    if (path.userData.deprecated) {
      path.visible = options.visible.deprecatedPaths;
    }
  }

  toggleDeprecatedDoors(options.visible.deprecatedPaths);
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
    for (const level of path.levels) {
      const mesh = level.object as Line2;
      mesh.material = path.userData[materialKey];
    }
  }
}

function changeCameraPosition() {
  switch (options.cameraPosition) {
    case allCameraPositionsKeys.demo:
      toggleCameraPostion(4, true);
      break;

    case allCameraPositionsKeys.isometric:
      toggleCameraPostion(0, false);
      break;

    case allCameraPositionsKeys.overhead:
      toggleCameraPostion(1, false);
      break;

    case allCameraPositionsKeys.facingEast:
      toggleCameraPostion(2, false);
      break;

    case allCameraPositionsKeys.facingNorth:
      toggleCameraPostion(3, false);
      break;

    default:
      toggleCameraPostion(0, false);
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
