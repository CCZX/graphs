import { BaseShape } from '@/shapes/BaseShape';
import { ShapeStateEnum } from '@/shapes/contract';
import { selectionStore } from '@/store/selection';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IShapeManager } from '@/domain/contract';
import { isPointInRect } from '@/shapes/geometry';
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

		// 点击在多选 overlay 上，放行给 MoveHandler
		if (this.isOnOverlay(payload)) {
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

		this.shapeManager.updateMultiSelectOverlay(state.selectedShapes);

		return true;
	}

	private isOnOverlay(payload: EventPayload): boolean {
		const rect = this.shapeManager.getMultiSelectOverlayRect();
		if (!rect) {
			return false;
		}
		const local = this.shapeManager.clientToViewportLocal(
			payload.viewportPoint.x,
			payload.viewportPoint.y,
		);
		const expanded = {
			x: rect.x - 4,
			y: rect.y - 4,
			width: rect.width + 8,
			height: rect.height + 8,
		};
		return isPointInRect({ x: local.x, y: local.y }, expanded);
	}
}
