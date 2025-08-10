import { ShapeDecorateTypeEnum } from '../../types/shape';
import { BaseShape } from '../BaseShape';

export abstract class AbsDecorate {
  abstract type: ShapeDecorateTypeEnum;

  protected shape: BaseShape;

  constructor(shape: BaseShape) {
    this.shape = shape;
  }

  abstract onActivate(): void;

  abstract onDeactivate(): void;
}
