import { ShapeData, ShapePropertyEnum, ShapeTypeEnum } from '@/canvas/shapes/shape';
import { Rectangle } from '@/canvas/shapes/Rectangle';
import { Circle } from '@/canvas/shapes/Circle';
import { shapeManager } from '@/canvas/shapes/shapeManager';
import { toolStore, ToolType } from '@/store/tool';
import { HandlerEnum, InteractionState, EventPayload } from '../../../types';
import { Handler } from '../../../Handler';
import { actionManager } from '@/domain/action/ActionManager';
import { CreateShapeActionExecute } from '@/domain/action/actionExecutes/CreateShpeActionExecute';
import { CreateShapeAction } from '@/domain/action/actions/CreateShpeAction';

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

		const tool = toolStore.getState().activeTool;
		const id = nextId();
		const { viewportPoint } = payload;

		let shapeType: ShapeTypeEnum = (() => {
			switch (tool) {
				case 'rect':
					return ShapeTypeEnum.Rectangle;
				case 'circle':
					return ShapeTypeEnum.Circle;
				default:
					return ShapeTypeEnum.Rectangle;
			}
		})();

		const shapeData: ShapeData = {
			id,
			type: shapeType,
			properties: {
				base: {
					x: viewportPoint.x - DEFAULT_PROPS.width / 2,
					y: viewportPoint.y - DEFAULT_PROPS.height / 2,
					width: DEFAULT_PROPS.width,
					height: DEFAULT_PROPS.height,
				},
				fill: { color: 0xffffff, alpha: 1 },
				stroke: { color: 0x1e1e1e, width: 1, alpha: 1 },
			},
		};

		actionManager.push(new CreateShapeAction(shapeData));

		// 新建后退出创建模式，回到 select
		toolStore.getState().setActiveTool(ToolType.Select);

		return false;
	}
}
