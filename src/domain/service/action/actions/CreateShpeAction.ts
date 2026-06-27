import { ShapeData } from '@/shapes/shape';
import { AbsAction } from '../AbsAction';
import { ActionTypeEnum } from '../type';

export class CreateShapeAction extends AbsAction<ShapeData> {
	type: ActionTypeEnum.CreateShape = ActionTypeEnum.CreateShape;
	data: ShapeData;

	constructor(data: ShapeData) {
		super();
		this.data = data;
	}
}
