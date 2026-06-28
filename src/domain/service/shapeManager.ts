import { Graphics, Point as PixiPoint } from 'pixi.js';
import { isPointInRect } from '@/shapes/geometry';
import { BaseShape } from '@/shapes/BaseShape';
import { Stage } from '@/canvas/core/Stage';
import { IShapeManager } from '../contract';
import { provide } from 'inversify-binding-decorators';

@provide(IShapeManager)
export class ShapeManager implements IShapeManager {
	private stage!: Stage;
	private shapes: Map<string, BaseShape> = new Map();
	private selectedShapes: Map<string, BaseShape> = new Map();

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
