import { EventModeEnum } from '../../types';
import { Handler } from '../../Handler';
import { AbsEventMode } from '../AbsEventMode';

export class CreatorMode extends AbsEventMode {
  mode = EventModeEnum.CreatorMode;

  handlerList: Handler[] = [];

  enable(): boolean {
    return false;
  }
}
