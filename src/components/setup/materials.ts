import { type Material, MeshStandardMaterial } from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import materialDefs from '../../config/materials';

const materials: Record<string, Material | LineMaterial> = {};

export function initMaterials() {
  const { mesh, line } = materialDefs;

  // Mesh Materials
  for (const materialName in mesh) {
    const materialDef = mesh[materialName];
    materials[materialName] = new MeshStandardMaterial(materialDef);
  }

  // Line Materials
  for (const materialName in line) {
    const materialDef = line[materialName];

    // Standard Line
    materials[materialName] = new LineMaterial(materialDef);

    // Deprecated Line
    materials[`${materialName}_deprecated`] = new LineMaterial({
      ...materialDef,
      opacity: 0.5,
      transparent: true,
      dashed: true,
    });
  }
}

export function getMaterial(name: string): Material {
  return materials[name] ?? null;
}
