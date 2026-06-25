import { ShapeStateEnum } from '../shape';
import { AbsState } from './AbsState';

export class EditState extends AbsState {
	type: ShapeStateEnum = ShapeStateEnum.Edit;

	onActivate() {}

	onDeactivate(): void {}
}
