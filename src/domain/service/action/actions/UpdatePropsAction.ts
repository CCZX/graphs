import { AbsAction } from '../AbsAction';
import { ActionTypeEnum } from '../../../contract/action';
import { ShapePropertyEnum } from '@/shapes/contract';

export interface UpdateShapePropsData {
	id: string;
	propertyType: ShapePropertyEnum;
	props: Record<string, unknown>;
}

export class UpdatePropsAction extends AbsAction<UpdateShapePropsData> {
	type: ActionTypeEnum.UpdateShapeProps = ActionTypeEnum.UpdateShapeProps;
	data: UpdateShapePropsData;

	constructor(data: UpdateShapePropsData) {
		super();
		this.data = data;
	}

	genBackAction(): UpdatePropsAction {
		return new UpdatePropsAction({
			id: this.data.id,
			propertyType: this.data.propertyType,
			props: this.data.props,
		});
	}
}
