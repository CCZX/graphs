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
    if (this.shape.type === ShapeTypeEnum.Circle) {
      (this.shape.graphics as Graphics).beginFill(this.value.color);
      (this.shape.graphics as Graphics).drawCircle(0, 0, 10);
      (this.shape.graphics as Graphics).endFill();
    }

    if (this.shape.type === ShapeTypeEnum.Rectangle) {
      (this.shape.graphics as Graphics).beginFill(this.value.color);
      (this.shape.graphics as Graphics).drawRect(0, 0, 10, 10);
      (this.shape.graphics as Graphics).endFill();
    }
  }
}
