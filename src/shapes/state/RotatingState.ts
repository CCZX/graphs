import { ShapeDecorateTypeEnum, ShapeStateEnum } from '../shape';
import { AbsState } from './AbsState';

export class RotatingState extends AbsState {
	type: ShapeStateEnum = ShapeStateEnum.Rotating;

	allowNextStateTypes = [ShapeStateEnum.Selected];

	onActivate() {
		this.shape.getDecorate(ShapeDecorateTypeEnum.SelectedBorder)?.onActivate();
	}

	onDeactivate(): void {
		this.shape.getDecorate(ShapeDecorateTypeEnum.SelectedBorder)?.onDeactivate();
	}
}
