import { ShapeData, ShapeTypeEnum } from '../types/shape';

export const MOCK_SHAPE_DATA: ShapeData[] = [
  {
    id: 'circle-1',
    type: ShapeTypeEnum.Circle,
    properties: {
      base: { x: 100, y: 100, width: 100, height: 100 },
      fill: { color: 0x0000ff, alpha: 1 },
    },
  },

  {
    id: 'circle-2',
    type: ShapeTypeEnum.Circle,
    properties: {
      base: { x: 500, y: 500, width: 100, height: 100 },
      fill: { color: 0x1ae70f, alpha: 1 },
    },
  },

  {
    id: 'rectangle-2',
    type: ShapeTypeEnum.Rectangle,
    properties: {
      base: { x: 0, y: 0, width: 100, height: 100 },
      fill: { color: 0x1ae70f, alpha: 1 },
    },
  },
  {
    id: 'rectangle-2',
    type: ShapeTypeEnum.Rectangle,
    properties: {
      base: { x: 100, y: 300, width: 100, height: 100 },
      fill: { color: 0x1ae70f, alpha: 1 },
    },
  },
];
