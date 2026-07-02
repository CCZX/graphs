import { Point as PixiPoint } from 'pixi.js';
import { Stage } from '@/canvas/core/Stage';
import { IViewportService } from '@/domain/contract/ViewportService';
import { provide } from 'inversify-binding-decorators';

@provide(IViewportService)
export class ViewportService implements IViewportService {
	private stage!: Stage;

	setStage(stage: Stage) {
		this.stage = stage;
	}

	clientToViewportLocal(clientX: number, clientY: number): PixiPoint {
		const viewport = this.stage.getViewport();
		const canvasRect = viewport.canvasEl.getBoundingClientRect();
		const stageX = clientX - canvasRect.left;
		const stageY = clientY - canvasRect.top;
		return viewport.toLocal(new PixiPoint(stageX, stageY));
	}
}
