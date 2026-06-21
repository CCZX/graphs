import { ShapeDecorateTypeEnum, ShapeStateEnum } from '../../../types/shape';
import { AbsState } from './AbsState';

export class ResizingState extends AbsState {
  type: ShapeStateEnum = ShapeStateEnum.Resizing;

  allowNextStateTypes = [ShapeStateEnum.Selected];

  onActivate() {
    this.shape.getDecorate(ShapeDecorateTypeEnum.SelectedBorder)?.onActivate();
  }

  onDeactivate(): void {
    this.shape.getDecorate(ShapeDecorateTypeEnum.SelectedBorder)?.onDeactivate();
  }
}
