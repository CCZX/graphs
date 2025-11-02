import { Point } from '@/types/geometry';
import { BaseShape } from '../canvas/shapes/BaseShape';
import { shapeManager } from '../canvas/shapes/shapeManager';
import { viewportStore } from '../store/viewport';
import { BasePropertyValue, ShapePropertyEnum, ShapeStateEnum } from '../types/shape';
import { throttle } from '../utils/decorate';
import { transformCanvasCoordinateToViewport } from '../utils/viewport';
import { BaseProperty } from '@/canvas/shapes/property/BaseProperty';

export class Events {
  constructor() {}

  hoveredShape: BaseShape | null = null;
  selectedShape: BaseShape | null = null;
  movingShape: BaseShape | null = null;

  private startDownPoint: Point | null = null
  private originBaseProps: BasePropertyValue | null = null

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
    this.startDownPoint = { x: e.pageX, y: e.pageY }

    const viewportPoint = this.getViewportPoint(e);

    const nextShape = shapeManager.getShapeByPoint(viewportPoint);
    const currentShape = this.selectedShape;

    if (!nextShape && !currentShape) {
      document.addEventListener('pointermove', this.downAndMove);
      return;
    }

    if (nextShape?.id === currentShape?.id) {
      document.addEventListener('pointermove', this.downAndMove);
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

    const p = this.selectedShape?.getProperty<BaseProperty>(ShapePropertyEnum.Base).get()
    this.originBaseProps = p || null;

    document.addEventListener('pointermove', this.downAndMove);
  }

  private onPointerup(e: PointerEvent) {
    document.removeEventListener('pointermove', this.downAndMove)
    if (this.movingShape) {
      this.movingShape.setState(ShapeStateEnum.Selected)
      this.movingShape = null
    }
  }

  private downAndMove = (e: PointerEvent) => {
    if (!this.selectedShape && !this.movingShape) {
      return
    }

    if (this.selectedShape && !this.movingShape) {
      this.selectedShape.setState(ShapeStateEnum.Moving)
      this.movingShape = this.selectedShape
      this.selectedShape = null
    }

    this.downAndMoveWhenSelectedShape(e)
  }

  private downAndMoveWhenSelectedShape(e: PointerEvent) {
    if (this.movingShape && this.originBaseProps) {
      const offsetX = e.pageX - (this.startDownPoint?.x || 0)
      const offsetY = e.pageY - (this.startDownPoint?.y || 0)
      this.movingShape.updateProperty(ShapePropertyEnum.Base, {
        x: this.originBaseProps.x + offsetX,
        y: this.originBaseProps.y + offsetY,
      })
    }
    
  }

  _onPointermove = this.onPointermove.bind(this);

  start() {
    document.addEventListener('pointermove', this._onPointermove);
    document.addEventListener('pointerdown', this.onPointerdown.bind(this));
    document.addEventListener('pointerup', this.onPointerup.bind(this));
  }
}
