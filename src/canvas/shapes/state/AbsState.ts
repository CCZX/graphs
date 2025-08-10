import { ShapeStateEnum } from '../../types/shape';
import { BaseShape } from '../BaseShape';

export abstract class AbsState {
  abstract type: ShapeStateEnum;

  protected shape: BaseShape;

  constructor(shape: BaseShape) {
    this.shape = shape;
  }

  abstract onActivate(): void;

  abstract onDeactivate(): void;

  allowNextStateTypes: ShapeStateEnum[] = [];
}
