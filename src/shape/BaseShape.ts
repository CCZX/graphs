import { Graphics, Container, Text as PixiText } from 'pixi.js';
import {
	BasePropertyValue,
	FillPropertyValue,
	LinePropertyValue,
	ShapeContext,
	ShapeData,
	ShapeDecorateTypeEnum,
	ShapePropertyEnum,
	ShapeStateEnum,
	ShapeTypeEnum,
	StrokePropertyValue,
	TextPropertyValue,
} from './contract';
import { AbsDecorate } from './decorate/AbsDecorate';
import { HoverBorder } from './decorate/HoverBorder';
import { isPointInRect } from './geometry';
import { AbsState } from './state/AbsState';
import { StateFactory } from './state/StateFactory';
import { StateMachine } from './state/StateMachine';
import { AbsProperty } from './property/AbsProperty';
import { BaseProperty } from './property/BaseProperty';
import { FillProperty } from './property/FillProperty';
import { StrokeProperty } from './property/StrokeProperty';
import { SelectedBorder } from './decorate/SelectedBorder';
import { ISelectService } from '@/domain/contract/SelectService';

export abstract class BaseShape<T extends Container = Container> {
	/**
	 * 图形、图形装饰的容器节点
	 */
	container = new Container();

	/**
	 * 真正渲染的图形节点
	 */
	graphics: T;

	id: string;

	abstract get type(): ShapeTypeEnum;

	private stateMap: Map<ShapeStateEnum, AbsState> = new Map();
	protected decorateMap: Map<ShapeDecorateTypeEnum, AbsDecorate> = new Map();
	protected propertyMap: Map<ShapePropertyEnum, AbsProperty> = new Map();
	private stateMachine: StateMachine;

	protected context: ShapeContext;

	constructor(id: string, graphics: T, context: ShapeContext) {
		this.id = id;
		this.graphics = graphics;
		this.context = context;

		this.container.addChild(this.graphics);
		this.container.name = 'SHAPE_CONTAINER';
		this.stateMachine = new StateMachine(this);
		this.initDecorate();
		this.initProperty();
	}

	protected initProperty() {
		this.propertyMap.set(ShapePropertyEnum.Base, new BaseProperty(this));
		this.propertyMap.set(ShapePropertyEnum.Fill, new FillProperty(this));
		this.propertyMap.set(ShapePropertyEnum.Stroke, new StrokeProperty(this));
	}

	setProperty<T extends Record<string, any>>(type: ShapePropertyEnum, value: T) {
		const property = this.propertyMap.get(type);
		if (property) {
			property.set(value);
			this.refreshDecorates();
		}
	}

	updateProperty<T extends Record<string, any>>(type: ShapePropertyEnum, value: T) {
		const property = this.propertyMap.get(type);
		if (property) {
			property.update(value);
			this.refreshDecorates();
		}
	}

	private refreshDecorates() {
		this.decorateMap.forEach((decorate) => decorate.refresh());
	}

	getProperty<T>(type: ShapePropertyEnum) {
		return this.propertyMap.get(type) as T;
	}

	/** 序列化为 ShapeData，用于删除后可撤销地重建图形 */
	toData(): ShapeData {
		const properties: ShapeData['properties'] = {
			base: { ...(this.propertyMap.get(ShapePropertyEnum.Base)!.value as BasePropertyValue) },
		};

		const fill = this.propertyMap.get(ShapePropertyEnum.Fill)?.value as
			| FillPropertyValue
			| undefined;
		if (fill) {
			properties.fill = { ...fill };
		}

		const stroke = this.propertyMap.get(ShapePropertyEnum.Stroke)?.value as
			| StrokePropertyValue
			| undefined;
		if (stroke) {
			properties.stroke = { ...stroke };
		}

		const text = this.propertyMap.get(ShapePropertyEnum.Text)?.value as
			| TextPropertyValue
			| undefined;
		if (text) {
			properties.text = { ...text };
		}

		const line = this.propertyMap.get(ShapePropertyEnum.Line)?.value as
			| LinePropertyValue
			| undefined;
		if (line) {
			properties.line = { ...line, midPoints: line.midPoints?.map((p) => ({ ...p })) };
		}

		return { id: this.id, type: this.type, properties };
	}

	protected initDecorate() {
		this.decorateMap.set(ShapeDecorateTypeEnum.HoverBorder, new HoverBorder(this));
		this.decorateMap.set(ShapeDecorateTypeEnum.SelectedBorder, new SelectedBorder(this));
	}

	getDecorate(type: ShapeDecorateTypeEnum) {
		return this.decorateMap.get(type);
	}

	setState(stateType: ShapeStateEnum, onSuccess?: () => void, onError?: () => void) {
		if (stateType === this.getState()) {
			return;
		}

		const selectService = this.context.ioc.get<ISelectService>(ISelectService);

		if (stateType === ShapeStateEnum.Normal) {
			selectService.removeSelectedShapeById(this.id);
		}

		if (stateType === ShapeStateEnum.Selected) {
			selectService.setSelectedShape(this);
		}

		let state = this.stateMap.get(stateType);
		if (!state) {
			state = StateFactory.create(stateType, this);
			this.stateMap.set(stateType, state);
		}
		this.stateMachine.setState(state, onSuccess, onError);
	}

	getState() {
		return this.stateMachine.getState();
	}

	getPosition() {
		return {
			x: this.container.x,
			y: this.container.y,
		};
	}

	getWH() {
		const p = this.getProperty<BaseProperty>(ShapePropertyEnum.Base).get();
		return {
			width: p.width,
			height: p.height,
		};
	}

	getBounds() {
		const { width, height } = this.getWH();
		// container 的 pivot 设为中心后，local 坐标系下 shape 始终从 (0,0) 开始
		return { x: 0, y: 0, width, height };
	}

	/** 本地坐标命中检测，默认为包围盒判断，子类可按实际形状覆写 */
	containsPoint(localPoint: Point): boolean {
		return isPointInRect(localPoint, this.getBounds());
	}

	// 以下三个方法供 EditState 回调，Text 子类 override
	showTextInput(): void {}
	hideTextInput(): void {}
	commitTextInput(): void {}
}
