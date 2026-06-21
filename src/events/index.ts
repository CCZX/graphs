import { Point } from '@/types/geometry';
import { BaseShape } from '../canvas/shapes/BaseShape';
import { shapeManager } from '../canvas/shapes/shapeManager';
import { viewportStore } from '../store/viewport';
import {
  BasePropertyValue,
  ShapeDecorateTypeEnum,
  ShapePropertyEnum,
  ShapeStateEnum,
} from '../types/shape';
import { throttle } from '../utils/decorate';
import { transformCanvasCoordinateToViewport } from '../utils/viewport';
import { BaseProperty } from '@/canvas/shapes/property/BaseProperty';
import { SelectedBorder } from '@/canvas/shapes/decorate/SelectedBorder';

const MIN_SIZE = 10;

enum ResizeDirection {
  TopLeft = 'topLeft',
  TopRight = 'topRight',
  BottomRight = 'bottomRight',
  BottomLeft = 'bottomLeft',
}

export class Events {
  constructor() {}

  hoveredShape: BaseShape | null = null;
  selectedShape: BaseShape | null = null;
  movingShape: BaseShape | null = null;
  resizingShape: BaseShape | null = null;

  private startDownPoint: Point | null = null;
  private startDownViewportPoint: Point | null = null;
  private originBaseProps: BasePropertyValue | null = null;
  private resizeDirection: ResizeDirection | null = null;

  private getViewportPoint(e: PointerEvent) {
    const { clientX, clientY } = e;
    return transformCanvasCoordinateToViewport({
      point: { x: clientX, y: clientY },
      viewport: viewportStore.getState(),
    });
  }

  private getResizeHandle(
    shape: BaseShape,
    viewportPoint: Point,
  ): ResizeDirection | null {
    const { x, y, width, height } = shape.getBounds();
    const scale = viewportStore.getState().scale;
    const threshold = 8 / scale;

    const corners: { px: number; py: number; dir: ResizeDirection }[] = [
      { px: x, py: y, dir: ResizeDirection.TopLeft },
      { px: x + width, py: y, dir: ResizeDirection.TopRight },
      { px: x + width, py: y + height, dir: ResizeDirection.BottomRight },
      { px: x, py: y + height, dir: ResizeDirection.BottomLeft },
    ];

    for (const corner of corners) {
      if (
        Math.abs(viewportPoint.x - corner.px) < threshold &&
        Math.abs(viewportPoint.y - corner.py) < threshold
      ) {
        return corner.dir;
      }
    }

    return null;
  }

  private updateCursor(cursor: string) {
    document.body.style.cursor = cursor;
  }

