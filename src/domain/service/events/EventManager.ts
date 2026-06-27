import { viewportStore } from '@/store/viewport';
import { InteractionState, EventPayload } from './types';
import { AbsEventMode } from './modes/AbsEventMode';
import { InteractionMode } from './modes/interaction/InteractionMode';
import { CreatorMode } from './modes/creator/CreatorMode';
import { throttle as lodashThrottle } from 'lodash';
import { provide } from 'inversify-binding-decorators';
import { IEventManager } from '../../contract';
import { IocContainerService } from '@/common/contract';
import { inject } from 'inversify';

interface Param {
	viewport: {
		x: number;
		y: number;
		scale: number;
	};
	point: { x: number; y: number };
}

/**
 * canvas 坐标转为 viewport 坐标
 * @param param
 * @returns
 */
export function transformCanvasCoordinateToViewport(param: Param) {
	const { viewport, point } = param;

	const matrix = new window.DOMMatrix();
	matrix.scaleSelf(1 / viewport.scale);
	matrix.translateSelf(-viewport.x, -viewport.y);

	const transformX = matrix.a * point.x + matrix.c * point.y + matrix.e;
	const transformY = matrix.b * point.x + matrix.d * point.y + matrix.f;

	return { x: transformX, y: transformY };
}

/**
 *
 * @param delay
 */
export function throttle<T extends object>(delay: number) {
	return function (_target: T, _key: string, descriptor: PropertyDescriptor) {
		const lastTime = 0;
		let timer: number;

		const originalValue = descriptor.value as (...args: any[]) => any;

		descriptor.value = lodashThrottle(originalValue, delay);

		return descriptor;
	};
}

@provide(IEventManager)
export class EventManager implements IEventManager {
	/** 跨 handler 共享的可变状态 */
	private state: InteractionState = {
		hoveredShape: null,
		selectedShape: null,
	};

	private eventModeList: AbsEventMode[] = [];
	private activeMode: AbsEventMode | null = null;
	private canvasEl: HTMLElement | null = null;

	@inject(IocContainerService)
	private ioc!: IocContainerService;

	private getEventPayload(e: PointerEvent): EventPayload {
		return {
			viewportPoint: transformCanvasCoordinateToViewport({
				point: { x: e.clientX, y: e.clientY },
				viewport: viewportStore.getState(),
			}),
			screenPoint: { x: e.pageX, y: e.pageY },
			scale: viewportStore.getState().scale,
		};
	}

	private dispatch(e: PointerEvent) {
		const mode = this.eventModeList.find((m) => m.enable()) || null;

		if (mode !== this.activeMode) {
			this.activeMode?.onDeactivate();
			this.activeMode = mode;
			mode?.onActivate();
		}

		if (!this.activeMode) {
			return;
		}

		const payload = this.getEventPayload(e);

		for (const handler of this.activeMode.handlerList) {
			if (!handler.enable(this.state)) {
				continue;
			}
			const shouldContinue = handler.execute(e, this.state, payload);
			if (!shouldContinue) {
				break;
			}
		}
	}

	@throttle<EventManager>(16)
	private onPointermove(e: PointerEvent) {
		this.dispatch(e);
	}

	@throttle<EventManager>(17)
	private onPointerdown(e: PointerEvent) {
		// 仅响应画布区域内的 pointerdown，避免点击属性面板等外部 UI 时触发选中逻辑
		if (this.canvasEl && !this.canvasEl.contains(e.target as Node)) {
			return;
		}
		this.dispatch(e);
	}

	private onPointerup(e: PointerEvent) {
		this.dispatch(e);
	}

	private _onPointermove = this.onPointermove.bind(this);

	public start(canvasEl: HTMLElement) {
		this.canvasEl = canvasEl;
		this.eventModeList = [new InteractionMode(this.ioc), new CreatorMode(this.ioc)];

		document.addEventListener('pointermove', this._onPointermove);
		document.addEventListener('pointerdown', this.onPointerdown.bind(this));
		document.addEventListener('pointerup', this.onPointerup.bind(this));
	}
}
