import { Graphics } from 'pixi.js';
import { HOVER_BORDER } from '../../../constant/color';
import { ShapeDecorateTypeEnum } from '../../../types/shape';
import { BaseShape } from '../BaseShape';
import { AbsDecorate } from './AbsDecorate';

const HANDLE_RADIUS = 5;

export class SelectedBorder extends AbsDecorate {
  type: ShapeDecorateTypeEnum = ShapeDecorateTypeEnum.SelectedBorder;

  graphics: Graphics;

  constructor(shape: BaseShape) {
    super(shape);
    this.graphics = new Graphics();
  }

  private draw() {
    const { width, height } = this.shape.getBounds();

    this.graphics.clear();
    this.graphics.lineStyle(1, HOVER_BORDER, 1);
    this.graphics.beginFill(0xfff, 0);
    this.graphics.drawRect(0 - 0.5, 0 - 0.5, width + 0.5, height + 0.5);

    this.graphics.beginFill(0xffffff, 1);
    this.graphics.lineStyle(1, HOVER_BORDER, 1);
    this.graphics.drawCircle(0, 0, HANDLE_RADIUS);
    this.graphics.drawCircle(0 + width, 0, HANDLE_RADIUS);
    this.graphics.drawCircle(0 + width, 0 + height, HANDLE_RADIUS);
    this.graphics.drawCircle(0, 0 + height, HANDLE_RADIUS);
  }

  onActivate() {
    this.draw();
    this.shape.container.addChild(this.graphics);
  }

  refresh() {
    this.draw();
  }

  onDeactivate() {
    this.shape.container.removeChild(this.graphics);
  }
}
