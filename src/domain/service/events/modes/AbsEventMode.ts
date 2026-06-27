import { EventModeEnum } from '../types';
import { Handler } from '../Handler';

export abstract class AbsEventMode {
	abstract mode: EventModeEnum;
	abstract handlerList: Handler[];

	protected ioc: IocContainer;

	constructor(ioc: IocContainer) {
		this.ioc = ioc;
	}

	abstract enable(): boolean;

	onActivate(): void {}
	onDeactivate(): void {}
}
