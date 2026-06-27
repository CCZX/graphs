import { AbsAction } from '../AbsAction';
import { ActionTypeEnum } from '../../../contract/action';
import { ShapePropertyEnum } from '@/shapes/contract';
import { IocContainerService } from '@/common/contract';
import { IShapeManager } from '@/domain/contract';

export interface UpdateShapePropsData {
	id: string;
	propertyType: ShapePropertyEnum;
	props: Record<string, unknown>;
}

export class UpdatePropsAction extends AbsAction<UpdateShapePropsData> {
	type: ActionTypeEnum.UpdateShapeProps = ActionTypeEnum.UpdateShapeProps;
	data: UpdateShapePropsData;

	constructor(data: UpdateShapePropsData, ioc: IocContainerService) {
		super(ioc);
		this.data = data;
	}

	genBackAction(): UpdatePropsAction {
		const shapeManager = this.ioc.get<IShapeManager>(IShapeManager);
		const shape = shapeManager.getShapeById(this.data.id);

		const property = shape?.getProperty(this.data.propertyType) as
			| { value: Record<string, unknown> }
			| undefined;
		const props = property?.value ?? {};

		return new UpdatePropsAction(
			{
				id: this.data.id,
				propertyType: this.data.propertyType,
				props: props as Record<string, unknown>,
			},
			this.ioc,
		);
	}
}
