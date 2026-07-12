import { ShapeStateEnum } from '../contract';
import { AbsState } from './AbsState';

export class EditState extends AbsState {
	type: ShapeStateEnum = ShapeStateEnum.Edit;

	allowNextStateTypes = [ShapeStateEnum.Normal, ShapeStateEnum.Selected];

	onActivate() {
		this.shape.showTextInput();
	}

	onDeactivate(): void {
		this.shape.commitTextInput();
		this.shape.hideTextInput();
	}
}
