import { Point as PixiPoint } from 'pixi.js';
import { isPointInRect } from '@/shape/geometry';
import { BaseShape } from '@/shape/BaseShape';
import { Stage } from '@/canvas/core/Stage';
import { IShapeManager, IViewportService } from '../contract';
import { provide } from 'inversify-binding-decorators';
import { inject } from 'inversify';

@provide(IShapeManager)
export class ShapeManager implements IShapeManager {
	@inject(IViewportService)
	private viewportService!: IViewportService;

	private shapes: Map<string, BaseShape> = new Map();

	setShape(shape: BaseShape, appendToStage = true) {
		if (appendToStage) {
			const stage = this.viewportService.getStage();
			stage.appendShape(shape.container);
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
			const stage = this.viewportService.getStage();
			stage.removeShape(shape.container);
			this.shapes.delete(id);
		}
	}
}
