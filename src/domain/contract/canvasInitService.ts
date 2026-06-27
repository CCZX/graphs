import { ShapeData } from '@/shapes/shape';

export interface ICanvasInitService {
	init(data: ShapeData[]): void;
}
export const ICanvasInitService = Symbol('ICanvasInitService');
