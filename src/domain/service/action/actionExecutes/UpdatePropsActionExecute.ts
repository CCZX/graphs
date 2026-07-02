import { AbsActionExecute } from '../AbsActionExecute';
import { ActionTypeEnum, IActionExecute } from '../../../contract/action';
import { IShapeManager } from '@/domain/contract';
import { inject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';
import { UpdatePropsAction } from '../actions/UpdatePropsAction';

@fluentProvideWithSingle(IActionExecute)
export class UpdatePropsActionExecute extends AbsActionExecute {
	type = ActionTypeEnum.UpdateShapeProps;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	execute(action: UpdatePropsAction): void {
		const { id, propertyType, props } = action.data;
		const shape = this.shapeManager.getShapeById(id);
		if (!shape) {
			return;
		}
		shape.updateProperty(propertyType, props);
	}
}
