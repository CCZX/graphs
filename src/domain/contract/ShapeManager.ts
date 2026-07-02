import { Stage } from '@/canvas/core/Stage';
import { BaseShape } from '@/shapes/BaseShape';
import { Point as PixiPoint } from 'pixi.js';

export interface IShapeManager {
	setStage(stage: Stage): void;

	setShape(shape: BaseShape, appendToStage?: boolean): void;

	getShapeById(id: string): BaseShape | undefined;

	getShapeByPoint(point: Point): BaseShape | undefined;

	getAllShapes(): BaseShape[];

	clientToViewportLocal(clientX: number, clientY: number): PixiPoint;
}
export const IShapeManager = Symbol('IShapeManager');
