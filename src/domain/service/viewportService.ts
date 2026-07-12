import { Point as PixiPoint } from 'pixi.js';
import { Stage } from '@/canvas/core/Stage';
import { IViewportService } from '@/domain/contract/ViewportService';
import { provide } from 'inversify-binding-decorators';
import { viewportStore } from '../../store/viewport';

@provide(IViewportService)
export class ViewportService implements IViewportService {
	private stage!: Stage;

	private listenViewportEvent() {
		this.stage.getViewport()?.scaleChangeEvent$.subscribe((scale) => {
			viewportStore.getState().setScale(scale.scale);
		});
		this.stage.getViewport()?.positionChangeEvent$.subscribe((position) => {
			viewportStore.getState().setX(position.x);
			viewportStore.getState().setY(position.y);
		});
	}

	setStage(stage: Stage) {
		this.stage = stage;
		this.listenViewportEvent();
	}

	clientToViewportLocal(clientX: number, clientY: number): PixiPoint {
		const viewport = this.stage.getViewport();
		const canvasRect = viewport.canvasEl.getBoundingClientRect();
		const stageX = clientX - canvasRect.left;
		const stageY = clientY - canvasRect.top;
		return viewport.toLocal(new PixiPoint(stageX, stageY));
	}
}
