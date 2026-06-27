import { ShapeData } from '@/shapes/contract';
import { AbsAction } from '../AbsAction';
import { ActionTypeEnum } from '../../../contract/action';

export class CreateShapeAction extends AbsAction<ShapeData> {
	type: ActionTypeEnum.CreateShape = ActionTypeEnum.CreateShape;
	data: ShapeData;

	constructor(data: ShapeData) {
		super();
		this.data = data;
	}
}
