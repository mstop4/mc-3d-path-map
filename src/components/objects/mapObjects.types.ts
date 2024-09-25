import { LOD } from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export type PathObject = {
  pathMesh: null | LOD;
  debugPathLabel: null | CSS2DObject;
};
