import { ShapeData } from '@/shapes/contract';
import { AbsAction } from '../AbsAction';
import { ActionTypeEnum } from '../../../contract/action';
import { IocContainerService } from '@/common/contract';

export class CreateShapeAction extends AbsAction<ShapeData> {
	type: ActionTypeEnum.CreateShape = ActionTypeEnum.CreateShape;
	data: ShapeData;

	constructor(data: ShapeData, ioc: IocContainerService) {
		super(ioc);
		this.data = data;
	}

	genBackAction(): CreateShapeAction {
		return new CreateShapeAction(
			{
				id: this.data.id,
				type: this.data.type,
				properties: this.data.properties,
			},
			this.ioc,
		);
	}
}
