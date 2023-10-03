import { DoubleSide, type MeshStandardMaterialParameters } from 'three';
import { LineMaterialParameters } from 'three/addons/lines/LineMaterial.js';

import { defaultPathProps, simplePathProps } from './pathProps';

type LineMaterialDefinitions = Record<string, LineMaterialParameters>;

export type MaterialDefinitions = {
  mesh: Record<string, MeshStandardMaterialParameters>;
  line: LineMaterialDefinitions;
};

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
