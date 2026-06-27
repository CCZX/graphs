export interface IAction<T> {
	type: ActionTypeEnum;

	data: T;
}

export interface IActionExecute {
	type: ActionTypeEnum;

	execute(action: IAction<unknown>): void;
}

export const IActionExecute = Symbol('IActionExecute');

export enum ActionTypeEnum {
	/**
	 * 更新图形属性
	 */
	UpdateShapeProps = 'updateShapeProps',
	/**
	 * 创建图形
	 */
	CreateShape = 'createShape',
	/**
	 * 删除图形
	 */
	RemoveShape = 'removeShape',
}
