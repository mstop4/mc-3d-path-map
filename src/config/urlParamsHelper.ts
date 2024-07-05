import dataManifest from '../data/manifest.json';

const defaultWorldKey = 'bunnySnek';
export const startingWorldKey = getStartingWorld();

function getStartingWorld() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('map')) {
    const mapParam = urlParams.get('map');
    const worldKeys = dataManifest.map(world => world.id);
    if (mapParam !== null && worldKeys.includes(mapParam)) {
      return mapParam;
    }
    return defaultWorldKey;
  }

  return defaultWorldKey;
}
