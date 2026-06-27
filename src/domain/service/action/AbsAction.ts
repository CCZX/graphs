import { IocContainerService } from '@/common/contract';
import { ActionTypeEnum } from '../../contract/action';

export abstract class AbsAction<T = unknown> {
	abstract type: ActionTypeEnum;

	abstract data: T;

	protected ioc: IocContainerService;

	constructor(ioc: IocContainerService) {
		this.ioc = ioc;
	}

	abstract genBackAction(): AbsAction<T>;
}
