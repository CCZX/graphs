import { BaseShape } from '@/shapes/BaseShape';
import { AbsActionExecute } from '../AbsActionExecute';
import { CreateShapeAction } from '../actions/CreateShpeAction';
import { ShapePropertyEnum, ShapeTypeEnum } from '@/shapes/contract';
import { Circle } from '@/shapes/Circle';
import { Rectangle } from '@/shapes/Rectangle';
import { shapeManager } from '@/domain/service/shapeManager';
import { ActionTypeEnum } from '../type';

export class CreateShapeActionExecute extends AbsActionExecute {
	type = ActionTypeEnum.CreateShape;

	execute(action: CreateShapeAction): void {
		console.log(action.data);

		let shape: BaseShape;

		const { type, id, properties } = action.data;
		const { base, fill, stroke } = properties;

		if (type === ShapeTypeEnum.Rectangle) {
			shape = new Rectangle(id);
		} else if (type === ShapeTypeEnum.Circle) {
			shape = new Circle(id);
		} else {
			shape = new Rectangle(id);
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

		shapeManager.setShape(shape);
	}
}
