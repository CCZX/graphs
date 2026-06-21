import { Point } from '@/types/geometry';
import { BaseShape } from '@/canvas/shapes/BaseShape';
import { BaseProperty } from '@/canvas/shapes/property/BaseProperty';
import { SelectedBorder } from '@/canvas/shapes/decorate/SelectedBorder';
import {
  BasePropertyValue,
  ShapeDecorateTypeEnum,
  ShapePropertyEnum,
  ShapeStateEnum,
} from '@/types/shape';
import { HandlerEnum, InteractionState, EventPayload } from '../../../types';
import { Handler } from '../../../Handler';

const MIN_SIZE = 10;
const HANDLE_HIT_RADIUS = 8;

enum Dir {
  TL = 'TL',
  TR = 'TR',
  BR = 'BR',
  BL = 'BL',
}

const CURSOR_MAP: Record<Dir, string> = {
  [Dir.TL]: 'nwse-resize',
  [Dir.TR]: 'nesw-resize',
  [Dir.BR]: 'nwse-resize',
  [Dir.BL]: 'nesw-resize',
};

export class ResizeHandler extends Handler {
  type = HandlerEnum.Resize;

  private isResizing = false;
  private resizingShape: BaseShape | null = null;
  private direction: Dir | null = null;
  private startViewportPoint: Point | null = null;
  private originBaseProps: BasePropertyValue | null = null;

  enable(state: InteractionState): boolean {
    return state.selectedShape !== null;
  }

  execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
    switch (e.type) {
      case 'pointermove':
        return this.handlePointerMove(state, payload);
      case 'pointerdown':
        return this.handlePointerDown(state, payload);
      case 'pointerup':
        return this.handlePointerUp(state);
      default:
        return true;
    }
  }

  private handlePointerMove(state: InteractionState, payload: EventPayload): boolean {
    // 正在 resize 中，更新尺寸
    if (this.isResizing) {
      this.applyResize(state, payload.viewportPoint);
      return false;
    }

    // 悬停在 resize handle 上，改光标并打断后续 handler
    const handle = this.detectHandle(state.selectedShape!, payload.viewportPoint, payload.scale);
    if (handle) {
      document.body.style.cursor = CURSOR_MAP[handle];
      return false;
    }

    return true;
  }

  private handlePointerDown(state: InteractionState, payload: EventPayload): boolean {
    const handle = this.detectHandle(state.selectedShape!, payload.viewportPoint, payload.scale);
    if (!handle) return true;

    this.direction = handle;
    this.startViewportPoint = payload.viewportPoint;

    const p = state.selectedShape!.getProperty<BaseProperty>(ShapePropertyEnum.Base).get();
    this.originBaseProps = { ...p };

    this.isResizing = true;
    this.resizingShape = state.selectedShape!;

    this.resizingShape.setState(ShapeStateEnum.Resizing);

    return false;
  }

  private handlePointerUp(state: InteractionState): boolean {
    if (!this.isResizing) return true;

    this.resizingShape?.setState(ShapeStateEnum.Selected);
    state.selectedShape = this.resizingShape;

    this.reset();
    return false;
  }

  private applyResize(state: InteractionState, viewportPoint: Point) {
    if (!this.resizingShape || !this.originBaseProps || !this.direction) return;

    const start = this.startViewportPoint!;
    const dx = viewportPoint.x - start.x;
    const dy = viewportPoint.y - start.y;

    const { x, y, width, height } = this.originBaseProps;
    let newX = x;
    let newY = y;
    let newWidth = width;
    let newHeight = height;

    switch (this.direction) {
      case Dir.BR:
        newWidth = Math.max(MIN_SIZE, width + dx);
        newHeight = Math.max(MIN_SIZE, height + dy);
        break;
      case Dir.TL:
        newWidth = Math.max(MIN_SIZE, width - dx);
        newHeight = Math.max(MIN_SIZE, height - dy);
        newX = x + (width - newWidth);
        newY = y + (height - newHeight);
        break;
      case Dir.TR:
        newWidth = Math.max(MIN_SIZE, width + dx);
        newHeight = Math.max(MIN_SIZE, height - dy);
        newY = y + (height - newHeight);
        break;
      case Dir.BL:
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

  private detectHandle(shape: BaseShape, vp: Point, scale: number): Dir | null {
    const { x, y, width, height } = shape.getBounds();
    const threshold = HANDLE_HIT_RADIUS / scale;

    const corners: { px: number; py: number; dir: Dir }[] = [
      { px: x, py: y, dir: Dir.TL },
      { px: x + width, py: y, dir: Dir.TR },
      { px: x + width, py: y + height, dir: Dir.BR },
      { px: x, py: y + height, dir: Dir.BL },
    ];

    for (const c of corners) {
      if (Math.abs(vp.x - c.px) < threshold && Math.abs(vp.y - c.py) < threshold) {
        return c.dir;
      }
    }

    return null;
  }

  private reset() {
    this.isResizing = false;
    this.resizingShape = null;
    this.direction = null;
    this.startViewportPoint = null;
    this.originBaseProps = null;
  }
}
