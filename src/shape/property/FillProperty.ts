import { Graphics } from 'pixi.js';
import { AbsProperty } from './AbsProperty';
import { FillPropertyValue, ShapeTypeEnum } from '../contract';
import { BaseShape } from '../BaseShape';

const DEFAULT_VALUE: FillPropertyValue = { color: 0x000, alpha: 1 };

export class FillProperty extends AbsProperty<FillPropertyValue> {
	constructor(shape: BaseShape, value?: FillPropertyValue) {
		super(shape, value || DEFAULT_VALUE);
	}

	draw(): void {
		const { width, height } = this.shape.getWH();
		const g = this.shape.graphics as Graphics;

		if (this.shape.type === ShapeTypeEnum.Circle) {
			g.beginFill(this.value.color);
			g.drawCircle(0, 0, width / 2);
			g.endFill();
		}

		if (this.shape.type === ShapeTypeEnum.Rectangle) {
			g.beginFill(this.value.color);
			g.drawRect(0, 0, width, height);
			g.endFill();
		}
	}
}
