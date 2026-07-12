import { ShapeStateEnum } from '../contract';
import { AbsState } from './AbsState';

export class MovingState extends AbsState {
	type: ShapeStateEnum = ShapeStateEnum.Moving;

	allowNextStateTypes = [ShapeStateEnum.Selected, ShapeStateEnum.MultiSelected];

	onActivate() {
		console.log('ccdebug ');
	}

	onDeactivate(): void {}
}
