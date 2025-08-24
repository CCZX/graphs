import { Graphics } from 'pixi.js';
import { ShapeTypeEnum } from '../../types/shape';
import { BaseShape } from './BaseShape';

export class Rectangle extends BaseShape<Graphics> {
  type: ShapeTypeEnum = ShapeTypeEnum.Rectangle;

  constructor(id: string) {
    super(id, new Graphics());
  }
}
