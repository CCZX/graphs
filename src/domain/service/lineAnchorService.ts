import { ShapePropertyEnum, ShapeTypeEnum } from '@/shape/contract';
import { LineProperty } from '@/shape/property/LineProperty';
import { ILineAnchorService } from '../contract/LineAnchorService';
import { IShapeManager } from '../contract';
import { provide } from 'inversify-binding-decorators';
import { inject } from 'inversify';

/**
 * 连线锚定簿记中心：锚定端点的 x/y 是派生数据（shapeId + anchor + 目标图形 base），
 * 回写走 shape.updateProperty 直接应用、不进 ActionLog——undo 恢复目标图形后
 * 重放同样流经 execute 层，端点会从恢复后的 base 重新推导。
 */
@provide(ILineAnchorService)
export class LineAnchorService implements ILineAnchorService {
	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	public reanchor(changedShapeIds: Set<string>): void {
		for (const shape of this.shapeManager.getAllShapes()) {
			if (shape.type !== ShapeTypeEnum.Line) {
				continue;
			}

			const lineProp = shape.getProperty<LineProperty>(ShapePropertyEnum.Line);
			if (!lineProp) {
				continue;
			}
			const v = lineProp.value;

			const startHit = !!v.start.shapeId && changedShapeIds.has(v.start.shapeId);
			const endHit = !!v.end.shapeId && changedShapeIds.has(v.end.shapeId);
			if (!startHit && !endHit) {
				continue;
			}

			const newStart = { ...v.start };
			const newEnd = { ...v.end };
			if (startHit) {
				const pt = lineProp.resolveEndpoint(v.start, v.end);
				newStart.x = pt.x;
				newStart.y = pt.y;
			}
			if (endHit) {
				const pt = lineProp.resolveEndpoint(v.end, v.start);
				newEnd.x = pt.x;
				newEnd.y = pt.y;
			}

			shape.updateProperty(ShapePropertyEnum.Line, { ...v, start: newStart, end: newEnd });
		}
	}

	public detach(removedShapeIds: Set<string>): void {
		for (const shape of this.shapeManager.getAllShapes()) {
			if (shape.type !== ShapeTypeEnum.Line) {
				continue;
			}

			const lineProp = shape.getProperty<LineProperty>(ShapePropertyEnum.Line);
			if (!lineProp) {
				continue;
			}
			const v = lineProp.value;

			let changed = false;
			const newStart = { ...v.start };
			const newEnd = { ...v.end };

			if (v.start.shapeId && removedShapeIds.has(v.start.shapeId)) {
				delete newStart.shapeId;
				delete newStart.anchor;
				changed = true;
			}
			if (v.end.shapeId && removedShapeIds.has(v.end.shapeId)) {
				delete newEnd.shapeId;
				delete newEnd.anchor;
				changed = true;
			}

			if (changed) {
				shape.setProperty(ShapePropertyEnum.Line, { ...v, start: newStart, end: newEnd });
			}
		}
	}
}
