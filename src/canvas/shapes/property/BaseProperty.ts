import { AbsProperty } from './AbsProperty';
import { BaseProperty as IBaseProperty, ShapeTypeEnum } from '../../../types/shape';
import { BaseShape } from '../BaseShape';

const DEFAULT_VALUE: IBaseProperty = { x: 0, y: 0, width: 100, height: 100 };

export class BaseProperty extends AbsProperty<IBaseProperty> {
  constructor(shape: BaseShape, value?: IBaseProperty) {
    super(shape, value || DEFAULT_VALUE);
  }

  draw(): void {
    this.shape.container.x = this.value.x;
    this.shape.container.y = this.value.y;

    this.shape.graphics.width = this.value.width;
    this.shape.graphics.height = this.value.height;
    this.shape.graphics.position.set(0, 0);
    if (this.shape.type === ShapeTypeEnum.Circle) {
      this.shape.graphics.position.set(this.value.width / 2, this.value.height / 2);
    }
  }
}
