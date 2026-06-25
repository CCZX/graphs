import { BaseShape } from '@/canvas/shapes/BaseShape';
import { BaseProperty } from '@/canvas/shapes/property/BaseProperty';
import { BasePropertyValue, ShapePropertyEnum, ShapeStateEnum } from '@/canvas/shapes/shape';
import { shapeManager } from '@/domain/shapeManager';
import { HandlerEnum, InteractionState, EventPayload } from '../../../types';
import { Handler } from '../../../Handler';

const DRAG_THRESHOLD = 3;

export class MoveHandler extends Handler {
	type = HandlerEnum.Move;

	private isDragging = false;
	private movingShape: BaseShape | null = null;
	private startScreenPoint: Point | null = null;
	private originBaseProps: BasePropertyValue | null = null;

	enable(state: InteractionState): boolean {
		return state.selectedShape !== null;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		switch (e.type) {
			case 'pointerdown':
				return this.handlePointerDown(state, payload);
			case 'pointermove':
				return this.handlePointerMove(state, payload);
			case 'pointerup':
				return this.handlePointerUp(state);
			default:
				return true;
		}
	}

	private handlePointerDown(state: InteractionState, payload: EventPayload): boolean {
		const shapeUnderCursor = shapeManager.getShapeByPoint(payload.viewportPoint);
		if (shapeUnderCursor?.id !== state.selectedShape?.id) return true;
		if (!state.selectedShape) return true;

		const p = state.selectedShape.getProperty<BaseProperty>(ShapePropertyEnum.Base).get();
		this.originBaseProps = p || null;
		this.startScreenPoint = payload.screenPoint;
		return true;
	}

	private handlePointerMove(state: InteractionState, payload: EventPayload): boolean {
		if (this.isDragging) {
			this.applyMove(payload.screenPoint);
			return false;
		}

		if (this.startScreenPoint && this.originBaseProps) {
			const dx = payload.screenPoint.x - this.startScreenPoint.x;
			const dy = payload.screenPoint.y - this.startScreenPoint.y;

			if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
				return true;
			}

			this.isDragging = true;
			this.movingShape = state.selectedShape!;
			this.movingShape.setState(ShapeStateEnum.Moving);
			return false;
		}

		return true;
	}

	private handlePointerUp(state: InteractionState): boolean {
		if (this.isDragging) {
			this.movingShape?.setState(ShapeStateEnum.Selected);
			this.reset();
			return false;
		}

		this.reset();
		return true;
	}

	private applyMove(screenPoint: Point) {
		if (!this.movingShape || !this.originBaseProps || !this.startScreenPoint) return;

		this.movingShape.updateProperty(ShapePropertyEnum.Base, {
			x: this.originBaseProps.x + (screenPoint.x - this.startScreenPoint.x),
			y: this.originBaseProps.y + (screenPoint.y - this.startScreenPoint.y),
		});
	}

	private reset() {
		this.isDragging = false;
		this.movingShape = null;
		this.startScreenPoint = null;
		this.originBaseProps = null;
	}
}
