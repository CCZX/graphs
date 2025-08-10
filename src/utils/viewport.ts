import { floor } from 'lodash';
import { MAX_ZOOM_SCALE, MIN_ZOOM_SCALE } from '../constant/viewport';
import { Viewport } from '../types/stage';

/**
 *
 * @param sclae
 * @returns
 */
export function formatZoomScale(sclae: number) {
  if (sclae < MIN_ZOOM_SCALE) {
    sclae = MIN_ZOOM_SCALE;
  }

  if (sclae > MAX_ZOOM_SCALE) {
    sclae = MAX_ZOOM_SCALE;
  }

  return floor(sclae, 2);
}

interface Param {
  viewport: Viewport;
  point: { x: number; y: number };
}

/**
 * canvas 坐标转为 viewport 坐标
 * @param param
 * @returns
 */
export function transformCanvasCoordinateToViewport(param: Param) {
  const { viewport, point } = param;

  const matrix = new window.DOMMatrix();
  matrix.scaleSelf(1 / viewport.scale);
  matrix.translateSelf(-viewport.x, -viewport.y);

  const transformX = matrix.a * point.x + matrix.c * point.y + matrix.e;
  const transformY = matrix.b * point.x + matrix.d * point.y + matrix.f;

  return { x: transformX, y: transformY };
}
