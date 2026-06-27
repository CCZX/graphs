import { AbsProperty } from './AbsProperty';
import { BasePropertyValue, ShapePropertyEnum, ShapeTypeEnum } from '../contract';
import { BaseShape } from '../BaseShape';
import { FillProperty } from './FillProperty';
import { StrokeProperty } from './StrokeProperty';

const DEFAULT_VALUE: BasePropertyValue = { x: 0, y: 0, width: 100, height: 100 };

export class BaseProperty extends AbsProperty<BasePropertyValue> {
	constructor(shape: BaseShape, value?: BasePropertyValue) {
		super(shape, value || DEFAULT_VALUE);
	}

	draw(): void {
		const { x, y, width, height, rotation = 0 } = this.value;

		// pivot 设为图形中心，position 也设为中心，rotation 绕中心旋转
		this.shape.container.x = x + width / 2;
		this.shape.container.y = y + height / 2;
		this.shape.container.pivot.set(width / 2, height / 2);
		this.shape.container.angle = rotation;

		this.shape.graphics.clear();

		if (this.shape.type === ShapeTypeEnum.Rectangle) {
			this.shape.graphics.position.set(0, 0);
			this.shape.graphics.beginFill();
			this.shape.graphics.drawRect(0, 0, width, height);
			this.shape.graphics.endFill();
		}

		if (this.shape.type === ShapeTypeEnum.Circle) {
			this.shape.graphics.position.set(width / 2, height / 2);
		}

		const fill = this.shape.getProperty<FillProperty>(ShapePropertyEnum.Fill);
		fill?.draw();

		const stroke = this.shape.getProperty<StrokeProperty>(ShapePropertyEnum.Stroke);
		stroke?.draw();
	}
}
