import { Container, IDestroyOptions, Point } from 'pixi.js';
import floor from 'lodash/floor';
import { viewportStore } from '../../store/viewport';
import { last } from 'lodash';

const ZOOM_SCALE_LIST = [0.1, 0.3, 0.5, 1.0, 2.0, 3.0, 4.0];

const MIN_ZOOM_SCALE = ZOOM_SCALE_LIST[0];
const MAX_ZOOM_SCALE = last(ZOOM_SCALE_LIST)!;

/**
 *
 * @param scale
 * @returns
 */
export function formatZoomScale(scale: number) {
	if (scale < MIN_ZOOM_SCALE) {
		scale = MIN_ZOOM_SCALE;
	}

	if (scale > MAX_ZOOM_SCALE) {
		scale = MAX_ZOOM_SCALE;
	}

	return floor(scale, 2);
}

/**
 * 视口，所有节点的父级
 */
export class Viewport extends Container {
	private canvas: HTMLCanvasElement;

	get canvasEl(): HTMLCanvasElement {
		return this.canvas;
	}

	constructor(canvas: HTMLCanvasElement) {
		super();

		this.canvas = canvas;

		this.initEvent();
	}

	private onWheel = (e: WheelEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const { ctrlKey, deltaX, deltaY, offsetX, offsetY } = e;

		if (ctrlKey) {
			const scale = this.scale.x - deltaY / 50; // ➗ 50 防止缩放速度过快
			this.setScale(scale, new Point(offsetX, offsetY));
			return;
		}

		this.setPosition(this.x - deltaX, this.y - deltaY);
	};

	private initEvent() {
		this.canvas.addEventListener('wheel', this.onWheel);
	}

	private setScale(scale: number, point?: Point) {
		scale = floor(formatZoomScale(scale), 2);

		const { width, height } = this.canvas.getBoundingClientRect();
		point = point || new Point(width / 2, height / 2);

		const prevPoint = this.toLocal(point);

		viewportStore.getState().setScale(scale);
		this.scale.set(scale, scale);

		const nextPoint = this.toLocal(point);

		const offsetX = (prevPoint.x - nextPoint.x) * scale;
		const offsetY = (prevPoint.y - nextPoint.y) * scale;

		if (offsetX !== 0 && offsetY !== 0) {
			this.setPosition(this.x - offsetX, this.y - offsetY);
		}
	}

	private setPosition(x: number, y: number) {
		x = floor(x, 2);
		y = floor(y, 2);

		viewportStore.getState().setX(x);
		viewportStore.getState().setY(y);

		this.position.set(x, y);
	}

	destroy(options?: boolean | IDestroyOptions | undefined): void {
		super.destroy(options);

		this.canvas.removeEventListener('wheel', this.onWheel);
	}
}
