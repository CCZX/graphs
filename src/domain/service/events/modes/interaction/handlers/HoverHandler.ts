import { ShapeStateEnum } from '@/canvas/shapes/shape';
import { shapeManager } from '@/domain/service/shapeManager';
import { HandlerEnum, InteractionState, EventPayload } from '../../../types';
import { Handler } from '../../../Handler';

export class HoverHandler extends Handler {
	type = HandlerEnum.Hover;

	enable(_state: InteractionState): boolean {
		return true;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		if (e.type !== 'pointermove') {
			return true;
		}

		const nextShape = shapeManager.getShapeByPoint(payload.viewportPoint);

		if (nextShape?.id === state.hoveredShape?.id) {
			return true;
		}

		if (state.hoveredShape?.getState() === ShapeStateEnum.Hover) {
			state.hoveredShape.setState(ShapeStateEnum.Normal);
		}

		if (nextShape?.getState() === ShapeStateEnum.Normal) {
			nextShape.setState(ShapeStateEnum.Hover);
		}

		state.hoveredShape = nextShape || null;

		document.body.style.cursor = nextShape ? 'move' : 'default';

		return true;
	}
}
