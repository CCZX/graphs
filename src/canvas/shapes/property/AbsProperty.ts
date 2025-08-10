import { BaseShape } from '../BaseShape';

export abstract class AbsProperty<T = unknown> {
  shape: BaseShape;

  value: T;

  constructor(shape: BaseShape, value: T) {
    this.shape = shape;
    this.value = value;
    this.draw();
  }

  abstract draw(): void;

  set(value: T) {
    this.value = value;
    this.draw();
  }

  get() {
    return this.value;
  }
}
