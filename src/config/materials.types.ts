import { type MeshStandardMaterialParameters } from 'three';
import { LineMaterialParameters } from 'three/addons/lines/LineMaterial.js';

export type LineMaterialDefinitions = Record<string, LineMaterialParameters>;

export type MaterialDefinitions = {
  mesh: Record<string, MeshStandardMaterialParameters>;
  line: LineMaterialDefinitions;
};
