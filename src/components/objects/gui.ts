import { type Line2 } from 'three/addons/lines/Line2.js';
import { type CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GUI } from 'dat.gui';
import { toggleDeprecatedDoors } from '../objects/mapObjects';
import { cameraControls, loadCameraState } from '../setup/camera';
import { getCurrentWorld } from '../setup/mapScene';
import { hideLegend, showLegend, switchLegend } from './legend';
import {
  allColourModeKeys,
  colourModesAvailable,
  activeColourModes,
  allCameraPositionsKeys,
  allLabelFilters,
  activeLabelFilters,
  labelFiltersAvailable,
} from './gui.config';

let gui: GUI;

const options = {
  visible: {
    labelVisibility: true,
    deprecatedPaths: true,
    legend: true,
  },
  colourMode: activeColourModes[colourModesAvailable[0]],
  cameraPosition: allCameraPositionsKeys.isometric,
  labelFilter: activeLabelFilters[labelFiltersAvailable[0]],
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

  const labelFolder = gui.addFolder('Labels');
  labelFolder
    .add(options.visible, 'labelVisibility')
    .name('Show/Hide')
    .onChange(toggleAllLabelVisibility);
  labelFolder
    .add(options, 'labelFilter', Object.values(activeLabelFilters))
    .name('Highlight')
    .onChange(changeLabelFilter);

  const showHideFolder = gui.addFolder('Show/Hide');
  showHideFolder
    .add(options.visible, 'deprecatedPaths')
    .name('Deprecated Paths')
    .onChange(toggleDeprecatedPaths);
  showHideFolder
    .add(options.visible, 'legend')
    .name('Legend')
    .onChange(toggleLegend);
}

function _toggleLabelVisibility(labels: CSS2DObject[]) {
  for (const label of labels) {
    label.visible = options.visible.labelVisibility;
  }
}

function toggleAllLabelVisibility() {
  const { roomLabels, pathLabels, portalLabels, doorLabels } =
    getCurrentWorld();
  _toggleLabelVisibility(roomLabels);
  _toggleLabelVisibility(pathLabels);
  _toggleLabelVisibility(portalLabels);
  _toggleLabelVisibility(doorLabels);
}

function toggleDeprecatedPaths() {
  const world = getCurrentWorld();
  const { pathObjects } = world;

  for (const path of pathObjects) {
    if (path.userData.deprecated) {
      path.visible = options.visible.deprecatedPaths;
    }
  }

  toggleDeprecatedDoors(world, options.visible.deprecatedPaths);
}

function changeColourMode() {
  const { pathObjects } = getCurrentWorld();
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

function changeLabelFilter() {
  const { portalLabels, roomLabels } = getCurrentWorld();

  for (const label of portalLabels) {
    label.element.className = 'portalLabel';

    switch (options.labelFilter) {
      case allLabelFilters.enderChests:
        if (!label.userData.enderChest)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.cherryTrees:
        if (!label.userData.cherryTree)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.none:
      default:
    }
  }

  for (const label of roomLabels) {
    label.element.className = 'portalLabel';

    switch (options.labelFilter) {
      case allLabelFilters.enderChests:
      case allLabelFilters.cherryTrees:
        label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.none:
      default:
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
