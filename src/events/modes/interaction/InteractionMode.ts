import { EventModeEnum } from '../../types';
import { Handler } from '../../Handler';
import { ResizeHandler } from './handlers/ResizeHandler';
import { MoveHandler } from './handlers/MoveHandler';
import { SelectHandler } from './handlers/SelectHandler';
import { HoverHandler } from './handlers/HoverHandler';
import { AbsEventMode } from '../AbsEventMode';

export class InteractionMode extends AbsEventMode {
  mode = EventModeEnum.InteractionMode;

  handlerList: Handler[] = [
    new ResizeHandler(),
    new MoveHandler(),
    new SelectHandler(),
    new HoverHandler(),
  ];

  enable(): boolean {
    return true;
  }
}
