import { BaseShape } from '@/shapes/BaseShape';
import { BaseProperty } from '@/shapes/property/BaseProperty';
import { BasePropertyValue, ShapePropertyEnum, ShapeStateEnum } from '@/shapes/contract';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IShapeManager } from '@/domain/contract';
import { ISelectService } from '@/domain/contract/SelectService';
import { IViewportService } from '@/domain/contract/ViewportService';
import { IActionLogManager, IActionManager } from '@/domain/contract/action';
import { UpdatePropsAction } from '@/domain/service/action/actions/UpdatePropsAction';
import { isPointInRect } from '@/shapes/geometry';
import { IHandlerWithInteraction, IHandler } from '@/domain/contract';
import { inject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';
import { IocContainerService } from '@/common/contract';

const DRAG_THRESHOLD = 3;

@fluentProvideWithSingle(IHandlerWithInteraction)
export class MoveHandler implements IHandler {
	type = HandlerEnum.Move;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	@inject(ISelectService)
	private selectService!: ISelectService;

	@inject(IViewportService)
	private viewportService!: IViewportService;

	@inject(IActionManager)
	private actionManager!: IActionManager;

	@inject(IActionLogManager)
	private actionLogManager!: IActionLogManager;

	@inject(IocContainerService)
	private ioc!: IocContainerService;

	private isDragging = false;
	private movingShapes: BaseShape[] = [];
	private startScreenPoint: Point | null = null;
	private originBasePropsMap: Map<string, BasePropertyValue> = new Map();

	enable(state: InteractionState): boolean {
		return state.selectedShapes.length > 0;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		switch (e.type) {
			case 'pointerdown':
				return this.handlePointerDown(state, payload);
			case 'pointermove':
				if (e.buttons !== 1) {
					if (this.isDragging) {
						const restoreState =
							this.movingShapes.length > 1 ? ShapeStateEnum.MultiSelected : ShapeStateEnum.Selected;
						this.movingShapes.forEach((s) => s.setState(restoreState));
					}
					if (this.startScreenPoint || this.isDragging) {
						this.reset();
					}
					return true;
				}
				return this.handlePointerMove(state, payload);
			case 'pointerup':
				return this.handlePointerUp(state);
			default:
				return true;
		}
	}

	private handlePointerDown(state: InteractionState, payload: EventPayload): boolean {
		const shapeUnderCursor = this.shapeManager.getShapeByPoint(payload.viewportPoint);
		const isOnSelected =
			shapeUnderCursor && state.selectedShapes.some((s) => s.id === shapeUnderCursor.id);

		const isOnOverlay = this.isPointOnOverlay(payload);

		if (!isOnSelected && !isOnOverlay) {
			return true;
		}

		this.originBasePropsMap.clear();
		for (const shape of state.selectedShapes) {
			const p = shape.getProperty<BaseProperty>(ShapePropertyEnum.Base).get();
			if (p) {
				this.originBasePropsMap.set(shape.id, { ...p });
			}
		}
		this.startScreenPoint = payload.screenPoint;
		return true;
	}

	private isPointOnOverlay(payload: EventPayload): boolean {
		const rect = this.selectService.getMultiSelectOverlayRect();
		if (!rect) {
			return false;
		}
		const local = this.viewportService.clientToViewportLocal(
			payload.viewportPoint.x,
			payload.viewportPoint.y,
		);
		// 扩展 4px 匹配 overlay 绘制的 offset
		const expanded = {
			x: rect.x - 4,
			y: rect.y - 4,
			width: rect.width + 8,
			height: rect.height + 8,
		};
		return isPointInRect({ x: local.x, y: local.y }, expanded);
	}

	private handlePointerMove(state: InteractionState, payload: EventPayload): boolean {
		if (this.isDragging) {
			this.applyMove(payload.screenPoint);
			return false;
		}

		if (this.startScreenPoint && this.originBasePropsMap.size > 0) {
			const dx = payload.screenPoint.x - this.startScreenPoint.x;
			const dy = payload.screenPoint.y - this.startScreenPoint.y;

			if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
				return true;
			}

			this.actionLogManager.setStreamStart();

			this.isDragging = true;
			this.movingShapes = [...state.selectedShapes];
			this.movingShapes.forEach((s) => s.setState(ShapeStateEnum.Moving));
			return false;
		}

		return true;
	}

	private handlePointerUp(_state: InteractionState): boolean {
		if (this.isDragging) {
			this.actionLogManager.setStreamEnd();

			const restoreState =
				this.movingShapes.length > 1 ? ShapeStateEnum.MultiSelected : ShapeStateEnum.Selected;
			this.movingShapes.forEach((s) => s.setState(restoreState));
			this.reset();
			return false;
		}

		this.reset();
		return true;
	}

	private applyMove(screenPoint: Point) {
		if (!this.startScreenPoint) {
			return;
		}

		const dx = screenPoint.x - this.startScreenPoint.x;
		const dy = screenPoint.y - this.startScreenPoint.y;

		for (const shape of this.movingShapes) {
			const origin = this.originBasePropsMap.get(shape.id);
			if (!origin) {
				continue;
			}
			this.actionManager.push(
				new UpdatePropsAction(
					{
						id: shape.id,
						propertyType: ShapePropertyEnum.Base,
						props: {
							x: origin.x + dx,
							y: origin.y + dy,
						},
					},
					this.ioc,
				),
			);
		}

		this.selectService.updateMultiSelectOverlay(this.movingShapes);
	}

	private reset() {
		this.isDragging = false;
		this.movingShapes = [];
		this.startScreenPoint = null;
		this.originBasePropsMap.clear();
	}
}
