import { AbsActionExecute } from '../AbsActionExecute';
import { ActionTypeEnum, IActionExecute } from '../../../contract/action';
import { IShapeManager } from '@/domain/contract';
import { fluentProvide } from 'inversify-binding-decorators';
import { inject } from 'inversify';
import { UpdatePropsAction } from '../actions/UpdatePropsAction';

// @ts-ignore
@fluentProvide(IActionExecute).inSingletonScope().done()
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
