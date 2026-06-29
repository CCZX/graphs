import { BaseShape } from '@/shapes/BaseShape';
import { ShapeStateEnum } from '@/shapes/contract';
import { selectionStore } from '@/store/selection';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IShapeManager } from '@/domain/contract';
import { fluentProvide } from 'inversify-binding-decorators';
import { IHandlerWithInteraction, IHandler } from '@/domain/contract';
import { inject } from 'inversify';

// @ts-expect-error
@fluentProvide(IHandlerWithInteraction).inSingletonScope().done()
export class SelectHandler implements IHandler {
	type = HandlerEnum.Select;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	enable(_state: InteractionState): boolean {
		return true;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		if (e.type !== 'pointerdown') {
			return true;
		}

		const nextShape = this.shapeManager.getShapeByPoint(payload.viewportPoint);

		// 点击已选中的图形，放行给 MoveHandler
		if (nextShape && state.selectedShapes.some((s) => s.id === nextShape.id)) {
			return true;
		}

		if (state.hoveredShape?.getState() === ShapeStateEnum.Hover) {
			state.hoveredShape.setState(ShapeStateEnum.Normal);
		}

		// 取消所有选中
		state.selectedShapes.forEach((s) => s.setState(ShapeStateEnum.Normal));
		state.selectedShapes = [];
		selectionStore.getState().clearSelectedShapeIds();
		this.shapeManager.clearSelectedShapes();

		if (nextShape) {
			nextShape.setState(ShapeStateEnum.Selected);
			state.selectedShapes = [nextShape];
			selectionStore.getState().addSelectedShapeId(nextShape.id);
			this.shapeManager.setSelectedShape(nextShape);
		}

		return true;
	}
}
