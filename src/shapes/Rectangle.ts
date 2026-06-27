import { Graphics } from 'pixi.js';
import { ShapeContext, ShapeTypeEnum } from './contract';
import { BaseShape } from './BaseShape';

export class Rectangle extends BaseShape<Graphics> {
	type: ShapeTypeEnum = ShapeTypeEnum.Rectangle;

	constructor(id: string, context: ShapeContext) {
		super(id, new Graphics(), context);
	}
}
