import { Graphics } from 'pixi.js';
import { ShapeTypeEnum } from '../../types/shape';
import { BaseShape } from './BaseShape';

export class Circle extends BaseShape<Graphics> {
  type: ShapeTypeEnum = ShapeTypeEnum.Circle;

  constructor(id: string) {
    super(id, new Graphics());

    // this.graphics.beginFill(0x000);
    // this.graphics.drawCircle(0, 0, 10);
    // this.graphics.endFill();

    this.graphics.interactive = true;
  }
}
