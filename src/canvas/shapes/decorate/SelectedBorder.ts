import { Graphics } from 'pixi.js';
import { HOVER_BORDER } from '../../../constant/color';
import { ShapeDecorateTypeEnum, ShapePropertyEnum } from '../../../types/shape';
import type { StrokePropertyValue } from '../../../types/shape';
import { BaseShape } from '../BaseShape';
import { AbsDecorate } from './AbsDecorate';

const HANDLE_RADIUS = 5;
const BORDER_PADDING = 2;

export class SelectedBorder extends AbsDecorate {
  type: ShapeDecorateTypeEnum = ShapeDecorateTypeEnum.SelectedBorder;

  graphics: Graphics;

  constructor(shape: BaseShape) {
    super(shape);
    this.graphics = new Graphics();
  }

  private getStrokeWidth(): number {
    const stroke = this.shape.getProperty<any>(ShapePropertyEnum.Stroke)
      ?.get() as StrokePropertyValue;
    return stroke?.width || 0;
  }

  private draw() {
    const { width, height } = this.shape.getBounds();
    const strokeWidth = this.getStrokeWidth();
    // 让选中框绘制在描边外侧
    const offset = strokeWidth / 2 + BORDER_PADDING;

    this.graphics.clear();
    this.graphics.lineStyle(1, HOVER_BORDER, 1);
    this.graphics.beginFill(0xfff, 0);
    this.graphics.drawRect(
      0 - 0.5 - offset,
      0 - 0.5 - offset,
      width + 0.5 + offset * 2,
      height + 0.5 + offset * 2,
    );

    this.graphics.beginFill(0xffffff, 1);
    this.graphics.lineStyle(1, HOVER_BORDER, 1);
    this.graphics.drawCircle(0 - offset, 0 - offset, HANDLE_RADIUS);
    this.graphics.drawCircle(0 + width + offset, 0 - offset, HANDLE_RADIUS);
    this.graphics.drawCircle(0 + width + offset, 0 + height + offset, HANDLE_RADIUS);
    this.graphics.drawCircle(0 - offset, 0 + height + offset, HANDLE_RADIUS);
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
