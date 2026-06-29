import { Point as PixiPoint } from 'pixi.js';
import { BaseShape } from '@/shapes/BaseShape';
import { BaseProperty } from '@/shapes/property/BaseProperty';
import {
	BasePropertyValue,
	ShapePropertyEnum,
	ShapeStateEnum,
	ShapeTypeEnum,
	StrokePropertyValue,
} from '@/shapes/contract';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IActionLogManager, IActionManager } from '@/domain/contract/action';
import { UpdatePropsAction } from '@/domain/service/action/actions/UpdatePropsAction';
import { fluentProvide } from 'inversify-binding-decorators';
import { IHandlerWithInteraction, IHandler } from '@/domain/contract';
import { inject } from 'inversify';
import { IocContainerService } from '@/common/contract';

const MIN_SIZE = 10;
const HANDLE_HIT_RADIUS = 8;
const BORDER_PADDING = 2;

enum Dir {
	TL = 'TL',
	TR = 'TR',
	BR = 'BR',
	BL = 'BL',
	T = 'T',
	R = 'R',
	B = 'B',
	L = 'L',
}

const CURSOR_MAP: Record<Dir, string> = {
	[Dir.TL]: 'nwse-resize',
	[Dir.TR]: 'nesw-resize',
	[Dir.BR]: 'nwse-resize',
	[Dir.BL]: 'nesw-resize',
	[Dir.T]: 'ns-resize',
	[Dir.B]: 'ns-resize',
	[Dir.L]: 'ew-resize',
	[Dir.R]: 'ew-resize',
};

// @ts-expect-error
@fluentProvide(IHandlerWithInteraction).inSingletonScope().done()
export class ResizeHandler implements IHandler {
	type = HandlerEnum.Resize;

	@inject(IActionManager)
	private actionManager!: IActionManager;

	@inject(IActionLogManager)
	private actionLogManager!: IActionLogManager;

	@inject(IocContainerService)
	private ioc!: IocContainerService;

	private isResizing = false;
	private resizingShape: BaseShape | null = null;
	private direction: Dir | null = null;
	private startViewportPoint: Point | null = null;
	private originBaseProps: BasePropertyValue | null = null;

	enable(state: InteractionState): boolean {
		return state.selectedShapes.length === 1;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		switch (e.type) {
			case 'pointermove':
				// 没有按住主按键时不在 resize 中，清除残留状态
				if (e.buttons !== 1 && this.isResizing) {
					this.resizingShape?.setState(ShapeStateEnum.Selected);
					this.reset();
				}
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
		const handle = this.detectHandle(
			state.selectedShapes[0]!,
			payload.viewportPoint,
			payload.scale,
		);
		if (handle) {
			document.body.style.cursor = CURSOR_MAP[handle];
			return false;
		}

		return true;
	}

	private handlePointerDown(state: InteractionState, payload: EventPayload): boolean {
		const handle = this.detectHandle(
			state.selectedShapes[0]!,
			payload.viewportPoint,
			payload.scale,
		);
		if (!handle) {
			return true;
		}

		this.actionLogManager.setStreamStart();

		this.direction = handle;
		this.startViewportPoint = payload.viewportPoint;

		const p = state.selectedShapes[0]!.getProperty<BaseProperty>(ShapePropertyEnum.Base).get();
		this.originBaseProps = { ...p };

		this.isResizing = true;
		this.resizingShape = state.selectedShapes[0]!;

		this.resizingShape.setState(ShapeStateEnum.Resizing);

		return false;
	}

	private handlePointerUp(state: InteractionState): boolean {
		if (!this.isResizing) {
			return true;
		}

		this.actionLogManager.setStreamEnd();

		this.resizingShape?.setState(ShapeStateEnum.Selected);
		if (this.resizingShape) {
			state.selectedShapes[0] = this.resizingShape;
		}

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

		const isCircle = this.resizingShape.type === ShapeTypeEnum.Circle;

		if (isCircle) {
			const d = width;
			let newD: number;

			switch (this.direction) {
				case Dir.T:
					newD = Math.max(MIN_SIZE, d - dy);
					newX = x + (d - newD) / 2;
					newY = y + d - newD;
					break;
				case Dir.B:
					newD = Math.max(MIN_SIZE, d + dy);
					newX = x + (d - newD) / 2;
					break;
				case Dir.L:
					newD = Math.max(MIN_SIZE, d - dx);
					newX = x + d - newD;
					newY = y + (d - newD) / 2;
					break;
				case Dir.R:
					newD = Math.max(MIN_SIZE, d + dx);
					newY = y + (d - newD) / 2;
					break;
				case Dir.BR:
					newD = Math.max(MIN_SIZE, Math.max(d + dx, d + dy));
					break;
				case Dir.TL:
					newD = Math.max(MIN_SIZE, Math.max(d - dx, d - dy));
					newX = x + d - newD;
					newY = y + d - newD;
					break;
				case Dir.TR:
					newD = Math.max(MIN_SIZE, Math.max(d + dx, d - dy));
					newY = y + d - newD;
					break;
				case Dir.BL:
					newD = Math.max(MIN_SIZE, Math.max(d - dx, d + dy));
					newX = x + d - newD;
					break;
			}

			newWidth = newD;
			newHeight = newD;
		} else {
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
				case Dir.T:
					newHeight = Math.max(MIN_SIZE, height - dy);
					newY = y + (height - newHeight);
					break;
				case Dir.B:
					newHeight = Math.max(MIN_SIZE, height + dy);
					break;
				case Dir.L:
					newWidth = Math.max(MIN_SIZE, width - dx);
					newX = x + (width - newWidth);
					break;
				case Dir.R:
					newWidth = Math.max(MIN_SIZE, width + dx);
					break;
			}
		}

		this.actionManager.push(
			new UpdatePropsAction(
				{
					id: this.resizingShape.id,
					propertyType: ShapePropertyEnum.Base,
					props: { x: newX, y: newY, width: newWidth, height: newHeight },
				},
				this.ioc,
			),
		);
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

		// 边缘检测：排除角落区域，避免与角落 handle 冲突
		const cornerExclude = threshold * 2;
		const edges: {
			check: () => boolean;
			dir: Dir;
		}[] = [
			{
				check: () =>
					Math.abs(local.y - (0 - offset)) < threshold &&
					local.x > cornerExclude &&
					local.x < width - cornerExclude,
				dir: Dir.T,
			},
			{
				check: () =>
					Math.abs(local.x - (width + offset)) < threshold &&
					local.y > cornerExclude &&
					local.y < height - cornerExclude,
				dir: Dir.R,
			},
			{
				check: () =>
					Math.abs(local.y - (height + offset)) < threshold &&
					local.x > cornerExclude &&
					local.x < width - cornerExclude,
				dir: Dir.B,
			},
			{
				check: () =>
					Math.abs(local.x - (0 - offset)) < threshold &&
					local.y > cornerExclude &&
					local.y < height - cornerExclude,
				dir: Dir.L,
			},
		];

		for (const edge of edges) {
			if (edge.check()) {
				return edge.dir;
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
