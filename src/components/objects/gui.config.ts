import dataManifest from '../../data/manifest.json';

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
  basicWorkstation: 'Crafting Table + Furnace',
  storage: 'Storage',
  food: 'Food Supply',
  lava: 'Lava Source',
  enchantingTable: 'Enchanting',
  brewingStand: 'Brewing',
  enderChests: 'Ender Chests',
  cherryTrees: 'Cherry Trees',
};

export const allCameraPositionsKeys: Record<string, string> = {
  demo: 'Demo',
  isometric: 'Isometric',
  overhead: 'Overhead',
  facingEast: 'Facing East',
  facingNorth: 'Facing North',
};

export const colourModesAvailable = ['default', 'cbf', 'ext', 'nat'];
export const labelFiltersAvailable = [
  'none',
  'bed',
  'basicWorkstation',
  'storage',
  'food',
  'lava',
  'enchantingTable',
  'brewingStand',
  'enderChests',
  'cherryTrees',
];

export const activeColourModes = colourModesAvailable.reduce(
  (obj: Record<string, string>, key) => {
    obj[key] = allColourModeKeys[key];
    return obj;
  },
  {},
);

export const activeLabelFilters = labelFiltersAvailable.reduce(
  (obj: Record<string, string>, key) => {
    obj[key] = allLabelFilters[key];
    return obj;
  },
  {},
);
