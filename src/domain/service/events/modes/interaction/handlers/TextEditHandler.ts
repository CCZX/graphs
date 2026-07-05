import { ShapeStateEnum, ShapeTypeEnum } from '@/shapes/contract';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IHandlerWithInteraction, IHandler, IShapeManager } from '@/domain/contract';
import { ISelectService } from '@/domain/contract/SelectService';
import { selectionStore } from '@/store/selection';
import { inject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IHandlerWithInteraction)
export class TextEditHandler implements IHandler {
	type = HandlerEnum.TextEdit;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	@inject(ISelectService)
	private selectService!: ISelectService;

	enable(_state: InteractionState): boolean {
		return true;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		if (e.type !== 'pointerdown') {
			return true;
		}

		if (state.selectedShapes.length !== 1) {
			return true;
		}

		const shapeUnderCursor = this.shapeManager.getShapeByPoint(payload.viewportPoint);
		if (!shapeUnderCursor || shapeUnderCursor.type !== ShapeTypeEnum.Text) {
			return true;
		}

		if (shapeUnderCursor.getState() === ShapeStateEnum.Edit) {
			return false;
		}

		// 取消已有选中
		state.selectedShapes.forEach((s) => {
			if (s.id !== shapeUnderCursor.id) {
				s.setState(ShapeStateEnum.Normal);
			}
		});

		selectionStore.getState().clearSelectedShapeIds();
		this.selectService.clearSelectedShapes();

		// 选中并进入编辑态
		shapeUnderCursor.setState(ShapeStateEnum.Edit);
		state.selectedShapes = [shapeUnderCursor];
		selectionStore.getState().addSelectedShapeId(shapeUnderCursor.id);
		this.selectService.setSelectedShape(shapeUnderCursor);

		return false;
	}
}
