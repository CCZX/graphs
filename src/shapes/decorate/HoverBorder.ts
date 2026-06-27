import { Graphics } from 'pixi.js';
import { HOVER_BORDER } from '../color';
import { ShapeDecorateTypeEnum, ShapePropertyEnum } from '../shape';
import type { StrokePropertyValue } from '../shape';
import { BaseShape } from '../BaseShape';
import { AbsDecorate } from './AbsDecorate';

const BORDER_PADDING = 2;

export class HoverBorder extends AbsDecorate {
	type: ShapeDecorateTypeEnum = ShapeDecorateTypeEnum.HoverBorder;

	graphics: Graphics;

	constructor(shape: BaseShape) {
		super(shape);
		this.graphics = new Graphics();
	}

	onActivate() {
		const { width, height } = this.shape.getBounds();

		const stroke = this.shape
			.getProperty<any>(ShapePropertyEnum.Stroke)
			?.get() as StrokePropertyValue;
		const strokeWidth = stroke?.width || 0;
		const offset = strokeWidth / 2 + BORDER_PADDING;

		const graphics = new Graphics();
		this.graphics = graphics;
		this.graphics.lineStyle(2, HOVER_BORDER, 1);
		this.graphics.beginFill(0xfff, 0);
		this.graphics.drawRect(0 - offset, 0 - offset, width + offset * 2, height + offset * 2);

		this.shape.container.addChild(this.graphics);
	}

	onDeactivate() {
		this.shape.container.removeChild(this.graphics);
	}
}
