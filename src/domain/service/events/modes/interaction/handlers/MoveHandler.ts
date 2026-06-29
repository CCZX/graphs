import { BaseShape } from '@/shapes/BaseShape';
import { BaseProperty } from '@/shapes/property/BaseProperty';
import { BasePropertyValue, ShapePropertyEnum, ShapeStateEnum } from '@/shapes/contract';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IShapeManager } from '@/domain/contract';
import { IActionLogManager, IActionManager } from '@/domain/contract/action';
import { UpdatePropsAction } from '@/domain/service/action/actions/UpdatePropsAction';
import { fluentProvide } from 'inversify-binding-decorators';
import { IHandlerWithInteraction, IHandler } from '@/domain/contract';
import { inject } from 'inversify';
import { IocContainerService } from '@/common/contract';

const DRAG_THRESHOLD = 3;
// @ts-expect-error
@fluentProvide(IHandlerWithInteraction).inSingletonScope().done()
export class MoveHandler implements IHandler {
	type = HandlerEnum.Move;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

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
						this.movingShapes.forEach((s) => s.setState(ShapeStateEnum.Selected));
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
		if (!isOnSelected) {
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

			this.movingShapes.forEach((s) => s.setState(ShapeStateEnum.Selected));
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
	}

	private reset() {
		this.isDragging = false;
		this.movingShapes = [];
		this.startScreenPoint = null;
		this.originBasePropsMap.clear();
	}
}
