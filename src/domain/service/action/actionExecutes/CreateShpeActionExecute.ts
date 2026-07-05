import { BaseShape } from '@/shapes/BaseShape';
import { AbsActionExecute } from '../AbsActionExecute';
import { CreateShapeAction } from '../actions/CreateShpeAction';
import { ShapePropertyEnum, ShapeTypeEnum } from '@/shapes/contract';
import { Circle } from '@/shapes/Circle';
import { Rectangle } from '@/shapes/Rectangle';
import { Text } from '@/shapes/Text';
import { ActionTypeEnum, IActionExecute } from '../../../contract/action';
import { IShapeManager } from '@/domain/contract';
import { inject } from 'inversify';
import { IocContainerService } from '@/common/contract';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IActionExecute)
export class CreateShapeActionExecute extends AbsActionExecute {
	type = ActionTypeEnum.CreateShape;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	@inject(IocContainerService)
	private iocContainerService!: IocContainerService;

	execute(action: CreateShapeAction): void {
		for (const { id, type, properties } of action.data) {
			const { base, fill, stroke, text } = properties;

			let shape: BaseShape;
			if (type === ShapeTypeEnum.Rectangle) {
				shape = new Rectangle(id, { ioc: this.iocContainerService });
			} else if (type === ShapeTypeEnum.Circle) {
				shape = new Circle(id, { ioc: this.iocContainerService });
			} else if (type === ShapeTypeEnum.Text) {
				// @ts-ignore Text extends BaseShape<PixiText> but BaseShape expects Graphics
				shape = new Text(id, { ioc: this.iocContainerService });
			} else {
				shape = new Rectangle(id, { ioc: this.iocContainerService });
			}

			shape.setProperty(ShapePropertyEnum.Base, {
				x: base.x,
				y: base.y,
				width: base.width,
				height: base.height,
			});

			if (fill) {
				shape.setProperty(ShapePropertyEnum.Fill, fill);
			}

			if (stroke) {
				shape.setProperty(ShapePropertyEnum.Stroke, stroke);
			}

			if (text) {
				shape.setProperty(ShapePropertyEnum.Text, text);
			}

			this.shapeManager.setShape(shape);
		}
	}
}
