import { Stage } from '@/canvas/core/Stage';
import { BaseShape } from '@/shape/BaseShape';

export interface IShapeManager {
	setStage(stage: Stage): void;

	setShape(shape: BaseShape, appendToStage?: boolean): void;

	getShapeById(id: string): BaseShape | undefined;

	getShapeByPoint(point: Point): BaseShape | undefined;

	getAllShapes(): BaseShape[];

	removeShape(id: string): void;
}
export const IShapeManager = Symbol('IShapeManager');
