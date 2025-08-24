import { AbsProperty } from './AbsProperty';
import { FillPropertyValue, ShapeTypeEnum } from '../../../types/shape';
import { BaseShape } from '../BaseShape';

const DEFAULT_VALUE: FillPropertyValue = { color: 0x000, alpha: 1 };

export class FillProperty extends AbsProperty<FillPropertyValue> {
  constructor(shape: BaseShape, value?: FillPropertyValue) {
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
