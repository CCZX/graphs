import { ShapeStateEnum } from '../../../types/shape';
import { AbsState } from './AbsState';

export class MovingState extends AbsState {
  type: ShapeStateEnum = ShapeStateEnum.Moving;

  allowNextStateTypes = [ShapeStateEnum.Selected];

  onActivate() {
    console.log('ccdebug ')
  }

  onDeactivate(): void {}
}
