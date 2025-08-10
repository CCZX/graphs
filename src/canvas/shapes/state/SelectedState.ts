import { ShapeDecorateTypeEnum, ShapeStateEnum } from '../../../types/shape';
import { warn } from '../../../utils/log';
import { AbsState } from './AbsState';

export class SelectedState extends AbsState {
  type: ShapeStateEnum = ShapeStateEnum.Selected;

  allowNextStateTypes: ShapeStateEnum[] = [ShapeStateEnum.Normal];

  onActivate() {
    const selectedBorder = this.shape.getDecorate(ShapeDecorateTypeEnum.SelectedBorder);
    if (!selectedBorder) {
      warn(`没有找到 ${ShapeDecorateTypeEnum.SelectedBorder} 对应的装饰`);
      return;
    }
    selectedBorder.onActivate();
  }

  onDeactivate(): void {
    const selectedBorder = this.shape.getDecorate(ShapeDecorateTypeEnum.SelectedBorder);
    if (!selectedBorder) {
      warn(`没有找到 ${ShapeDecorateTypeEnum.SelectedBorder} 对应的装饰`);
      return;
    }
    selectedBorder.onDeactivate();
  }
}
