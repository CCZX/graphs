import { Stage } from '@/canvas/core/Stage';
import { BaseShape } from '@/shapes/BaseShape';
import { Graphics, Point as PixiPoint } from 'pixi.js';

export interface IShapeManager {
	setStage(stage: Stage): void;

	setShape(shape: BaseShape, appendToStage?: boolean): void;

	getShapeById(id: string): BaseShape | undefined;

	getShapeByPoint(point: Point): BaseShape | undefined;

	getAllShapes(): BaseShape[];

	setSelectedShape(shape: BaseShape): void;

	setMultipleSelectedShapes(shapes: BaseShape[]): void;

	clearSelectedShapes(): void;

	getSelectedShapeById(id: string): BaseShape | undefined;

	getSelectedShapes(): Map<string, BaseShape>;

	removeSelectedShapeById(id: string): void;

	addMarqueeGraphics(graphics: Graphics): void;

	clientToViewportLocal(clientX: number, clientY: number): PixiPoint;
}
export const IShapeManager = Symbol('IShapeManager');
