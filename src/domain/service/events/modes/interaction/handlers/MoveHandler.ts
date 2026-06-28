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
				// 没有按住主按键时不处理拖拽，清除残留状态
				if (e.buttons !== 1) {
					if (this.isDragging) {
						this.movingShape?.setState(ShapeStateEnum.Selected);
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
		if (shapeUnderCursor?.id !== state.selectedShape?.id) {
			return true;
		}
		if (!state.selectedShape) {
			return true;
		}

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

			this.actionLogManager.setStreamStart();

			this.isDragging = true;
			this.movingShape = state.selectedShape!;
			this.movingShape.setState(ShapeStateEnum.Moving);
			return false;
		}

		return true;
	}

	private handlePointerUp(_state: InteractionState): boolean {
		if (this.isDragging) {
			this.actionLogManager.setStreamEnd();

			this.movingShape?.setState(ShapeStateEnum.Selected);
			this.reset();
			return false;
		}

		this.reset();
		return true;
	}

	private applyMove(screenPoint: Point) {
		if (!this.movingShape || !this.originBaseProps || !this.startScreenPoint) {
			return;
		}

		this.actionManager.push(
			new UpdatePropsAction(
				{
					id: this.movingShape.id,
					propertyType: ShapePropertyEnum.Base,
					props: {
						x: this.originBaseProps.x + (screenPoint.x - this.startScreenPoint.x),
						y: this.originBaseProps.y + (screenPoint.y - this.startScreenPoint.y),
					},
				},
				this.ioc,
			),
		);
	}

	private reset() {
		this.isDragging = false;
		this.movingShape = null;
		this.startScreenPoint = null;
		this.originBaseProps = null;
	}
}
