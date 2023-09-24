import * as THREE from 'three';
import { LineMaterialParameters } from 'three/addons/lines/LineMaterial.js';

export type MaterialDefinitions = {
  mesh: Record<string, THREE.MeshStandardMaterialParameters>;
  line: Record<string, LineMaterialParameters>;
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
      side: THREE.DoubleSide,
    },
  },
  line: {
    ogTunnel: { color: 0x8090ff, linewidth: 0.0025 }, // Overground Tunnel
    ugTunnel: { color: 0x80b0d0, linewidth: 0.0025 }, // Underground Tunnel
    cBridge: { color: 0x80ff80, linewidth: 0.0025 }, // Covered Bridge
    oBridge: { color: 0xffd040, linewidth: 0.0025 }, // Open Bridge
    exPath: { color: 0xc00000, linewidth: 0.0025 }, // External Path
    nCave: { color: 0xc06000, linewidth: 0.0025 }, // Natural Cave
    ladder: { color: 0xffffff, linewidth: 0.0025 }, // Ladder
    bastion: { color: 0x404080, linewidth: 0.0025 }, // Bastion
  },
};

export default materials;
