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

/**
 * 两个矩形是否相交
 */
export function isRectIntersect(rect1: Rectangle, rect2: Rectangle) {
	return !(
		rect1.x + rect1.width < rect2.x ||
		rect2.x + rect2.width < rect1.x ||
		rect1.y + rect1.height < rect2.y ||
		rect2.y + rect2.height < rect1.y
	);
}
