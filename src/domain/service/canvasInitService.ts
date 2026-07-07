import { ShapeData, ShapePropertyEnum, ShapeTypeEnum } from '@/shapes/contract';
import { BaseShape } from '@/shapes/BaseShape';
import { Circle } from '@/shapes/Circle';
import { Rectangle } from '@/shapes/Rectangle';
import { Line } from '@/shapes/Line';
import { Text } from '@/shapes/Text';
import { ICanvasInitService, IShapeManager } from '../contract';
import { provide } from 'inversify-binding-decorators';
import { inject } from 'inversify';
import { IocContainerService, ILoggerService } from '@/common/contract';

@provide(ICanvasInitService)
export class CanvasInitService implements ICanvasInitService {
	@inject(ILoggerService)
	private loggerService!: ILoggerService;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	@inject(IocContainerService)
	private iocContainerService!: IocContainerService;

	init(data: ShapeData[]) {
		for (let i = 0; i < data.length; i++) {
			const shapeDataItem = data[i];

			let shape: BaseShape | null = null;

			if (shapeDataItem.type === ShapeTypeEnum.Circle) {
				shape = new Circle(shapeDataItem.id, { ioc: this.iocContainerService });
				shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
				if (shapeDataItem.properties.fill) {
					shape.setProperty(ShapePropertyEnum.Fill, shapeDataItem.properties.fill);
				}
			} else if (shapeDataItem.type === ShapeTypeEnum.Rectangle) {
				shape = new Rectangle(shapeDataItem.id, { ioc: this.iocContainerService });
				shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
				if (shapeDataItem.properties.fill) {
					shape.setProperty(ShapePropertyEnum.Fill, shapeDataItem.properties.fill);
				}
			} else if (shapeDataItem.type === ShapeTypeEnum.Text) {
				// @ts-ignore Text extends BaseShape<PixiText> but BaseShape expects Graphics
				shape = new Text(shapeDataItem.id, { ioc: this.iocContainerService });
				// @ts-ignore shape narrowed inside else-if
				shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
				if (shapeDataItem.properties.fill) {
					// @ts-ignore
					shape.setProperty(ShapePropertyEnum.Fill, shapeDataItem.properties.fill);
				}
				if (shapeDataItem.properties.text) {
					// @ts-ignore
					shape.setProperty(ShapePropertyEnum.Text, shapeDataItem.properties.text);
				}
			} else if (shapeDataItem.type === ShapeTypeEnum.Line) {
				shape = new Line(shapeDataItem.id, { ioc: this.iocContainerService });
				shape.setProperty(ShapePropertyEnum.Base, shapeDataItem.properties.base);
				if (shapeDataItem.properties.stroke) {
					shape.setProperty(ShapePropertyEnum.Stroke, shapeDataItem.properties.stroke);
				}
				if (shapeDataItem.properties.line) {
					shape.setProperty(ShapePropertyEnum.Line, shapeDataItem.properties.line);
				}
			}

			if (shape) {
				this.shapeManager.setShape(shape);
			}
		}
	}
}
