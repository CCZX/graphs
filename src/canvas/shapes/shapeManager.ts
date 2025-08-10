import { Point } from '../../types/geometry';
import { isPointInRect } from '../../utils/geometry';
import { BaseShape } from './BaseShape';

class ShapeManager {
  private shapes: Map<string, BaseShape> = new Map();
  private selectedShapes: Map<string, BaseShape> = new Map();

  setShape(shape: BaseShape) {
    this.shapes.set(shape.id, shape);
  }

  getShapeById(id: string) {
    return this.shapes.get(id);
  }

  getShapeByPoint(point: Point) {
    for (const [, shape] of this.shapes) {
      const bounds = shape.getBounds();
      if (isPointInRect(point, bounds)) {
        return shape;
      }
    }
  }

  setSelectedShape(shape: BaseShape) {
    this.selectedShapes.set(shape.id, shape);
  }

  getSelectedShapeById(id: string) {
    return this.selectedShapes.get(id);
  }

  getSelectedShapes() {
    return this.selectedShapes;
  }

  removeSelectedShapeById(id: string) {
    this.selectedShapes.delete(id);
  }
}

export const shapeManager = new ShapeManager();
