import { Point, Rectangle } from '../types/geometry';

/**
 * 点在矩形内
 * @param point
 * @param rect
 */
export function isPointInRect(point: Point, rect: Rectangle) {
  const { x: px, y: py } = point;

  if (px < rect.x) {
    return false;
  }

  if (px > rect.x + rect.width) {
    return false;
  }

  if (py < rect.y) {
    return false;
  }

  if (py > rect.y + rect.height) {
    return false;
  }

  return true;
}
