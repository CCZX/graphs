import { BaseShape } from '@/shapes/BaseShape';
import { AbsActionExecute } from '../AbsActionExecute';
import { CreateShapeAction } from '../actions/CreateShpeAction';
import { ShapePropertyEnum, ShapeTypeEnum } from '@/shapes/contract';
import { Circle } from '@/shapes/Circle';
import { Rectangle } from '@/shapes/Rectangle';
import { ActionTypeEnum, IActionExecute } from '../../../contract/action';
import { fluentProvide } from 'inversify-binding-decorators';
import { IShapeManager } from '@/domain/contract';
import { inject } from 'inversify';
import { IocContainerService } from '@/common/contract';

// @ts-ignore
@fluentProvide(IActionExecute).inSingletonScope().done()
export class CreateShapeActionExecute extends AbsActionExecute {
	type = ActionTypeEnum.CreateShape;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	@inject(IocContainerService)
	private iocContainerService!: IocContainerService;

	execute(action: CreateShapeAction): void {
		console.log(action.data);
		let shape: BaseShape;
		const { type, id, properties } = action.data;
		const { base, fill, stroke } = properties;
		if (type === ShapeTypeEnum.Rectangle) {
			shape = new Rectangle(id, { ioc: this.iocContainerService });
		} else if (type === ShapeTypeEnum.Circle) {
			shape = new Circle(id, { ioc: this.iocContainerService });
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
		this.shapeManager.setShape(shape);
	}
}
