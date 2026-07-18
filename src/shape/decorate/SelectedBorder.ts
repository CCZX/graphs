import { Graphics } from 'pixi.js';
import { HOVER_BORDER } from '../color';
import { ShapeDecorateTypeEnum, ShapePropertyEnum } from '../contract';
import type { StrokePropertyValue } from '../contract';
import { BaseShape } from '../BaseShape';
import { AbsDecorate } from './AbsDecorate';
import { StrokeProperty } from '../property/StrokeProperty';

const HANDLE_RADIUS = 5;
const BORDER_PADDING = 2;
const ROTATE_HANDLE_RADIUS = 4;
const ROTATE_HANDLE_DISTANCE = 16;

export class SelectedBorder extends AbsDecorate {
	public type: ShapeDecorateTypeEnum = ShapeDecorateTypeEnum.SelectedBorder;

	public graphics: Graphics;

	constructor(shape: BaseShape) {
		super(shape);
		this.graphics = new Graphics();
	}

	private getStrokeWidth(): number {
		const stroke = this.shape.getProperty<StrokeProperty>(ShapePropertyEnum.Stroke).value;
		return stroke?.width || 0;
	}

	private draw() {
		const { width, height } = this.shape.getBounds();
		const strokeWidth = this.getStrokeWidth();
		// 让选中框绘制在描边外侧
		const offset = strokeWidth / 2 + BORDER_PADDING;

		this.graphics.clear();
		this.graphics.lineStyle(1, HOVER_BORDER, 1);
		this.graphics.beginFill(0xfff, 0);
		this.graphics.drawRect(
			0 - 0.5 - offset,
			0 - 0.5 - offset,
			width + 0.5 + offset * 2,
			height + 0.5 + offset * 2,
		);

		this.graphics.beginFill(0xffffff, 1);
		this.graphics.lineStyle(1, HOVER_BORDER, 1);
		this.graphics.drawCircle(0 - offset, 0 - offset, HANDLE_RADIUS);
		this.graphics.drawCircle(0 + width + offset, 0 - offset, HANDLE_RADIUS);
		this.graphics.drawCircle(0 + width + offset, 0 + height + offset, HANDLE_RADIUS);
		this.graphics.drawCircle(0 - offset, 0 + height + offset, HANDLE_RADIUS);

		// 旋转 handle：顶部中间的圆点 + 连接线
		const rotateY = 0 - offset - ROTATE_HANDLE_DISTANCE;
		this.graphics.lineStyle(1, HOVER_BORDER, 1);
		this.graphics.moveTo(width / 2, 0 - offset);
		this.graphics.lineTo(width / 2, rotateY);
		this.graphics.beginFill(0xffffff, 1);
		this.graphics.drawCircle(width / 2, rotateY, ROTATE_HANDLE_RADIUS);
		this.graphics.endFill();
	}

	public onActivate() {
		this.draw();
		this.shape.container.addChild(this.graphics);
	}

	public refresh() {
		this.draw();
	}

	public getRotateHandleCenter(): { x: number; y: number } {
		const { width } = this.shape.getBounds();
		const strokeWidth = this.getStrokeWidth();
		const offset = strokeWidth / 2 + BORDER_PADDING;
		return { x: width / 2, y: 0 - offset - ROTATE_HANDLE_DISTANCE };
	}

	public onDeactivate() {
		this.shape.container.removeChild(this.graphics);
	}
}
