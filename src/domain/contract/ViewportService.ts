import { Stage } from '@/canvas/core/Stage';
import { Point as PixiPoint } from 'pixi.js';

export interface IViewportService {
	setStage(stage: Stage): void;
	clientToViewportLocal(clientX: number, clientY: number): PixiPoint;
}
export const IViewportService = Symbol('IViewportService');
