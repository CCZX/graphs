import { Graphics } from 'pixi.js';
import { ShapeTypeEnum } from '../../types/shape';
import { BaseShape } from './BaseShape';

export class Rectangle extends BaseShape<Graphics> {
  type: ShapeTypeEnum = ShapeTypeEnum.Rectangle;

  constructor(id: string) {
    super(id, new Graphics());

    this.graphics.beginFill(0x000);
    this.graphics.drawRect(100, 100, 200, 200);
    this.graphics.endFill();
  }
}
