import { ShapeDecorateTypeEnum } from '../contract';
import { BaseShape } from '../BaseShape';

export abstract class AbsDecorate {
	public abstract type: ShapeDecorateTypeEnum;

	protected shape: BaseShape;

	constructor(shape: BaseShape) {
		this.shape = shape;
	}

	public abstract onActivate(): void;

	public abstract onDeactivate(): void;

	public refresh(): void {}
}
