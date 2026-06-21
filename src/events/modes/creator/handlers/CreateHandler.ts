import { ShapePropertyEnum } from '@/types/shape';
import { Rectangle } from '@/canvas/shapes/Rectangle';
import { Circle } from '@/canvas/shapes/Circle';
import { shapeManager } from '@/canvas/shapes/shapeManager';
import { stageRef } from '@/canvas/core/stageRef';
import { toolStore, ToolType } from '@/store/tool';
import { HandlerEnum, InteractionState, EventPayload } from '../../../types';
import { Handler } from '../../../Handler';

let _idCounter = 0;
function nextId(): string {
	return `shape-${++_idCounter}-${Date.now()}`;
}

const DEFAULT_PROPS = {
	width: 100,
	height: 100,
	stroke: { color: 0x1e1e1e, width: 1, alpha: 1 },
	fill: { color: 0xffffff, alpha: 1 },
};

export class CreateHandler extends Handler {
	type = HandlerEnum.Select;

	enable(_state: InteractionState): boolean {
		const tool = toolStore.getState().activeTool;
		return tool === 'rect' || tool === 'circle';
	}

	execute(e: PointerEvent, _state: InteractionState, payload: EventPayload): boolean {
		if (e.type !== 'pointerdown') return true;

		const stage = stageRef.current;
		if (!stage) return true;

		const tool = toolStore.getState().activeTool;
		const id = nextId();
		const { viewportPoint } = payload;

		let shape: Rectangle | Circle;

		if (tool === 'rect') {
			shape = new Rectangle(id);
		} else if (tool === 'circle') {
			shape = new Circle(id);
		} else {
			return true;
		}

		shape.setProperty(ShapePropertyEnum.Base, {
			x: viewportPoint.x - DEFAULT_PROPS.width / 2,
			y: viewportPoint.y - DEFAULT_PROPS.height / 2,
			width: DEFAULT_PROPS.width,
			height: DEFAULT_PROPS.height,
		});
		shape.setProperty(ShapePropertyEnum.Fill, DEFAULT_PROPS.fill);
		shape.setProperty(ShapePropertyEnum.Stroke, DEFAULT_PROPS.stroke);

		stage.appendShape(shape.container);
		shapeManager.setShape(shape);

		// 新建后退出创建模式，回到 select
		toolStore.getState().setActiveTool(ToolType.Select);

		return false;
	}
}
