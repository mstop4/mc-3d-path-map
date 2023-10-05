import { Coordinates } from '../../data/data.types';

export type MapBounds = {
  center: Coordinates;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
};
