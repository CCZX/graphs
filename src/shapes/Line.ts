import { Graphics } from 'pixi.js';
import { ShapeContext, ShapePropertyEnum, ShapeTypeEnum } from './contract';
import { BaseShape } from './BaseShape';
import { LineProperty } from './property/LineProperty';

export class Line extends BaseShape<Graphics> {
	type = ShapeTypeEnum.Line;

	constructor(id: string, context: ShapeContext) {
		super(id, new Graphics(), context);
		this.graphics.interactive = true;
	}

	protected initProperty() {
		super.initProperty();
		this.propertyMap.set(ShapePropertyEnum.Line, new LineProperty(this));
	}
}
