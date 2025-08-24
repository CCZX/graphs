import { Graphics, Container, DisplayObject } from 'pixi.js';
import {
  ShapeDecorateTypeEnum,
  ShapePropertyEnum,
  ShapeStateEnum,
  ShapeTypeEnum,
} from '../../types/shape';
import { AbsDecorate } from './decorate/AbsDecorate';
import { HoverBorder } from './decorate/HoverBorder';
import { AbsState } from './state/AbsState';
import { StateFactory } from './state/StateFactory';
import { StateMachine } from './state/StateMachine';
import { AbsProperty } from './property/AbsProperty';
import { BaseProperty } from './property/BaseProperty';
import { FillProperty } from './property/FillProperty';
import { SelectedBorder } from './decorate/SelectedBorder';
import { shapeManager } from './shapeManager';
import { log } from '../../utils/log';

export abstract class BaseShape<T extends Graphics = Graphics> {
  /**
   * 图形、图形装饰的容器节点
   */
  container = new Container();

  /**
   * 真正渲染的图形节点
   */
  graphics: T;

  id: string;

  abstract type: ShapeTypeEnum;

  private stateMap: Map<ShapeStateEnum, AbsState> = new Map();
  private decorateMap: Map<ShapeDecorateTypeEnum, AbsDecorate> = new Map();
  private propertyMap: Map<ShapePropertyEnum, AbsProperty> = new Map();
  private stateMachine: StateMachine;

  constructor(id: string, graphics: T) {
    this.id = id;
    this.graphics = graphics;
    this.container.addChild(this.graphics);
    this.container.name = 'SHAPE_CONTAINER';
    this.stateMachine = new StateMachine(this);
    this.initDecorate();
    this.initProperty();
    this.initEvent();
  }

  initEvent() {
    // this.graphics.on('pointerenter', () => {
    //   this.setState(ShapeStateEnum.Hover);
    // });
    // this.graphics.on('pointerout', () => {
    //   this.getState() === ShapeStateEnum.Hover && this.setState(ShapeStateEnum.Normal);
    // });
    // this.graphics.on('pointerdown', () => {
    //   this.setState(ShapeStateEnum.Selected);
    // });
  }

  initProperty() {
    this.propertyMap.set(ShapePropertyEnum.Base, new BaseProperty(this));
    this.propertyMap.set(ShapePropertyEnum.Fill, new FillProperty(this));
  }

  setProperty<T extends Record<string, any>>(type: ShapePropertyEnum, value: T) {
    const property = this.propertyMap.get(type)!;
    property.set(value);
  }

  updateProperty<T extends Record<string, any>>(type: ShapePropertyEnum, value: T) {
    const property = this.propertyMap.get(type)!;
    property.update(value)
  }

  getProperty<T>(type: ShapePropertyEnum) {
    return this.propertyMap.get(type) as T
  }
 
  initDecorate() {
    this.decorateMap.set(ShapeDecorateTypeEnum.HoverBorder, new HoverBorder(this));
    this.decorateMap.set(ShapeDecorateTypeEnum.SelectedBorder, new SelectedBorder(this));
  }

  getDecorate(type: ShapeDecorateTypeEnum) {
    return this.decorateMap.get(type);
  }

  setState(stateType: ShapeStateEnum, onSuccess?: () => void, onError?: () => void) {
    log(`setState from ${this.getState()} to ${stateType}`);

    if (stateType === this.getState()) {
      return;
    }

    if (stateType === ShapeStateEnum.Normal) {
      shapeManager.removeSelectedShapeById(this.id);
    }

    if (stateType === ShapeStateEnum.Selected) {
      shapeManager.setSelectedShape(this);
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
    const p = this.getProperty<BaseProperty>(ShapePropertyEnum.Base).get()
    return {
      width: p.width,
      height: p.height,
    };
  }

  getBounds() {
    return {
      ...this.getPosition(),
      ...this.getWH(),
    };
  }
}
