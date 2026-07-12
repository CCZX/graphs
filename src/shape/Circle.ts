import { Graphics } from 'pixi.js';
import { ShapeContext, ShapeTypeEnum } from './contract';
import { BaseShape } from './BaseShape';

export class Circle extends BaseShape<Graphics> {
	get type(): ShapeTypeEnum {
		return ShapeTypeEnum.Circle;
	}

	constructor(id: string, context: ShapeContext) {
		super(id, new Graphics(), context);
		this.graphics.interactive = true;
	}
}