  @throttle<Events>(16)
  private onPointermove(e: PointerEvent) {
    const viewportPoint = this.getViewportPoint(e);

    // Check resize handle hover on selected shape
    if (this.selectedShape) {
      const handle = this.getResizeHandle(this.selectedShape, viewportPoint);
      if (handle) {
        const cursors: Record<ResizeDirection, string> = {
          [ResizeDirection.TopLeft]: 'nwse-resize',
          [ResizeDirection.BottomRight]: 'nwse-resize',
          [ResizeDirection.TopRight]: 'nesw-resize',
          [ResizeDirection.BottomLeft]: 'nesw-resize',
        };
        this.updateCursor(cursors[handle]);
        return;
      }
    }

    const nextShape = shapeManager.getShapeByPoint(viewportPoint);
    const currentShape = this.hoveredShape;

    if (!nextShape && !currentShape) {
      this.updateCursor('default');
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
    this.updateCursor(nextShape ? 'move' : 'default');
  }

  @throttle<Events>(17)
  private onPointerdown(e: PointerEvent) {
    this.startDownPoint = { x: e.pageX, y: e.pageY };

    const viewportPoint = this.getViewportPoint(e);
    this.startDownViewportPoint = viewportPoint;

    // Check if clicking on a resize handle of the currently selected shape
    if (this.selectedShape) {
      const handle = this.getResizeHandle(this.selectedShape, viewportPoint);
      if (handle) {
        this.resizeDirection = handle;
        const p = this.selectedShape
          .getProperty<BaseProperty>(ShapePropertyEnum.Base)
          .get();
        this.originBaseProps = { ...p };
        this.resizingShape = this.selectedShape;
        this.selectedShape = null;
        this.resizingShape.setState(ShapeStateEnum.Resizing);
        document.addEventListener('pointermove', this.downAndMove);
        return;
      }
    }

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

    const p = this.selectedShape
      ?.getProperty<BaseProperty>(ShapePropertyEnum.Base)
      .get();
    this.originBaseProps = p || null;

    document.addEventListener('pointermove', this.downAndMove);
  }

  private onPointerup(e: PointerEvent) {
    document.removeEventListener('pointermove', this.downAndMove);

    if (this.resizingShape) {
      this.resizingShape.setState(ShapeStateEnum.Selected);
      this.selectedShape = this.resizingShape;
      this.resizingShape = null;
      this.resizeDirection = null;
      this.originBaseProps = null;
      this.startDownViewportPoint = null;
      return;
    }

    if (this.movingShape) {
      this.movingShape.setState(ShapeStateEnum.Selected);
      this.movingShape = null;
    }
  }

  private downAndMove = (e: PointerEvent) => {
    if (this.resizingShape) {
      this.downAndMoveWhenResizing(e);
      return;
    }

    if (!this.selectedShape && !this.movingShape) {
      return;
    }

    if (this.selectedShape && !this.movingShape) {
      this.selectedShape.setState(ShapeStateEnum.Moving);
      this.movingShape = this.selectedShape;
      this.selectedShape = null;
    }

    this.downAndMoveWhenSelectedShape(e);
  };

  private downAndMoveWhenResizing(e: PointerEvent) {
    if (!this.resizingShape || !this.originBaseProps || !this.resizeDirection) {
      return;
    }

    const viewportPoint = this.getViewportPoint(e);
    const start = this.startDownViewportPoint!;
    const dx = viewportPoint.x - start.x;
    const dy = viewportPoint.y - start.y;

    const { x, y, width, height } = this.originBaseProps;
    let newX = x;
    let newY = y;
    let newWidth = width;
    let newHeight = height;

    switch (this.resizeDirection) {
      case ResizeDirection.BottomRight:
        newWidth = Math.max(MIN_SIZE, width + dx);
        newHeight = Math.max(MIN_SIZE, height + dy);
        break;

      case ResizeDirection.TopLeft:
        newWidth = Math.max(MIN_SIZE, width - dx);
        newHeight = Math.max(MIN_SIZE, height - dy);
        newX = x + (width - newWidth);
        newY = y + (height - newHeight);
        break;

      case ResizeDirection.TopRight:
        newWidth = Math.max(MIN_SIZE, width + dx);
        newHeight = Math.max(MIN_SIZE, height - dy);
        newY = y + (height - newHeight);
        break;

      case ResizeDirection.BottomLeft:
        newWidth = Math.max(MIN_SIZE, width - dx);
        newHeight = Math.max(MIN_SIZE, height + dy);
        newX = x + (width - newWidth);
        break;
    }

    this.resizingShape.updateProperty(ShapePropertyEnum.Base, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });

    const border = this.resizingShape.getDecorate(
      ShapeDecorateTypeEnum.SelectedBorder,
    ) as SelectedBorder;
    border?.refresh();
  }

  private downAndMoveWhenSelectedShape(e: PointerEvent) {
    if (this.movingShape && this.originBaseProps) {
      const offsetX = e.pageX - (this.startDownPoint?.x || 0);
      const offsetY = e.pageY - (this.startDownPoint?.y || 0);
      this.movingShape.updateProperty(ShapePropertyEnum.Base, {
        x: this.originBaseProps.x + offsetX,
        y: this.originBaseProps.y + offsetY,
      });
    }
  }

  _onPointermove = this.onPointermove.bind(this);

  start() {
    document.addEventListener('pointermove', this._onPointermove);
    document.addEventListener('pointerdown', this.onPointerdown.bind(this));
    document.addEventListener('pointerup', this.onPointerup.bind(this));
  }
}
