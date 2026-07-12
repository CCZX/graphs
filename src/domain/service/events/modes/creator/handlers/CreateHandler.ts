import {
	BasePropertyValue,
	ShapeData,
	ShapePropertyEnum,
	ShapeStateEnum,
	ShapeTypeEnum,
} from '@/shape/contract';
import { ToolType, IToolService } from '@/domain/contract/ToolService';
import {
	HandlerEnum,
	InteractionState,
	EventPayload,
	IHandler,
	IHandlerWithCreator,
} from '../../../../../contract/eventManager';
import { CreateShapeAction } from '@/domain/service/action/actions/CreateShapeAction';
import { UpdatePropsAction } from '@/domain/service/action/actions/UpdatePropsAction';
import { IActionLogManager, IActionManager } from '@/domain/contract/action';
import { IShapeManager } from '@/domain/contract';
import { ISelectService } from '@/domain/contract/SelectService';
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

/** 拖拽位移小于该阈值视为单击，回退为默认尺寸 */
const DRAG_THRESHOLD = 3;

@fluentProvideWithSingle(IHandlerWithCreator)
export class CreateHandler implements IHandler {
	type = HandlerEnum.Select;

	@inject(IocContainerService)
	private ioc!: IocContainerService;

	@inject(IActionManager)
	private actionManager!: IActionManager;

	@inject(IActionLogManager)
	private actionLogManager!: IActionLogManager;

	@inject(IShapeManager)
	private shapeManager!: IShapeManager;

	@inject(ISelectService)
	private selectService!: ISelectService;

	@inject(IViewportService)
	private viewportService!: IViewportService;

	@inject(IToolService)
	private toolService!: IToolService;

	private isCreating = false;
	private startPoint: { x: number; y: number } | null = null;
	private creatingId: string | null = null;
	private creatingType: ShapeTypeEnum | null = null;

	enable(_state: InteractionState): boolean {
		const tool = this.toolService.store.getState().activeTool;
		return tool === 'rect' || tool === 'circle' || tool === 'text' || tool === 'line';
	}

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean {
		switch (e.type) {
			case 'pointerdown':
				return this.handlePointerDown(payload);
			case 'pointermove':
				// 拖拽过程中丢失了 pointerup（如鼠标移出窗口松开），主动收尾
				if (e.buttons !== 1 && this.isCreating) {
					this.finish(state, payload);
					return false;
				}
				return this.handlePointerMove(payload);
			case 'pointerup':
				return this.handlePointerUp(state, payload);
			default:
				return true;
		}
	}

	private handlePointerDown(payload: EventPayload): boolean {
		const tool = this.toolService.store.getState().activeTool;
		const localPoint = this.viewportService.clientToViewportLocal(
			payload.viewportPoint.x,
			payload.viewportPoint.y,
		);

		// 矩形/圆：进入拖拽创建流程，从 0 尺寸开始，随 pointermove 生长
		if (tool === 'rect' || tool === 'circle') {
			const type = tool === 'rect' ? ShapeTypeEnum.Rectangle : ShapeTypeEnum.Circle;

			this.actionLogManager.setStreamStart();

			const shapeData: ShapeData = {
				id: nextId(),
				type,
				properties: {
					base: { x: localPoint.x, y: localPoint.y, width: 0, height: 0 },
					fill: { ...DEFAULT_PROPS.fill },
					stroke: { ...DEFAULT_PROPS.stroke },
				},
			};

			this.actionManager.push(new CreateShapeAction([shapeData], this.ioc));

			this.isCreating = true;
			this.startPoint = { x: localPoint.x, y: localPoint.y };
			this.creatingId = shapeData.id;
			this.creatingType = type;

			return false;
		}

		// 文本/直线：保持点击即创建
		return this.createImmediate(tool, localPoint);
	}

	private handlePointerMove(payload: EventPayload): boolean {
		if (!this.isCreating) {
			return true;
		}

		const cur = this.viewportService.clientToViewportLocal(
			payload.viewportPoint.x,
			payload.viewportPoint.y,
		);
		this.pushBase(this.computeBase(cur));
		return false;
	}

