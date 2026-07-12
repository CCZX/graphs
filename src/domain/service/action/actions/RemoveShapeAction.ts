import { ShapeData } from '@/shape/contract';
import { AbsAction } from '../AbsAction';
import { ActionTypeEnum } from '../../../contract/action';
import { IocContainerService } from '@/common/contract';
import { CreateShapeAction } from './CreateShapeAction';

export class RemoveShapeAction extends AbsAction<ShapeData[]> {
	type: ActionTypeEnum.RemoveShape = ActionTypeEnum.RemoveShape;
	data: ShapeData[];

	constructor(data: ShapeData[], ioc: IocContainerService) {
		super(ioc);
		this.data = data;
	}

	genBackAction(): CreateShapeAction {
		return new CreateShapeAction(this.data, this.ioc);
	}
}
