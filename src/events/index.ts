import { BaseShape } from '../canvas/shapes/BaseShape';
import { shapeManager } from '../canvas/shapes/shapeManager';
import { viewportStore } from '../store/viewport';
import { ShapeStateEnum } from '../types/shape';
import { throttle } from '../utils/decorate';
import { transformCanvasCoordinateToViewport } from '../utils/viewport';

export class Events {
  constructor() {}

  hoveredShape: BaseShape | null = null;
  selectedShape: BaseShape | null = null;

  private getViewportPoint(e: PointerEvent) {
    const { clientX, clientY } = e;
    return transformCanvasCoordinateToViewport({
      point: { x: clientX, y: clientY },
      viewport: viewportStore.getState(),
    });
  }

  @throttle<Events>(16)
  private onPointermove(e: PointerEvent) {
    const viewportPoint = this.getViewportPoint(e);

    const nextShape = shapeManager.getShapeByPoint(viewportPoint);
    const currentShape = this.hoveredShape;

    if (!nextShape && !currentShape) {
      return;
    }

    if (nextShape?.id === currentShape?.id) {
      return;
    }

    if (currentShape && currentShape.getState() === ShapeStateEnum.Hover) {
      currentShape.setState(ShapeStateEnum.Normal);
    }

    if (nextShape && nextShape.getState() === ShapeStateEnum.Normal) {
      nextShape.setState(ShapeStateEnum.Hover);
    }

    this.hoveredShape = nextShape || null;
  }

  @throttle<Events>(17)
  private onPointerdown(e: PointerEvent) {
    const viewportPoint = this.getViewportPoint(e);

    const nextShape = shapeManager.getShapeByPoint(viewportPoint);
    const currentShape = this.selectedShape;

    if (!nextShape && !currentShape) {
      return;
    }

    if (nextShape?.id === currentShape?.id) {
      return;
    }

    if (this.hoveredShape && this.hoveredShape.getState() === ShapeStateEnum.Hover) {
      this.hoveredShape.setState(ShapeStateEnum.Normal);
    }

    if (currentShape) {
      currentShape.setState(ShapeStateEnum.Normal);
    }

    if (nextShape) {
      nextShape.setState(ShapeStateEnum.Selected);
    }

    this.selectedShape = nextShape || null;
  }

  private onPointerup(e: PointerEvent) {}

  _onPointermove = this.onPointermove.bind(this);

  start() {
    document.addEventListener('pointermove', this._onPointermove);
    document.addEventListener('pointerdown', this.onPointerdown.bind(this));
    document.addEventListener('pointerup', this.onPointerup.bind(this));
  }
}
