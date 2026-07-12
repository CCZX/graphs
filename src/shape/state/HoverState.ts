import { ShapeDecorateTypeEnum, ShapeStateEnum } from '../contract';
import { AbsState } from './AbsState';

export class HoverState extends AbsState {
	type: ShapeStateEnum = ShapeStateEnum.Hover;

	allowNextStateTypes = [
		ShapeStateEnum.Normal,
		ShapeStateEnum.Selected,
		ShapeStateEnum.MultiSelected,
	];

	onActivate() {
		const hoverBorder = this.shape.getDecorate(ShapeDecorateTypeEnum.HoverBorder);
		if (!hoverBorder) {
			return;
		}
		hoverBorder.onActivate();
	}

	onDeactivate() {
		const hoverBorder = this.shape.getDecorate(ShapeDecorateTypeEnum.HoverBorder);
		if (!hoverBorder) {
			return;
		}
		hoverBorder.onDeactivate();
	}
}
