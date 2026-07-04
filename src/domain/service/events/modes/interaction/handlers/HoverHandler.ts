import { ShapeStateEnum } from '@/shapes/contract';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IHandler, IHandlerWithInteraction, IShapeManager } from '@/domain/contract';
import { inject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IHandlerWithInteraction)
export class HoverHandler implements IHandler {
	type = HandlerEnum.Hover;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	enable(_state: InteractionState): boolean {
		return true;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		if (e.type !== 'pointermove') {
			return true;
		}

		const nextShape = this.shapeManager.getShapeByPoint(payload.viewportPoint);

		document.body.style.cursor = 'default';

		if (nextShape?.id === state.hoveredShape?.id) {
			return true;
		}

		if (state.hoveredShape?.getState() === ShapeStateEnum.Hover) {
			state.hoveredShape.setState(ShapeStateEnum.Normal);
		}

		const isSelected = nextShape && state.selectedShapes.some((s) => s.id === nextShape.id);
		if (nextShape?.getState() === ShapeStateEnum.Normal && !isSelected) {
			nextShape.setState(ShapeStateEnum.Hover);
		}

		state.hoveredShape = nextShape || null;

		return true;
	}
}
