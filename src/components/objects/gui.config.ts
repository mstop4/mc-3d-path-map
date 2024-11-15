import dataManifest from '../../data/manifest.json';

export const guiWidth = 250;

export const allWorldKeys: Record<string, string> = {};
for (const world of dataManifest) {
  allWorldKeys[world.id] = world.name;
}

export const allColourModeKeys: Record<string, string> = {
  default: 'Full',
  cbf: 'Colourblind-friendly',
  ext: 'Interior/Exterior',
  nat: 'Natural/Artificial',
};

export const allLabelFilters: Record<string, string> = {
  none: 'None',
  bed: 'Bed',
  basicWorkstation: 'Crafting + Smelting',
  storage: 'Storage',
  food: 'Food Supply',
  lava: 'Lava Source',
  smithing: 'Smithing',
  enchantingTable: 'Enchanting',
  brewingStand: 'Brewing',
  enderChests: 'Ender Chest',
  cherryTrees: 'Cherry Trees',
  dogs: 'Tamed Wolves',
  cats: 'Tamed Cats',
};

export const allCameraPositionsKeys: Record<string, string> = {
  demo: 'Demo',
  isometric: 'Isometric',
  overhead: 'Overhead',
  facingEast: 'Facing East',
  facingNorth: 'Facing North',
};

export const colourModesAvailable = ['default', 'cbf', 'ext', 'nat'];
const labelFiltersAvailable: Record<string, string[]> = {
  bunnySnek: ['none', 'enderChests', 'cherryTrees'],
  chocolateBnuuy: [
    'none',
    'bed',
    'basicWorkstation',
    'storage',
    'food',
    'lava',
    'smithing',
    'enchantingTable',
    'brewingStand',
    'enderChests',
    'cherryTrees',
    'dogs',
  ],
};

export const activeColourModes = colourModesAvailable.reduce(
  (obj: Record<string, string>, key) => {
    obj[key] = allColourModeKeys[key];
    return obj;
  },
  {},
);

export const activeLabelFilters = Object.fromEntries(
  Object.entries(labelFiltersAvailable).map(([worldId, labels]) => [
    worldId,
    labels.map(label => allLabelFilters[label]),
  ]),
);
