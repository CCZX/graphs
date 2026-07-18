import { ShapeStateEnum } from '../contract';
import { BaseShape } from '../BaseShape';

export abstract class AbsState {
	public abstract type: ShapeStateEnum;

	protected shape: BaseShape;

	constructor(shape: BaseShape) {
		this.shape = shape;
	}

	public abstract onActivate(): void;

	public abstract onDeactivate(): void;

	public allowNextStateTypes: ShapeStateEnum[] = [];
}
