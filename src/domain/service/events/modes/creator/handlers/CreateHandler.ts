import { ShapeData, ShapeTypeEnum } from '@/shapes/contract';
import { toolStore, ToolType } from '@/store/tool';
import {
	HandlerEnum,
	InteractionState,
	EventPayload,
	IHandler,
	IHandlerWithCreator,
} from '../../../../../contract/eventManager';
import { CreateShapeAction } from '@/domain/service/action/actions/CreateShpeAction';
import { IActionManager } from '@/domain/contract/action';
import { IViewportService } from '@/domain/contract/ViewportService';
import { inject } from 'inversify';
import { IocContainerService } from '@/common/contract';
import { fluentProvideWithSingle } from '@/common/context';

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

@fluentProvideWithSingle(IHandlerWithCreator)
export class CreateHandler implements IHandler {
	type = HandlerEnum.Select;

	@inject(IocContainerService)
	private ioc!: IocContainerService;

	@inject(IActionManager)
	private actionManager!: IActionManager;

	@inject(IViewportService)
	private viewportService!: IViewportService;

	enable(_state: InteractionState): boolean {
		const tool = toolStore.getState().activeTool;
		return tool === 'rect' || tool === 'circle';
	}

	execute(e: PointerEvent, _state: InteractionState, payload: EventPayload): boolean {
		if (e.type !== 'pointerdown') {
			return true;
		}

		const tool = toolStore.getState().activeTool;
		const id = nextId();
		const localPoint = this.viewportService.clientToViewportLocal(
			payload.viewportPoint.x,
			payload.viewportPoint.y,
		);

		const shapeType: ShapeTypeEnum = (() => {
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
					x: localPoint.x - DEFAULT_PROPS.width / 2,
					y: localPoint.y - DEFAULT_PROPS.height / 2,
					width: DEFAULT_PROPS.width,
					height: DEFAULT_PROPS.height,
				},
				fill: { color: 0xffffff, alpha: 1 },
				stroke: { color: 0x1e1e1e, width: 1, alpha: 1 },
			},
		};

		this.actionManager.push(new CreateShapeAction(shapeData, this.ioc));

		// 新建后退出创建模式，回到 select
		toolStore.getState().setActiveTool(ToolType.Select);

		return false;
	}
}
