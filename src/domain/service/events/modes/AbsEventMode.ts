import { EventModeEnum } from '../types';
import { Handler } from '../Handler';
import { IocContainerService } from '@/common/contract';

export abstract class AbsEventMode {
	abstract mode: EventModeEnum;
	abstract handlerList: Handler[];

	protected ioc: IocContainerService;

	constructor(ioc: IocContainerService) {
		this.ioc = ioc;
	}

	abstract enable(): boolean;

	onActivate(): void {}
	onDeactivate(): void {}
}
