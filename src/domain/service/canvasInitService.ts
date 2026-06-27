import { ShapeData, ShapePropertyEnum, ShapeTypeEnum } from '@/shapes/contract';
import { BaseShape } from '@/shapes/BaseShape';
import { Circle } from '@/shapes/Circle';
import { Rectangle } from '@/shapes/Rectangle';
import { ICanvasInitService, IShapeManager } from '../contract';
import { provide } from 'inversify-binding-decorators';
import { inject } from 'inversify';
import { ILoggerService } from '@/common/contract';

@provide(ICanvasInitService)
export class CanvasInitService implements ICanvasInitService {
	@inject(ILoggerService)
	private loggerService!: ILoggerService;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	init(data: ShapeData[], ioc: IocContainer) {
		for (let i = 0; i < data.length; i++) {
			const shapeDataItem = data[i];

			let shape: BaseShape | null = null;

			if (shapeDataItem.type === ShapeTypeEnum.Circle) {
				shape = new Circle(shapeDataItem.id, { ioc });
				shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
				if (shapeDataItem.properties.fill) {
					shape.setProperty(ShapePropertyEnum.Fill, shapeDataItem.properties.fill);
				}
			} else if (shapeDataItem.type === ShapeTypeEnum.Rectangle) {
				shape = new Rectangle(shapeDataItem.id, { ioc });
				shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
				if (shapeDataItem.properties.fill) {
					shape.setProperty(ShapePropertyEnum.Fill, shapeDataItem.properties.fill);
				}
			}

			if (shape) {
				this.shapeManager.setShape(shape);
			}
		}
	}
}
