import { ShapeStateEnum } from '../../../types/shape';
import { warn } from '../../../utils/log';
import { BaseShape } from '../BaseShape';
import { EditState } from './EditState';
import { HoverState } from './HoverState';
import { MovingState } from './MovingState';
import { NormalState } from './NormalState';
import { ResizingState } from './ResizingState';
import { RotatingState } from './RotatingState';
import { SelectedState } from './SelectedState';

export class StateFactory {
	static create(state: ShapeStateEnum, shape: BaseShape) {
		if (state === ShapeStateEnum.Normal) {
			return new NormalState(shape);
		} else if (state === ShapeStateEnum.Hover) {
			return new HoverState(shape);
		} else if (state === ShapeStateEnum.Selected) {
			return new SelectedState(shape);
		} else if (state === ShapeStateEnum.Edit) {
			return new EditState(shape);
		} else if (state === ShapeStateEnum.Moving) {
			return new MovingState(shape);
		} else if (state === ShapeStateEnum.Resizing) {
			return new ResizingState(shape);
		} else if (state === ShapeStateEnum.Rotating) {
			return new RotatingState(shape);
		}

		warn('没有找到对应的 state, 回退到 normal state');

		return new NormalState(shape);
	}
}
