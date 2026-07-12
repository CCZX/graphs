import { Stage } from '@/canvas/core/Stage';
import { BaseShape } from '@/shape/BaseShape';
import { Graphics } from 'pixi.js';

export interface ISelectService {
	setStage(stage: Stage): void;

	setSelectedShape(shape: BaseShape): void;
	setMultipleSelectedShapes(shapes: BaseShape[]): void;
	clearSelectedShapes(): void;
	getSelectedShapeById(id: string): BaseShape | undefined;
	getSelectedShapes(): Map<string, BaseShape>;
	removeSelectedShapeById(id: string): void;

	showMultiSelectOverlay(rect: Rectangle): void;
	hideMultiSelectOverlay(): void;
	updateMultiSelectOverlay(shapes: BaseShape[]): void;
	getMultiSelectOverlayRect(): Rectangle | null;

	addMarqueeGraphics(graphics: Graphics): void;
}
export const ISelectService = Symbol('ISelectService');
