import { Stage } from '@/canvas/core/Stage';
import { BaseShape } from '@/shapes/BaseShape';

export interface IShapeManager {
	setStage(stage: Stage): void;

	setShape(shape: BaseShape, appendToStage?: boolean): void;

	getShapeById(id: string): BaseShape | undefined;

	getShapeByPoint(point: Point): BaseShape | undefined;

	getAllShapes(): BaseShape[];
}
export const IShapeManager = Symbol('IShapeManager');
