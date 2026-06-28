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

		// 新旧相同，放行给 MoveHandler
		if (nextShape?.id === state.selectedShape?.id) {
			return true;
		}

		if (state.hoveredShape?.getState() === ShapeStateEnum.Hover) {
			state.hoveredShape.setState(ShapeStateEnum.Normal);
		}

		if (state.selectedShape) {
			state.selectedShape.setState(ShapeStateEnum.Normal);
		}

		if (nextShape) {
			nextShape.setState(ShapeStateEnum.Selected);
		}

		state.selectedShape = nextShape || null;
		selectionStore.getState().setSelectedShapeId(nextShape?.id || null);

		return true;
	}
}
