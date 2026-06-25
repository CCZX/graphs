import { ShapeStateEnum } from '@/canvas/shapes/shape';
import { shapeManager } from '@/domain/shapeManager';
import { selectionStore } from '@/store/selection';
import { HandlerEnum, InteractionState, EventPayload } from '../../../types';
import { Handler } from '../../../Handler';

export class SelectHandler extends Handler {
	type = HandlerEnum.Select;

	enable(_state: InteractionState): boolean {
		return true;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		if (e.type !== 'pointerdown') {
			return true;
		}

		const nextShape = shapeManager.getShapeByPoint(payload.viewportPoint);

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
