import { BaseShape } from '@/shape/BaseShape';
import { AbsActionExecute } from '../AbsActionExecute';
import { RemoveShapeAction } from '../actions/RemoveShapeAction';
import { ActionTypeEnum, IActionExecute } from '../../../contract/action';
import { IShapeManager } from '@/domain/contract';
import { ISelectService } from '@/domain/contract/SelectService';
import { inject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IActionExecute)
export class RemoveShapeActionExecute extends AbsActionExecute {
	type = ActionTypeEnum.RemoveShape;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	@inject(ISelectService)
	private selectService!: ISelectService;

	execute(action: RemoveShapeAction): void {
		for (const { id } of action.data) {
			this.selectService.removeSelectedShapeById(id);
			this.shapeManager.removeShape(id);
		}

		const remaining = Array.from(this.selectService.getSelectedShapes().values());
		this.selectService.updateMultiSelectOverlay(remaining);
	}
}
