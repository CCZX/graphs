import { viewportStore } from '@/store/viewport';
import { transformCanvasCoordinateToViewport } from '@/utils/viewport';
import { throttle } from '@/utils/decorate';
import { InteractionState, EventPayload } from './types';
import { AbsEventMode } from './modes/AbsEventMode';
import { InteractionMode } from './modes/interaction/InteractionMode';
import { CreatorMode } from './modes/creator/CreatorMode';

export class EventManager {
  /** 跨 handler 共享的可变状态 */
  state: InteractionState = {
    hoveredShape: null,
    selectedShape: null,
  };

  private eventModeList: AbsEventMode[] = [new InteractionMode(), new CreatorMode()];
  private activeMode: AbsEventMode | null = null;

  private getEventPayload(e: PointerEvent): EventPayload {
    return {
      viewportPoint: transformCanvasCoordinateToViewport({
        point: { x: e.clientX, y: e.clientY },
        viewport: viewportStore.getState(),
      }),
      screenPoint: { x: e.pageX, y: e.pageY },
      scale: viewportStore.getState().scale,
    };
  }

  private dispatch(e: PointerEvent) {
    const mode = this.eventModeList.find((m) => m.enable()) || null;

    if (mode !== this.activeMode) {
      this.activeMode?.onDeactivate();
      this.activeMode = mode;
      mode?.onActivate();
    }

    if (!this.activeMode) return;

    const payload = this.getEventPayload(e);

    for (const handler of this.activeMode.handlerList) {
      if (!handler.enable(this.state)) continue;
      const shouldContinue = handler.execute(e, this.state, payload);
      if (!shouldContinue) break;
    }
  }

  @throttle<EventManager>(16)
  private onPointermove(e: PointerEvent) {
    this.dispatch(e);
  }

  @throttle<EventManager>(17)
  private onPointerdown(e: PointerEvent) {
    this.dispatch(e);
  }

  private onPointerup(e: PointerEvent) {
    this.dispatch(e);
  }

  _onPointermove = this.onPointermove.bind(this);

  start() {
    document.addEventListener('pointermove', this._onPointermove);
    document.addEventListener('pointerdown', this.onPointerdown.bind(this));
    document.addEventListener('pointerup', this.onPointerup.bind(this));
  }
}
