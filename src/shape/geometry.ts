import { BaseShape } from './BaseShape';

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

/**
 * 计算多个图形的世界坐标 AABB
 */
export function getShapesAABB(shapes: BaseShape[]): Rectangle {
	let minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;

	for (const shape of shapes) {
		const { width, height } = shape.getBounds();
		const cx = shape.container.x;
		const cy = shape.container.y;
		const angle = shape.container.angle;

		if (angle === 0) {
			const left = cx - width / 2;
			const top = cy - height / 2;
			minX = Math.min(minX, left);
			minY = Math.min(minY, top);
			maxX = Math.max(maxX, left + width);
			maxY = Math.max(maxY, top + height);
		} else {
			// 旋转后四个角坐标
			const rad = (angle * Math.PI) / 180;
			const cos = Math.cos(rad);
			const sin = Math.sin(rad);
			const hw = width / 2;
			const hh = height / 2;
			const corners = [
				{ x: -hw, y: -hh },
				{ x: hw, y: -hh },
				{ x: hw, y: hh },
				{ x: -hw, y: hh },
			];
			for (const c of corners) {
				const rx = c.x * cos - c.y * sin + cx;
				const ry = c.x * sin + c.y * cos + cy;
				minX = Math.min(minX, rx);
				minY = Math.min(minY, ry);
				maxX = Math.max(maxX, rx);
				maxY = Math.max(maxY, ry);
			}
		}
	}

	if (!isFinite(minX)) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}

	return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
