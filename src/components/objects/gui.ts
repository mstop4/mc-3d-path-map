import { type Line2 } from 'three/addons/lines/Line2.js';
import { type CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GUI } from 'dat.gui';
import { toggleDeprecatedDoors } from '../objects/mapObjects';
import { cameraControls, loadCameraState } from '../setup/camera';
import { getCurrentWorld, getWorld, setCurrentWorld } from '../setup/mapScene';
import { hideLegend, showLegend, switchLegend } from './legend';
import {
  guiWidth,
  allColourModeKeys,
  colourModesAvailable,
  activeColourModes,
  allCameraPositionsKeys,
  allLabelFilters,
  activeLabelFilters,
  allWorldKeys,
} from './gui.config';
import { startingWorldKey } from '../../config/urlParamsHelper';
import { WorldData } from '../setup/mapScene.types';

let gui: GUI;
const sceneSwitchDelay = 1000 / 60;

const options = {
  visible: {
    labelVisibility: true,
    deprecatedPaths: true,
    legend: true,
  },
  currentWorld: allWorldKeys[startingWorldKey],
  colourMode: activeColourModes[colourModesAvailable[0]],
  cameraPosition: allCameraPositionsKeys.isometric,
  labelFilter: activeLabelFilters[startingWorldKey][0],
};

let labelFolder: GUI;

function updateLabelFolder(worldId: string) {
  labelFolder.__controllers[1].remove();

  labelFolder
    .add(options, 'labelFilter', Object.values(activeLabelFilters[worldId]))
    .name('Filter Amenities')
    .onChange(changeLabelFilter);
}

export function setupGUI() {
  gui = new GUI();
  gui.width = guiWidth;

  gui
    .add(options, 'currentWorld', Object.values(allWorldKeys))
    .name('World')
    .onChange(changeWorld);

  gui
    .add(options, 'colourMode', Object.values(activeColourModes))
    .name('Colour Mode')
    .onChange(changeColourMode);

  gui
    .add(options, 'cameraPosition', Object.values(allCameraPositionsKeys))
    .name('Camera Position')
    .onChange(changeCameraPosition);

  labelFolder = gui.addFolder('Labels');
  labelFolder
    .add(options.visible, 'labelVisibility')
    .name('Show/Hide')
    .onChange(toggleAllLabelVisibility);
  labelFolder
    .add(
      options,
      'labelFilter',
      Object.values(activeLabelFilters[startingWorldKey]),
    )
    .name('Filter Amenities')
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

function _toggleLabelVisibility(labels: CSS2DObject[], visibility: boolean) {
  for (const label of labels) {
    label.visible = visibility;
  }
}

function _toggleWorldLabelVisibility(world: WorldData, visibility: boolean) {
  const { roomLabels, pathLabels, portalLabels, doorLabels } = world;

  _toggleLabelVisibility(roomLabels, visibility);
  _toggleLabelVisibility(pathLabels, visibility);
  _toggleLabelVisibility(portalLabels, visibility);
  _toggleLabelVisibility(doorLabels, visibility);
}

function toggleAllLabelVisibility() {
  const world = getCurrentWorld();
  const { labelVisibility } = options.visible;

  _toggleWorldLabelVisibility(world, labelVisibility);
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

      case allLabelFilters.bed:
        if (!label.userData.bed)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.basicWorkstation:
        if (!label.userData.basicWorkstation)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.storage:
        if (!label.userData.storage)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.food:
        if (!label.userData.food)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.lava:
        if (!label.userData.lava)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.smithing:
        if (!label.userData.smithing)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.enchantingTable:
        if (!label.userData.enchantingTable)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.brewingStand:
        if (!label.userData.brewingStand)
          label.element.classList.add('portalLabel-filtered');
        break;

      case allLabelFilters.none:
      default:
    }
  }

  for (const label of roomLabels) {
    label.element.className = 'portalLabel';

    switch (options.labelFilter) {
      case allLabelFilters.none:
        break;
      default:
        label.element.classList.add('portalLabel-filtered');
        break;
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

function changeWorld() {
  // Hide labels from current world
  const currentWorld = getCurrentWorld();
  _toggleWorldLabelVisibility(currentWorld, false);

  const worldId = Object.keys(allWorldKeys).find(
    id => allWorldKeys[id] === options.currentWorld,
  );
  if (worldId !== undefined) {
    // Update Label Filter options to new world's selection
    options.labelFilter = activeLabelFilters[worldId][0];
    updateLabelFolder(worldId);

    // Can't hide labels from previous world on the same frame as switching to new world
    // Delay switching to new world slightly to prevent labels from previous world appearing in new world
    setTimeout(() => {
      setCurrentWorld(worldId);

      // Update state of labels of new world
      const { labelVisibility } = options.visible;
      const newWorld = getWorld(worldId);
      _toggleWorldLabelVisibility(newWorld, labelVisibility);

      // Update new world according to GUI settings
      changeColourMode();
      changeCameraPosition();
      changeLabelFilter();
      toggleDeprecatedPaths();
    }, sceneSwitchDelay);
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
  const world = getCurrentWorld();
  loadCameraState(world, index);
  cameraControls.autoRotate = autoRotate;
}
