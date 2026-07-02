import { Point as PixiPoint } from 'pixi.js';
import { BaseShape } from '@/shapes/BaseShape';
import { BaseProperty } from '@/shapes/property/BaseProperty';
import { SelectedBorder } from '@/shapes/decorate/SelectedBorder';
import {
	BasePropertyValue,
	ShapeDecorateTypeEnum,
	ShapePropertyEnum,
	ShapeStateEnum,
} from '@/shapes/contract';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IHandlerWithInteraction, IHandler } from '@/domain/contract';
import { fluentProvideWithSingle } from '@/common/context';

const ROTATE_HANDLE_HIT_RADIUS = 12;

@fluentProvideWithSingle(IHandlerWithInteraction)
export class RotateHandler implements IHandler {
	type = HandlerEnum.Rotate;

	private isRotating = false;
	private rotatingShape: BaseShape | null = null;
	private originRotation = 0;

	enable(state: InteractionState): boolean {
		return state.selectedShapes.length === 1;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		switch (e.type) {
			case 'pointermove':
				return this.handlePointerMove(state, payload);
			case 'pointerdown':
				return this.handlePointerDown(state, payload);
			case 'pointerup':
				return this.handlePointerUp(state);
			default:
				return true;
		}
	}

	private handlePointerMove(state: InteractionState, payload: EventPayload): boolean {
		if (this.isRotating) {
			this.applyRotate(payload.viewportPoint);
			return false;
		}

		if (this.isOverRotateHandle(state.selectedShapes[0]!, payload.viewportPoint, payload.scale)) {
			document.body.style.cursor = 'grabbing';
			return false;
		}

		return true;
	}

	private handlePointerDown(state: InteractionState, payload: EventPayload): boolean {
		const shape = state.selectedShapes[0]!;
		if (!this.isOverRotateHandle(shape, payload.viewportPoint, payload.scale)) {
			return true;
		}

		const p = shape.getProperty<BaseProperty>(ShapePropertyEnum.Base).get() as BasePropertyValue;
		this.originRotation = p.rotation || 0;

		this.isRotating = true;
		this.rotatingShape = shape;
		this.rotatingShape.setState(ShapeStateEnum.Rotating);

		return false;
	}

	private handlePointerUp(state: InteractionState): boolean {
		if (!this.isRotating) {
			return true;
		}

		this.rotatingShape?.setState(ShapeStateEnum.Selected);
		if (this.rotatingShape) {
			state.selectedShapes[0] = this.rotatingShape;
		}
		this.reset();
		return false;
	}

	private applyRotate(vp: Point) {
		if (!this.rotatingShape) {
			return;
		}

		const center = this.getShapeWorldCenter(this.rotatingShape);
		const angle = Math.atan2(vp.y - center.y, vp.x - center.x) * (180 / Math.PI) + 90;

		// 规范化角度为 0-360
		const normalized = ((angle % 360) + 360) % 360;

		this.rotatingShape.updateProperty(ShapePropertyEnum.Base, {
			rotation: normalized,
		});
	}

	private isOverRotateHandle(shape: BaseShape, vp: Point, scale: number): boolean {
		const border = shape.getDecorate(ShapeDecorateTypeEnum.SelectedBorder) as SelectedBorder;
		if (!border) {
			return false;
		}

		const localCenter = border.getRotateHandleCenter();
		// 转换到世界坐标
		const global = shape.container.toGlobal(new PixiPoint(localCenter.x, localCenter.y));
		const threshold = ROTATE_HANDLE_HIT_RADIUS / scale;

		return Math.abs(vp.x - global.x) < threshold && Math.abs(vp.y - global.y) < threshold;
	}

	private getShapeWorldCenter(shape: BaseShape): { x: number; y: number } {
		// container.x/y 已经是图形中心的世界坐标（BaseProperty.draw 中设置）
		return { x: shape.container.x, y: shape.container.y };
	}

	private reset() {
		this.isRotating = false;
		this.rotatingShape = null;
		this.originRotation = 0;
	}
}
