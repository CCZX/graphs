import { ShapeData } from '@/canvas/shapes/shape';

export interface ICanvasInitService {
	init(data: ShapeData[]): void;
}
export const ICanvasInitService = Symbol('ICanvasInitService');
