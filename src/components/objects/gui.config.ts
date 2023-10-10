export const allColourModeKeys: Record<string, string> = {
  default: 'Full',
  cbf: 'Colourblind-friendly',
  ext: 'Interior/Exterior',
  nat: 'Natural/Artificial',
};

export const allCameraPositionsKeys: Record<string, string> = {
  demo: 'Demo',
  isometric: 'Isometric',
  overhead: 'Overhead',
  facingEast: 'Facing East',
  facingNorth: 'Facing North',
};

export const colourModesAvailable = ['default', 'cbf', 'ext', 'nat'];

export const activeColourModes = colourModesAvailable.reduce(
  (obj: Record<string, string>, key) => {
    obj[key] = allColourModeKeys[key];
    return obj;
  },
  {},
);
