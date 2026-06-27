import { ShapeDecorateTypeEnum, ShapeStateEnum } from '../contract';
import { AbsState } from './AbsState';

export class SelectedState extends AbsState {
	type: ShapeStateEnum = ShapeStateEnum.Selected;

	allowNextStateTypes: ShapeStateEnum[] = [
		ShapeStateEnum.Normal,
		ShapeStateEnum.Moving,
		ShapeStateEnum.Resizing,
		ShapeStateEnum.Rotating,
	];

	onActivate() {
		const selectedBorder = this.shape.getDecorate(ShapeDecorateTypeEnum.SelectedBorder);
		if (!selectedBorder) {
			return;
		}
		selectedBorder.onActivate();
	}

	onDeactivate(): void {
		const selectedBorder = this.shape.getDecorate(ShapeDecorateTypeEnum.SelectedBorder);
		if (!selectedBorder) {
			return;
		}
		selectedBorder.onDeactivate();
	}
}
