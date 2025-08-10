import { ShapeStateEnum } from '../../../types/shape';
import { AbsState } from './AbsState';

export class NormalState extends AbsState {
  type: ShapeStateEnum = ShapeStateEnum.Normal;

  allowNextStateTypes = [ShapeStateEnum.Hover, ShapeStateEnum.Selected];

  onActivate() {}

  onDeactivate(): void {}
}
