import { ShapeData, ShapePropertyEnum, ShapeTypeEnum } from '@/canvas/shapes/shape';
import { BaseShape } from '@/canvas/shapes/BaseShape';
import { Circle } from '@/canvas/shapes/Circle';
import { Rectangle } from '@/canvas/shapes/Rectangle';
import { shapeManager } from './shapeManager';
import { ICanvasInitService } from '../contract';
import { provide } from 'inversify-binding-decorators';

@provide(ICanvasInitService)
export class CanvasInitService implements ICanvasInitService {
	init(data: ShapeData[]) {
		for (let i = 0; i < data.length; i++) {
			const shapeDataItem = data[i];

			let shape: BaseShape | null = null;

			if (shapeDataItem.type === ShapeTypeEnum.Circle) {
				shape = new Circle(shapeDataItem.id);
				shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
				if (shapeDataItem.properties.fill) {
					shape.setProperty(ShapePropertyEnum.Fill, shapeDataItem.properties.fill);
				}
			} else if (shapeDataItem.type === ShapeTypeEnum.Rectangle) {
				shape = new Rectangle(shapeDataItem.id);
				shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
				if (shapeDataItem.properties.fill) {
					shape.setProperty(ShapePropertyEnum.Fill, shapeDataItem.properties.fill);
				}
			}

			if (shape) {
				shapeManager.setShape(shape);
			}
		}
	}
}
