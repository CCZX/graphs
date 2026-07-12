import { ShapeData } from '@/shape/contract';
import { AbsAction } from '../AbsAction';
import { ActionTypeEnum } from '../../../contract/action';
import { IocContainerService } from '@/common/contract';
import { RemoveShapeAction } from './RemoveShapeAction';

export class CreateShapeAction extends AbsAction<ShapeData[]> {
	type: ActionTypeEnum.CreateShape = ActionTypeEnum.CreateShape;
	data: ShapeData[];

	constructor(data: ShapeData[], ioc: IocContainerService) {
		super(ioc);
		this.data = data;
	}

	genBackAction(): RemoveShapeAction {
		return new RemoveShapeAction(this.data, this.ioc);
	}
}
