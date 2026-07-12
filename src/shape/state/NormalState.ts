import { ShapeStateEnum } from '../contract';
import { AbsState } from './AbsState';

export class NormalState extends AbsState {
	type: ShapeStateEnum = ShapeStateEnum.Normal;

	allowNextStateTypes = [
		ShapeStateEnum.Hover,
		ShapeStateEnum.Selected,
		ShapeStateEnum.MultiSelected,
	];

	onActivate() {}

	onDeactivate(): void {}
}