	private handlePointerUp(state: InteractionState, payload: EventPayload): boolean {
		if (!this.isCreating) {
			return true;
		}
		this.finish(state, payload);
		return false;
	}

	/** 收尾：应用最终尺寸（拖拽太小则回退默认尺寸）、选中新图形、切回 Select 工具 */
	private finish(state: InteractionState, payload: EventPayload) {
		const cur = this.viewportService.clientToViewportLocal(
			payload.viewportPoint.x,
			payload.viewportPoint.y,
		);
		const start = this.startPoint!;
		const dx = cur.x - start.x;
		const dy = cur.y - start.y;

		const isClick = Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD;
		const base: BasePropertyValue = isClick
			? {
					x: start.x - DEFAULT_PROPS.width / 2,
					y: start.y - DEFAULT_PROPS.height / 2,
					width: DEFAULT_PROPS.width,
					height: DEFAULT_PROPS.height,
			  }
			: this.computeBase(cur);

		this.pushBase(base);
		this.actionLogManager.setStreamEnd();

		this.selectCreatedShape(state);

		this.toolService.store.getState().setActiveTool(ToolType.Select);
		this.reset();
	}

	/** 根据当前指针位置计算包围盒；圆保持正方形（直径） */
	private computeBase(cur: { x: number; y: number }): BasePropertyValue {
		const start = this.startPoint!;
		const dx = cur.x - start.x;
		const dy = cur.y - start.y;

		if (this.creatingType === ShapeTypeEnum.Circle) {
			const d = Math.max(Math.abs(dx), Math.abs(dy));
			return {
				x: dx < 0 ? start.x - d : start.x,
				y: dy < 0 ? start.y - d : start.y,
				width: d,
				height: d,
			};
		}

		return {
			x: Math.min(start.x, cur.x),
			y: Math.min(start.y, cur.y),
			width: Math.abs(dx),
			height: Math.abs(dy),
		};
	}

	private pushBase(base: BasePropertyValue) {
		this.actionManager.push(
			new UpdatePropsAction(
				[{ id: this.creatingId!, type: this.creatingType!, properties: { base } }],
				this.ioc,
			),
		);
	}

	private selectCreatedShape(state: InteractionState) {
		const shape = this.shapeManager.getShapeById(this.creatingId!);
		if (!shape) {
			return;
		}

		// 清理可能残留的旧选中
		state.selectedShapes.forEach((s) => s.setState(ShapeStateEnum.Normal));
		this.selectService.clearSelectedShapes();

		shape.setState(ShapeStateEnum.Selected);
		state.selectedShapes = [shape];
		this.selectService.setSelectedShape(shape);
		this.selectService.updateMultiSelectOverlay([shape]);
	}

	private createImmediate(tool: ToolType, localPoint: { x: number; y: number }): boolean {
		const id = nextId();
		const shapeType = tool === 'text' ? ShapeTypeEnum.Text : ShapeTypeEnum.Line;

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
				fill: { ...DEFAULT_PROPS.fill },
				stroke: { ...DEFAULT_PROPS.stroke },
				...(shapeType === ShapeTypeEnum.Text ? { text: { text: '' } } : {}),
				...(shapeType === ShapeTypeEnum.Line
					? {
							line: {
								start: { x: localPoint.x, y: localPoint.y },
								end: { x: localPoint.x + 100, y: localPoint.y },
								routing: 'straight' as const,
							},
					  }
					: {}),
			},
		};

		this.actionManager.push(new CreateShapeAction([shapeData], this.ioc));

		// 新建文本后自动进入编辑态
		if (shapeType === ShapeTypeEnum.Text) {
			const shape = this.shapeManager.getShapeById(id);
			shape?.setProperty(ShapePropertyEnum.Fill, { color: 0xffffff, alpha: 0 });
			shape?.setProperty(ShapePropertyEnum.Stroke, { color: 0x1e1e1e, width: 0, alpha: 0 });
			shape?.setState(ShapeStateEnum.Edit);
		}

		// 新建后退出创建模式，回到 select
		this.toolService.store.getState().setActiveTool(ToolType.Select);

		return false;
	}

	private reset() {
		this.isCreating = false;
		this.startPoint = null;
		this.creatingId = null;
		this.creatingType = null;
	}
}
