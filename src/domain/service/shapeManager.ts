import { Graphics, Point as PixiPoint } from 'pixi.js';
import { getShapesAABB, isPointInRect } from '@/shapes/geometry';
import { BaseShape } from '@/shapes/BaseShape';
import { Stage } from '@/canvas/core/Stage';
import { IShapeManager } from '../contract';
import { provide } from 'inversify-binding-decorators';

const MULTI_SELECT_COLOR = 0x4a90d9;
const HANDLE_SIZE = 8;

@provide(IShapeManager)
export class ShapeManager implements IShapeManager {
	private stage!: Stage;
	private shapes: Map<string, BaseShape> = new Map();
	private selectedShapes: Map<string, BaseShape> = new Map();
	private multiSelectOverlay: Graphics | null = null;
	private overlayRect: Rectangle | null = null;

	setStage(stage: Stage) {
		this.stage = stage;
	}

	setShape(shape: BaseShape, appendToStage = true) {
		if (appendToStage) {
			this.stage.appendShape(shape.container);
		}
		this.shapes.set(shape.id, shape);
	}

	getShapeById(id: string) {
		return this.shapes.get(id);
	}

	getShapeByPoint(point: Point) {
		for (const [, shape] of this.shapes) {
			// 转换到容器本地坐标，适配旋转后的碰撞检测
			const local = shape.container.toLocal(new PixiPoint(point.x, point.y));
			const bounds = shape.getBounds();
			if (isPointInRect({ x: local.x, y: local.y }, bounds)) {
				return shape;
			}
		}
	}

	getAllShapes(): BaseShape[] {
		return Array.from(this.shapes.values());
	}

	setSelectedShape(shape: BaseShape) {
		this.selectedShapes.set(shape.id, shape);
	}

	setMultipleSelectedShapes(shapes: BaseShape[]) {
		this.selectedShapes.clear();
		shapes.forEach((shape) => this.selectedShapes.set(shape.id, shape));
	}

	clearSelectedShapes() {
		this.selectedShapes.clear();
	}

	getSelectedShapeById(id: string) {
		return this.selectedShapes.get(id);
	}

	getSelectedShapes() {
		return this.selectedShapes;
	}

	removeSelectedShapeById(id: string) {
		this.selectedShapes.delete(id);
	}

	showMultiSelectOverlay(rect: Rectangle) {
		this.overlayRect = rect;
		if (!this.multiSelectOverlay) {
			this.multiSelectOverlay = new Graphics();
			this.stage.getViewport().addChild(this.multiSelectOverlay);
		}
		this.drawOverlay(rect);
	}

	hideMultiSelectOverlay() {
		if (this.multiSelectOverlay) {
			this.multiSelectOverlay.removeFromParent();
			this.multiSelectOverlay.destroy();
			this.multiSelectOverlay = null;
			this.overlayRect = null;
		}
	}

	updateMultiSelectOverlay(shapes: BaseShape[]) {
		if (shapes.length < 2) {
			this.hideMultiSelectOverlay();
			return;
		}
		const rect = getShapesAABB(shapes);
		this.showMultiSelectOverlay(rect);
	}

	getMultiSelectOverlayRect(): Rectangle | null {
		return this.overlayRect;
	}

	private drawOverlay(rect: Rectangle) {
		const g = this.multiSelectOverlay!;
		g.clear();

		const offset = 4;
		const x = rect.x - offset;
		const y = rect.y - offset;
		const w = rect.width + offset * 2;
		const h = rect.height + offset * 2;

		// 矩形边框
		g.lineStyle(1, MULTI_SELECT_COLOR, 0.8);
		g.beginFill(0x4a90d9, 0.05);
		g.drawRect(x, y, w, h);
		g.endFill();

		// 四个角手柄
		g.beginFill(MULTI_SELECT_COLOR, 1);
		const hs = HANDLE_SIZE;
		const corners = [
			{ x: x - hs / 2, y: y - hs / 2 },
			{ x: x + w - hs / 2, y: y - hs / 2 },
			{ x: x + w - hs / 2, y: y + h - hs / 2 },
			{ x: x - hs / 2, y: y + h - hs / 2 },
		];
		for (const c of corners) {
			g.drawRect(c.x, c.y, hs, hs);
		}
		g.endFill();
	}

	addMarqueeGraphics(graphics: Graphics) {
		this.stage.getViewport().addChild(graphics);
	}

	clientToViewportLocal(clientX: number, clientY: number): PixiPoint {
		const viewport = this.stage.getViewport();
		const canvasRect = viewport.canvasEl.getBoundingClientRect();
		const stageX = clientX - canvasRect.left;
		const stageY = clientY - canvasRect.top;
		return viewport.toLocal(new PixiPoint(stageX, stageY));
	}
}
