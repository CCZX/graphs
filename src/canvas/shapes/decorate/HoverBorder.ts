import { Graphics } from 'pixi.js';
import { HOVER_BORDER } from '../../../constant/color';
import { ShapeDecorateTypeEnum } from '../../../types/shape';
import { BaseShape } from '../BaseShape';
import { AbsDecorate } from './AbsDecorate';

export class HoverBorder extends AbsDecorate {
  type: ShapeDecorateTypeEnum = ShapeDecorateTypeEnum.HoverBorder;

  graphics: Graphics;

  constructor(shape: BaseShape) {
    super(shape);
    this.graphics = new Graphics();
  }

  onActivate() {
    const { width, height } = this.shape.getBounds();

    const graphics = new Graphics();
    this.graphics = graphics;
    this.graphics.lineStyle(2, HOVER_BORDER, 1);
    this.graphics.beginFill(0xfff, 0);
    this.graphics.drawRect(0 - 1, 0 - 1, width + 2, height + 2);

    this.shape.container.addChild(this.graphics);
  }

  onDeactivate() {
    this.shape.container.removeChild(this.graphics);
  }
}
