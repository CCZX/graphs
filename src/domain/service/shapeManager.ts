import { Point as PixiPoint } from 'pixi.js';
import { isPointInRect } from '@/shapes/geometry';
import { BaseShape } from '@/shapes/BaseShape';
import { Stage } from '@/canvas/core/Stage';
import { IShapeManager } from '../contract';
import { provide } from 'inversify-binding-decorators';

@provide(IShapeManager)
export class ShapeManager implements IShapeManager {
	private stage!: Stage;
	private shapes: Map<string, BaseShape> = new Map();

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

	removeShape(id: string) {
		const shape = this.shapes.get(id);
		if (shape) {
			this.stage.removeShape(shape.container);
			this.shapes.delete(id);
		}
	}
}
