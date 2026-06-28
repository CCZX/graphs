import { Graphics } from 'pixi.js';
import { HandlerEnum, InteractionState, EventPayload } from '../../../../../contract/eventManager';
import { IHandler, IHandlerWithInteraction, IShapeManager } from '@/domain/contract';
import { isRectIntersect } from '@/shapes/geometry';
import { ShapeStateEnum } from '@/shapes/contract';
import { selectionStore } from '@/store/selection';
import { fluentProvide } from 'inversify-binding-decorators';
import { inject } from 'inversify';

const DRAG_THRESHOLD = 3;

// @ts-expect-error
@fluentProvide(IHandlerWithInteraction).inSingletonScope().done()
export class MarqueeHandler implements IHandler {
	type = HandlerEnum.Marquee;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	private isDragging = false;
	private startClientX = 0;
	private startClientY = 0;
	private hasStart = false;
	private marquee: Graphics | null = null;
	private lastViewportX = 0;
	private lastViewportY = 0;

	enable(_state: InteractionState): boolean {
		return true;
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		switch (e.type) {
			case 'pointerdown':
				return this.handlePointerDown(payload);
			case 'pointermove':
				// 没有按住主按键时不处理拖拽，清除残留状态
				if (e.buttons !== 1) {
					if (this.isDragging || this.hasStart) {
						this.removeMarquee();
						this.reset();
					}
					return true;
				}
				return this.handlePointerMove(payload);
			case 'pointerup':
				return this.handlePointerUp(state);
			default:
				return true;
		}
	}

	private handlePointerDown(payload: EventPayload): boolean {
		const shapeUnderCursor = this.shapeManager.getShapeByPoint(payload.viewportPoint);

		// 点击在图形上，不启动框选
		if (shapeUnderCursor) {
			return true;
		}

		this.startClientX = payload.viewportPoint.x;
		this.startClientY = payload.viewportPoint.y;
		this.hasStart = true;
		return true;
	}

	private handlePointerMove(payload: EventPayload): boolean {
		if (!this.hasStart) {
			return true;
		}

		this.lastViewportX = payload.viewportPoint.x;
		this.lastViewportY = payload.viewportPoint.y;

		const dx = payload.viewportPoint.x - this.startClientX;
		const dy = payload.viewportPoint.y - this.startClientY;

		if (!this.isDragging) {
			if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
				return true;
			}
			this.isDragging = true;
		}

		this.updateMarquee(payload);
		return false;
	}

	private handlePointerUp(state: InteractionState): boolean {
		if (this.isDragging) {
			this.selectShapesInMarquee(state);
			this.removeMarquee();
			this.reset();
			return false;
		}

		this.reset();
		return true;
	}

	private updateMarquee(payload: EventPayload) {
		// startClientX/Y and payload.viewportPoint are both in viewport coordinates
		const x = Math.min(this.startClientX, payload.viewportPoint.x);
		const y = Math.min(this.startClientY, payload.viewportPoint.y);
		const w = Math.abs(payload.viewportPoint.x - this.startClientX);
		const h = Math.abs(payload.viewportPoint.y - this.startClientY);

		if (!this.marquee) {
			this.marquee = new Graphics();
			this.shapeManager.addMarqueeGraphics(this.marquee);
		}

		this.marquee.clear();
		this.marquee.lineStyle(1, 0x4a90d9, 1);
		this.marquee.beginFill(0x4a90d9, 0.1);
		this.marquee.drawRect(x, y, w, h);
		this.marquee.endFill();
	}

	private selectShapesInMarquee(state: InteractionState) {
		const marqueeRect = {
			x: Math.min(this.startClientX, this.lastViewportX),
			y: Math.min(this.startClientY, this.lastViewportY),
			width: Math.abs(this.lastViewportX - this.startClientX),
			height: Math.abs(this.lastViewportY - this.startClientY),
		};

		const allShapes = this.shapeManager.getAllShapes();
		const intersectingShapes = allShapes.filter((shape) => {
			const bounds = shape.getBounds();
			// container position is center, pivot is at center, bounds start at (0,0)
			// so top-left in viewport is container - half bounds
			const shapeRect = {
				x: shape.container.x - bounds.width / 2,
				y: shape.container.y - bounds.height / 2,
				width: bounds.width,
				height: bounds.height,
			};
			return isRectIntersect(marqueeRect, shapeRect);
		});

		this.shapeManager.setMultipleSelectedShapes(intersectingShapes);

		// Update InteractionState for handlers
		state.selectedShape = intersectingShapes.length > 0 ? intersectingShapes[0] : null;

		// Update selection store for UI
		if (intersectingShapes.length > 0) {
			selectionStore.getState().setSelectedShapeId(intersectingShapes[0].id);
		} else {
			selectionStore.getState().setSelectedShapeId(null);
		}

		// Update shape states
		intersectingShapes.forEach((shape) => {
			shape.setState(ShapeStateEnum.Selected);
		});

		// Reset non-intersecting selected shapes to Normal
		allShapes
			.filter((shape) => !intersectingShapes.includes(shape))
			.forEach((shape) => {
				if (shape.getState() === ShapeStateEnum.Selected) {
					shape.setState(ShapeStateEnum.Normal);
				}
			});
	}

	private removeMarquee() {
		if (this.marquee) {
			this.marquee.removeFromParent();
			this.marquee.destroy();
			this.marquee = null;
		}
	}

	private reset() {
		this.isDragging = false;
		this.hasStart = false;
		this.startClientX = 0;
		this.startClientY = 0;
		this.lastViewportX = 0;
		this.lastViewportY = 0;
	}
}
