import { warn } from '../../../utils/log';
import { BaseShape } from '../BaseShape';
import { AbsState } from './AbsState';
import { NormalState } from './NormalState';

/**
 * shape 状态管理
 */
export class StateMachine {
  private state: AbsState;

  constructor(shape: BaseShape) {
    this.state = new NormalState(shape);
  }

  setState(state: AbsState, onSuccess?: () => void, onError?: () => void) {
    const nextStateType = state.type;
    const allowNextStateTypes = this.state.allowNextStateTypes;

    if (!allowNextStateTypes.includes(nextStateType)) {
      warn(`状态切换失败：${this.state.type} -> ${nextStateType}`);
      onError && onError();
      return;
    }

    this.state.onDeactivate();

    state.onActivate();

    this.state = state;

    onSuccess && onSuccess();
  }

  getState() {
    return this.state.type;
  }
}
