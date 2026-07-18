import { ShapeStateEnum, ShapeTypeEnum } from '@/shape/contract';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IHandlerWithInteraction, IHandler, IShapeManager } from '@/domain/contract';
import { ISelectService } from '@/domain/contract/SelectService';
import { IViewportService } from '@/domain/contract/ViewportService';
import { inject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IHandlerWithInteraction)
export class TextEditHandler implements IHandler {
	public type: HandlerEnum = HandlerEnum.TextEdit;
	public sort = 70;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	@inject(ISelectService)
	private selectService!: ISelectService;

	@inject(IViewportService)
	private viewportService!: IViewportService;

	public enable(_state: InteractionState): boolean {
		return true;
	}

	public execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		if (e.type !== 'pointerdown') {
			return true;
		}

		if (state.selectedShapes.length !== 1) {
			return true;
		}

		const worldPoint = this.viewportService.clientToViewportLocal(
			payload.viewportPoint.x,
			payload.viewportPoint.y,
		);
		const shapeUnderCursor = this.shapeManager.getShapeByPoint(worldPoint);
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

		this.selectService.clearSelectedShapes();

		// 选中并进入编辑态
		shapeUnderCursor.setState(ShapeStateEnum.Edit);
		state.selectedShapes = [shapeUnderCursor];
		this.selectService.setSelectedShape(shapeUnderCursor);

		return false;
	}
}
