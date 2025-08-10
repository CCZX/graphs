import { ShapeDecorateTypeEnum, ShapeStateEnum } from '../../../types/shape';
import { warn } from '../../../utils/log';
import { AbsState } from './AbsState';

export class HoverState extends AbsState {
  type: ShapeStateEnum = ShapeStateEnum.Hover;

  allowNextStateTypes = [ShapeStateEnum.Normal, ShapeStateEnum.Selected];

  onActivate() {
    const hoverBorder = this.shape.getDecorate(ShapeDecorateTypeEnum.HoverBorder);
    if (!hoverBorder) {
      warn(`没有找到 ${ShapeDecorateTypeEnum.HoverBorder} 对应的装饰`);
      return;
    }
    hoverBorder.onActivate();
  }

  onDeactivate() {
    const hoverBorder = this.shape.getDecorate(ShapeDecorateTypeEnum.HoverBorder);
    if (!hoverBorder) {
      warn(`没有找到 ${ShapeDecorateTypeEnum.HoverBorder} 对应的装饰`);
      return;
    }
    hoverBorder.onDeactivate();
  }
}
