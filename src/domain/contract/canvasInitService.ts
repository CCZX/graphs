import { ShapeData } from '@/shapes/contract';

export interface ICanvasInitService {
	init(data: ShapeData[], ioc: IocContainer): void;
}
export const ICanvasInitService = Symbol('ICanvasInitService');
