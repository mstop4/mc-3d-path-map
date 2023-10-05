import { DoubleSide } from 'three';
import { defaultPathProps, simplePathProps } from './pathProps';
import {
  LineMaterialDefinitions,
  MaterialDefinitions,
} from './materials.types';

const materials: MaterialDefinitions = {
  mesh: {
    room: {
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
    },
    door: {
      color: 0xe0a060,
      opacity: 0.75,
      transparent: true,
    },
    portal: {
      color: 0xc000ff,
    },
    lava: {
      color: 0xffe0c0,
      opacity: 0.5,
      transparent: true,
      side: DoubleSide,
    },
  },
  line: (() => {
    const lineMaterials: LineMaterialDefinitions = {};

    // Parse default path palette
    for (const pathKey in defaultPathProps) {
      const colourInt = parseInt(defaultPathProps[pathKey].colour, 16);
      lineMaterials[pathKey] = { color: colourInt, linewidth: 0.0025 };
    }

    // Parse simple path palette
    for (const pathKey in simplePathProps) {
      const colourInt = parseInt(simplePathProps[pathKey].colour, 16);
      lineMaterials[pathKey] = { color: colourInt, linewidth: 0.0025 };
    }

    return lineMaterials;
  })(),
};

export default materials;
