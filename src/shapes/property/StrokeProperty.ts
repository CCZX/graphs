import { AbsProperty } from './AbsProperty';
import { StrokePropertyValue, ShapePropertyEnum, ShapeTypeEnum } from '../shape';
import { BaseShape } from '../BaseShape';
import { BaseProperty } from './BaseProperty';

const DEFAULT_VALUE: StrokePropertyValue = { color: 0x000000, width: 0, alpha: 1 };

export class StrokeProperty extends AbsProperty<StrokePropertyValue> {
	constructor(shape: BaseShape, value?: StrokePropertyValue) {
		super(shape, value || DEFAULT_VALUE);
	}

	update(value: Partial<StrokePropertyValue>): void {
		this.value = { ...this.value, ...value };
		// 触发完整重绘，避免 stroke 叠层
		this.shape.getProperty<BaseProperty>(ShapePropertyEnum.Base)?.draw();
	}

	draw(): void {
		if (this.value.width <= 0) {
			return;
		}

		const { width, height } = this.shape.getWH();

		this.shape.graphics.lineStyle(this.value.width, this.value.color, this.value.alpha);

		if (this.shape.type === ShapeTypeEnum.Rectangle) {
			this.shape.graphics.drawRect(0, 0, width, height);
		}

		if (this.shape.type === ShapeTypeEnum.Circle) {
			this.shape.graphics.drawCircle(0, 0, width / 2);
		}

		this.shape.graphics.lineStyle(0);
	}
}
