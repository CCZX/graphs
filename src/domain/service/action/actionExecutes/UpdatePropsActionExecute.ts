import { AbsActionExecute } from '../AbsActionExecute';
import { ActionTypeEnum, IActionExecute } from '../../../contract/action';
import { IShapeManager } from '@/domain/contract';
import { ISelectService } from '@/domain/contract/SelectService';
import { ShapePropertyEnum } from '@/shapes/contract';
import { inject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';
import { UpdatePropsAction } from '../actions/UpdatePropsAction';
import { BaseShape } from '@/shapes/BaseShape';

@fluentProvideWithSingle(IActionExecute)
export class UpdatePropsActionExecute extends AbsActionExecute {
	type = ActionTypeEnum.UpdateShapeProps;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	@inject(ISelectService)
	private selectService!: ISelectService;

	execute(action: UpdatePropsAction): void {
		const shapes: BaseShape[] = [];
		for (const { id, properties } of action.data) {
			const shape = this.shapeManager.getShapeById(id);
			if (!shape) {
				continue;
			}

			shape.updateProperty(ShapePropertyEnum.Base, properties.base);

			if (properties.fill) {
				shape.updateProperty(ShapePropertyEnum.Fill, properties.fill);
			}

			if (properties.stroke) {
				shape.updateProperty(ShapePropertyEnum.Stroke, properties.stroke);
			}

			shapes.push(shape);
		}

		this.selectService.updateMultiSelectOverlay(shapes);
	}
}
