import { ShapeStateEnum } from '../contract';
import { AbsState } from './AbsState';

export class MultiSelectedState extends AbsState {
	type: ShapeStateEnum = ShapeStateEnum.MultiSelected;

	allowNextStateTypes: ShapeStateEnum[] = [
		ShapeStateEnum.Normal,
		ShapeStateEnum.Moving,
		ShapeStateEnum.Resizing,
		ShapeStateEnum.Rotating,
	];

	onActivate() {}

	onDeactivate(): void {}
}
