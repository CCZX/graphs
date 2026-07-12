import { AbsProperty } from './AbsProperty';
import { LinePropertyValue, ShapePropertyEnum } from '../contract';
import { BaseShape } from '../BaseShape';
import { StrokeProperty } from './StrokeProperty';
import { Graphics } from 'pixi.js';

const DEFAULT_VALUE: LinePropertyValue = {
	start: { x: 0, y: 0 },
	end: { x: 100, y: 100 },
	routing: 'straight',
};

export class LineProperty extends AbsProperty<LinePropertyValue> {
	constructor(shape: BaseShape, value?: LinePropertyValue) {
		super(shape, value || DEFAULT_VALUE);
	}

	draw(): void {
		const v = this.value;
		const g = this.shape.graphics as Graphics;

		// 从端点计算包围盒
		const minX = Math.min(v.start.x, v.end.x);
		const minY = Math.min(v.start.y, v.end.y);
		const maxX = Math.max(v.start.x, v.end.x);
		const maxY = Math.max(v.start.y, v.end.y);

		// 容器定位到包围盒中心
		this.shape.container.x = minX + (maxX - minX) / 2;
		this.shape.container.y = minY + (maxY - minY) / 2;
		this.shape.container.pivot.set((maxX - minX) / 2, (maxY - minY) / 2);

		// 世界坐标 → 本地坐标
		const x1 = v.start.x - minX;
		const y1 = v.start.y - minY;
		const x2 = v.end.x - minX;
		const y2 = v.end.y - minY;

		g.clear();

		// stroke
		const stroke = this.shape.getProperty<StrokeProperty>(ShapePropertyEnum.Stroke);
		const sv = stroke?.value;
		const color = sv?.color ?? 0x000000;
		const alpha = sv?.alpha ?? 1;
		const width = sv?.width ?? 1;

		// 画线
		g.lineStyle(width, color, alpha);
		g.moveTo(x1, y1);
		g.lineTo(x2, y2);
		g.lineStyle(0);

		// 箭头（实心三角）
		if (v.startArrow) {
			g.beginFill(color, alpha);
			this.drawArrowhead(x2, y2, x1, y1, g);
			g.endFill();
		}
		if (v.endArrow) {
			g.beginFill(color, alpha);
			this.drawArrowhead(x1, y1, x2, y2, g);
			g.endFill();
		}
	}

	private drawArrowhead(fromX: number, fromY: number, toX: number, toY: number, g: Graphics) {
		const angle = Math.atan2(toY - fromY, toX - fromX);
		const size = 10;
		const spread = Math.PI / 6;

		g.moveTo(toX, toY);
		g.lineTo(toX - size * Math.cos(angle - spread), toY - size * Math.sin(angle - spread));
		g.lineTo(toX - size * Math.cos(angle + spread), toY - size * Math.sin(angle + spread));
		g.lineTo(toX, toY);
	}
}
