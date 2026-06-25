import { Application, Container, Graphics } from 'pixi.js';
import { Viewport } from './Viewport';

export class Stage {
	private app: Application;
	private viewport: Viewport;
	private el: HTMLDivElement;

	constructor(el: HTMLDivElement) {
		this.el = el;

		const { width, height } = el.getBoundingClientRect();

		const app = new Application({
			width: width,
			height: height,
			autoDensity: true,
			antialias: true,
			resolution: window.devicePixelRatio,
			backgroundColor: '#ffffff',
			preserveDrawingBuffer: true,
		});

		this.app = app;

		el.appendChild(app.view as unknown as HTMLCanvasElement);

		this.viewport = new Viewport(app.view as unknown as HTMLCanvasElement);

		app.stage.addChild(this.viewport);

		// for debug
		(globalThis as any).__PIXI_APP__ = app;
	}

	static createStage(el: HTMLDivElement) {
		return new Stage(el);
	}

	appendShape(shape: Container) {
		this.viewport.addChild(shape);
	}

	removeShape(shape: Container) {
		this.viewport.removeChild(shape);
	}

	destory() {
		this.el.removeChild(this.app.view as unknown as HTMLCanvasElement);
		this.app.destroy();
		this.viewport.destroy();
	}
}
