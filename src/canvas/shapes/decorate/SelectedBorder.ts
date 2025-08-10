import { Graphics } from 'pixi.js';
import { HOVER_BORDER } from '../../../constant/color';
import { ShapeDecorateTypeEnum, ShapeTypeEnum } from '../../../types/shape';
import { BaseShape } from '../BaseShape';
import { AbsDecorate } from './AbsDecorate';

export class SelectedBorder extends AbsDecorate {
  type: ShapeDecorateTypeEnum = ShapeDecorateTypeEnum.SelectedBorder;

  graphics: Graphics;

  constructor(shape: BaseShape) {
    super(shape);
    this.graphics = new Graphics();
  }

  onActivate() {
    console.log('SelectedBorder onActivate');
    const { width, height } = this.shape.getBounds();

    const graphics = new Graphics();
    this.graphics = graphics;
    this.graphics.lineStyle(1, HOVER_BORDER, 1);
    this.graphics.beginFill(0xfff, 0);
    this.graphics.drawRect(0 - 0.5, 0 - 0.5, width + 0.5, height + 0.5);

    this.graphics.beginFill(HOVER_BORDER, 1);
    this.graphics.drawCircle(0, 0, 2);
    this.graphics.drawCircle(0 + width, 0, 2);
    this.graphics.drawCircle(0 + width, 0 + height, 2);
    this.graphics.drawCircle(0, 0 + height, 2);

    this.shape.container.addChild(this.graphics);
  }

  onDeactivate() {
    console.log('SelectedBorder onDeactivate');
    this.shape.container.removeChild(this.graphics);
  }
}
