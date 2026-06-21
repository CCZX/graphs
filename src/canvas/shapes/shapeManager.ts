import { Point as PixiPoint } from 'pixi.js';
import { Point } from '../../types/geometry';
import { isPointInRect } from '../../utils/geometry';
import { BaseShape } from './BaseShape';

class ShapeManager {
	private shapes: Map<string, BaseShape> = new Map();
	private selectedShapes: Map<string, BaseShape> = new Map();

	setShape(shape: BaseShape) {
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

	setSelectedShape(shape: BaseShape) {
		this.selectedShapes.set(shape.id, shape);
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
}

export const shapeManager = new ShapeManager();
