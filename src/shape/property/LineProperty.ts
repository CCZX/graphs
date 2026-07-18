import { AbsProperty } from './AbsProperty';
import { LineEndpointValue, LinePropertyValue, ShapePropertyEnum } from '../contract';
import { BaseShape } from '../BaseShape';
import { BaseProperty } from './BaseProperty';
import { StrokeProperty } from './StrokeProperty';
import { catmullRomToBezier, cubicBezierPoint, getShapeAnchorPoint } from '../geometry';
import { Graphics } from 'pixi.js';
import { IShapeManager } from '@/domain/contract';
import { IocContainerService } from '@/common/contract';

const DEFAULT_VALUE: LinePropertyValue = {
	start: { x: 0, y: 0 },
	end: { x: 100, y: 100 },
	routing: 'straight',
};

/** 途经点数量上限 */
export const MAX_MID_POINTS = 1;

export class LineProperty extends AbsProperty<LinePropertyValue> {
	constructor(shape: BaseShape, value?: LinePropertyValue) {
		super(shape, value || DEFAULT_VALUE);
	}

	/** 解析端点：锚定时计算图形上的实际坐标，否则返回自由坐标 */
	public resolveEndpoint(endpoint: LineEndpointValue, refPoint?: Point): Point {
		if (endpoint.shapeId) {
			const ioc = (this.shape as any).context.ioc as IocContainerService;
			const shapeManager = ioc.get<IShapeManager>(IShapeManager);
			const target = shapeManager.getShapeById(endpoint.shapeId);
			if (target) {
				return getShapeAnchorPoint(target, endpoint.anchor, refPoint);
			}
		}
		return { x: endpoint.x, y: endpoint.y };
	}

	/** 世界坐标下的全点序列：start → 途经点 → end（锚定端点自动解析坐标） */
	public getPoints(): Point[] {
		const v = this.value;
		const start = this.resolveEndpoint(v.start, v.end);
		const end = this.resolveEndpoint(v.end, v.start);
		return [start, ...(v.midPoints ?? []), end];
	}

	/** 容器本地坐标下的全点序列 */
	public getLocalPoints(): Point[] {
		return this.toLocal(this.getPoints());
	}

	/**
	 * 每段线的虚拟中点手柄（世界坐标），拖动它可生成途经点；
	 * 途经点已满时返回空数组
	 */
	public getVirtualHandles(): Point[] {
		const midCount = this.value.midPoints?.length ?? 0;
		if (midCount >= MAX_MID_POINTS) {
			return [];
		}

		const points = this.getPoints();
		if (midCount === 0) {
			const [p0, p1] = points;
			return [{ x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }];
		}

		const segments = catmullRomToBezier(points);
		return segments.map((seg, i) => cubicBezierPoint(points[i], seg.c1, seg.c2, seg.to, 0.5));
	}

	/** 容器本地坐标下的虚拟中点手柄 */
	public getLocalVirtualHandles(): Point[] {
		return this.toLocal(this.getVirtualHandles());
	}

	private toLocal(points: Point[]): Point[] {
		const { minX, minY } = this.getBBox();
		return points.map((p) => ({ x: p.x - minX, y: p.y - minY }));
	}

	private getBBox() {
		const points = this.getPoints();
		const xs = points.map((p) => p.x);
		const ys = points.map((p) => p.y);
		return {
			minX: Math.min(...xs),
			minY: Math.min(...ys),
			maxX: Math.max(...xs),
			maxY: Math.max(...ys),
		};
	}

	public draw(): void {
		const v = this.value;
		const g = this.shape.graphics as Graphics;

		const { minX, minY, maxX, maxY } = this.getBBox();

		// 容器定位到包围盒中心
		this.shape.container.x = minX + (maxX - minX) / 2;
		this.shape.container.y = minY + (maxY - minY) / 2;
		this.shape.container.pivot.set((maxX - minX) / 2, (maxY - minY) / 2);

		// 同步 base 包围盒（直接赋值，不触发 BaseProperty.draw 以免覆盖容器定位）
		const baseProp = this.shape.getProperty<BaseProperty>(ShapePropertyEnum.Base);
		if (baseProp) {
			baseProp.value = {
				...baseProp.value,
				x: minX,
				y: minY,
				width: maxX - minX,
				height: maxY - minY,
			};
		}

		// 世界坐标 → 本地坐标
		const points = this.getLocalPoints();

		g.clear();

		// stroke
		const stroke = this.shape.getProperty<StrokeProperty>(ShapePropertyEnum.Stroke);
		const sv = stroke?.value;
		const color = sv?.color ?? 0x000000;
		const alpha = sv?.alpha ?? 1;
		const width = sv?.width ?? 1;

		// 画线：无途经点为直线，有途经点为平滑曲线
		g.lineStyle(width, color, alpha);
		const start = points[0];
		const end = points[points.length - 1];
		g.moveTo(start.x, start.y);

		// 箭头切线方向的参考点
		let startTangentFrom = end;
		let endTangentFrom = start;

		if (points.length === 2) {
			g.lineTo(end.x, end.y);
		} else {
			const segments = catmullRomToBezier(points);
			for (const seg of segments) {
				g.bezierCurveTo(seg.c1.x, seg.c1.y, seg.c2.x, seg.c2.y, seg.to.x, seg.to.y);
			}
			startTangentFrom = segments[0].c1;
			endTangentFrom = segments[segments.length - 1].c2;
		}
		g.lineStyle(0);

		// 箭头（实心三角）
		if (v.startArrow) {
			g.beginFill(color, alpha);
			this.drawArrowhead(startTangentFrom.x, startTangentFrom.y, start.x, start.y, g);
			g.endFill();
		}
		if (v.endArrow) {
			g.beginFill(color, alpha);
			this.drawArrowhead(endTangentFrom.x, endTangentFrom.y, end.x, end.y, g);
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
