import { AbsProperty } from './AbsProperty';
import { FillProperty as IFillProperty, ShapeTypeEnum } from '../../../types/shape';
import { BaseShape } from '../BaseShape';
import { Graphics } from 'pixi.js';

const DEFAULT_VALUE: IFillProperty = { color: 0x000, alpha: 1 };

export class FillProperty extends AbsProperty<IFillProperty> {
  constructor(shape: BaseShape, value?: IFillProperty) {
    super(shape, value || DEFAULT_VALUE);
  }

  draw(): void {
    const { width, height } = this.shape.getWH()

    if (this.shape.type === ShapeTypeEnum.Circle) {
      this.shape.graphics.beginFill(this.value.color);
      this.shape.graphics.drawCircle(0, 0, width / 2);
      this.shape.graphics.endFill();
    }

    if (this.shape.type === ShapeTypeEnum.Rectangle) {
      this.shape.graphics.beginFill(this.value.color);
      this.shape.graphics.drawRect(0, 0, width, height);
      this.shape.graphics.endFill();
    }
  }
}
