import { AbsProperty } from './AbsProperty';
import { BasePropertyValue, ShapePropertyEnum, ShapeTypeEnum } from '../../../types/shape';
import { BaseShape } from '../BaseShape';
import { FillProperty } from './FillProperty';

const DEFAULT_VALUE: BasePropertyValue = { x: 0, y: 0, width: 100, height: 100 };

export class BaseProperty extends AbsProperty<BasePropertyValue> {
  constructor(shape: BaseShape, value?: BasePropertyValue) {
    super(shape, value || DEFAULT_VALUE);
  }

  draw(): void {
    this.shape.container.x = this.value.x;
    this.shape.container.y = this.value.y;
    this.shape.container.width = this.value.width;
    this.shape.container.height = this.value.height;

    if (this.shape.type === ShapeTypeEnum.Rectangle) {
      this.shape.graphics.position.set(0, 0);
      this.shape.graphics.beginFill()
      this.shape.graphics.drawRect(0, 0, this.value.width, this.value.height)
      this.shape.graphics.endFill()
    }

    if (this.shape.type === ShapeTypeEnum.Circle) {
      this.shape.graphics.position.set(this.value.width / 2, this.value.height / 2);
    }

    const fill = this.shape.getProperty<FillProperty>(ShapePropertyEnum.Fill)
    fill?.draw()
  }
}
