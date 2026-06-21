import { EventModeEnum } from '../types';
import { Handler } from '../Handler';

export abstract class AbsEventMode {
  abstract mode: EventModeEnum;
  abstract handlerList: Handler[];

  abstract enable(): boolean;

  onActivate(): void {}
  onDeactivate(): void {}
}
