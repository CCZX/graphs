import { Stage } from '../core/Stage';
import { ShapeData, ShapePropertyEnum, ShapeTypeEnum } from '../../types/shape';
import { BaseShape } from './BaseShape';
import { Circle } from './Circle';
import { Rectangle } from './Rectangle';
import { shapeManager } from './shapeManager';

export class ShapeCreator {
  private stage: Stage;
  private data: ShapeData[];

  constructor(stage: Stage, data: ShapeData[]) {
    this.stage = stage;
    this.data = data;
  }

  create() {
    for (let i = 0; i < this.data.length; i++) {
      const shapeDataItem = this.data[i];

      let shape: BaseShape | null = null;

      if (shapeDataItem.type === ShapeTypeEnum.Circle) {
        shape = new Circle(shapeDataItem.id);
        shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
        shape.setProperty(ShapePropertyEnum.Fill, shapeDataItem.properties.fill);
      } else if (shapeDataItem.type === ShapeTypeEnum.Rectangle) {
        shape = new Rectangle(shapeDataItem.id);
        shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
        shape.setProperty(ShapePropertyEnum.Fill, shapeDataItem.properties.fill);
      }

      if (shape) {
        this.stage.appendShape(shape.container);
        shapeManager.setShape(shape);
      }
    }
  }
}
