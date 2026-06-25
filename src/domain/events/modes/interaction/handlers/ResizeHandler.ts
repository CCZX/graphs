import { Point as PixiPoint } from 'pixi.js';
import { BaseShape } from '@/canvas/shapes/BaseShape';
import { BaseProperty } from '@/canvas/shapes/property/BaseProperty';
import { SelectedBorder } from '@/canvas/shapes/decorate/SelectedBorder';
import {
	BasePropertyValue,
	ShapeDecorateTypeEnum,
	ShapePropertyEnum,
	ShapeStateEnum,
	StrokePropertyValue,
} from '@/canvas/shapes/shape';
import { HandlerEnum, InteractionState, EventPayload } from '../../../types';
import { Handler } from '../../../Handler';

const MIN_SIZE = 10;
const HANDLE_HIT_RADIUS = 8;
const BORDER_PADDING = 2;

enum Dir {
	TL = 'TL',
	TR = 'TR',
	BR = 'BR',
	BL = 'BL',
}

const CURSOR_MAP: Record<Dir, string> = {
	[Dir.TL]: 'nwse-resize',
	[Dir.TR]: 'nesw-resize',
	[Dir.BR]: 'nwse-resize',
	[Dir.BL]: 'nesw-resize',
};

export class ResizeHandler extends Handler {
	type = HandlerEnum.Resize;

	private isResizing = false;
	private resizingShape: BaseShape | null = null;
	private direction: Dir | null = null;
	private startViewportPoint: Point | null = null;
	private originBaseProps: BasePropertyValue | null = null;

	enable(state: InteractionState): boolean {
		return state.selectedShape !== null;
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
		// 正在 resize 中，更新尺寸
		if (this.isResizing) {
			this.applyResize(state, payload.viewportPoint);
			return false;
		}

		// 悬停在 resize handle 上，改光标并打断后续 handler
		const handle = this.detectHandle(state.selectedShape!, payload.viewportPoint, payload.scale);
		if (handle) {
			document.body.style.cursor = CURSOR_MAP[handle];
			return false;
		}

		return true;
	}

	private handlePointerDown(state: InteractionState, payload: EventPayload): boolean {
		const handle = this.detectHandle(state.selectedShape!, payload.viewportPoint, payload.scale);
		if (!handle) {
			return true;
		}

		this.direction = handle;
		this.startViewportPoint = payload.viewportPoint;

		const p = state.selectedShape!.getProperty<BaseProperty>(ShapePropertyEnum.Base).get();
		this.originBaseProps = { ...p };

		this.isResizing = true;
		this.resizingShape = state.selectedShape!;

		this.resizingShape.setState(ShapeStateEnum.Resizing);

		return false;
	}

	private handlePointerUp(state: InteractionState): boolean {
		if (!this.isResizing) {
			return true;
		}

		this.resizingShape?.setState(ShapeStateEnum.Selected);
		state.selectedShape = this.resizingShape;

		this.reset();
		return false;
	}

	private applyResize(state: InteractionState, viewportPoint: Point) {
		if (!this.resizingShape || !this.originBaseProps || !this.direction) {
			return;
		}

		// 转换到容器本地坐标，适配旋转后的 resize
		const start = this.startViewportPoint!;
		const localPoint = this.resizingShape.container.toLocal(
			new PixiPoint(viewportPoint.x, viewportPoint.y),
		);
		const localStart = this.resizingShape.container.toLocal(new PixiPoint(start.x, start.y));
		const dx = localPoint.x - localStart.x;
		const dy = localPoint.y - localStart.y;

		const { x, y, width, height } = this.originBaseProps;
		let newX = x;
		let newY = y;
		let newWidth = width;
		let newHeight = height;

		switch (this.direction) {
			case Dir.BR:
				newWidth = Math.max(MIN_SIZE, width + dx);
				newHeight = Math.max(MIN_SIZE, height + dy);
				break;
			case Dir.TL:
				newWidth = Math.max(MIN_SIZE, width - dx);
				newHeight = Math.max(MIN_SIZE, height - dy);
				newX = x + (width - newWidth);
				newY = y + (height - newHeight);
				break;
			case Dir.TR:
				newWidth = Math.max(MIN_SIZE, width + dx);
				newHeight = Math.max(MIN_SIZE, height - dy);
				newY = y + (height - newHeight);
				break;
			case Dir.BL:
				newWidth = Math.max(MIN_SIZE, width - dx);
				newHeight = Math.max(MIN_SIZE, height + dy);
				newX = x + (width - newWidth);
				break;
		}

		this.resizingShape.updateProperty(ShapePropertyEnum.Base, {
			x: newX,
			y: newY,
			width: newWidth,
			height: newHeight,
		});

		const border = this.resizingShape.getDecorate(
			ShapeDecorateTypeEnum.SelectedBorder,
		) as SelectedBorder;
		border?.refresh();
	}

	private detectHandle(shape: BaseShape, vp: Point, scale: number): Dir | null {
		const { width, height } = shape.getBounds();
		const threshold = HANDLE_HIT_RADIUS / scale;

		const stroke = shape.getProperty<any>(ShapePropertyEnum.Stroke)?.get() as StrokePropertyValue;
		const strokeWidth = stroke?.width || 0;
		const offset = strokeWidth / 2 + BORDER_PADDING;

		// 转换到容器本地坐标，适配旋转后的 resize 热区检测
		const local = shape.container.toLocal(new PixiPoint(vp.x, vp.y));

		const corners: { px: number; py: number; dir: Dir }[] = [
			{ px: 0 - offset, py: 0 - offset, dir: Dir.TL },
			{ px: width + offset, py: 0 - offset, dir: Dir.TR },
			{ px: width + offset, py: height + offset, dir: Dir.BR },
			{ px: 0 - offset, py: height + offset, dir: Dir.BL },
		];

		for (const c of corners) {
			if (Math.abs(local.x - c.px) < threshold && Math.abs(local.y - c.py) < threshold) {
				return c.dir;
			}
		}

		return null;
	}

	private reset() {
		this.isResizing = false;
		this.resizingShape = null;
		this.direction = null;
		this.startViewportPoint = null;
		this.originBaseProps = null;
	}
}
