/**
 * 图形的类型
 */
export enum ShapeTypeEnum {
  Circle = 'circle',
  Rectangle = 'rectangle',
  Text = 'text',
  Line = 'line',
}

/**
 * 图形的状态
 */
export enum ShapeStateEnum {
  Normal = 'normal',
  Hover = 'hover',
  Selected = 'selected',

  /**
   * 编辑态，只有文字拥有此状态
   */
  Edit = 'edit',
}

/**
 * 图形装饰器的类型
 * exp: hover 图形的时候需要出现 hover 框
 */
export enum ShapeDecorateTypeEnum {
  HoverBorder = 'hoverBorder',
  SelectedBorder = 'selectedBorder',
}

export enum ShapePropertyEnum {
  /**
   * 基础属性，比如：位置、尺寸等
   */
  Base = 'base',
  Fill = 'fill',
  Text = 'text',
}

export interface BasePropertyValue {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FillPropertyValue {
  color: number;
  /**
   * 透明度
   */
  alpha: number;
}

export interface TextPropertyValue {
  text: string;
}

export interface ShapeData {
  id: string;
  type: ShapeTypeEnum;
  properties: {
    base: BasePropertyValue;
    fill: FillPropertyValue;
    text?: TextPropertyValue;
  };
}
