import { IocContainerService } from '@/common/contract';
import { ActionTypeEnum, IAction } from '../../contract/action';

export abstract class AbsAction<T = unknown> implements IAction<T> {
	protected ioc: IocContainerService;

	protected needAddLog = true;

	abstract type: ActionTypeEnum;

	abstract data: T;

	constructor(ioc: IocContainerService) {
		this.ioc = ioc;
	}

	abstract genBackAction(): IAction<T>;

	public setNeedAddLog(needAdd: boolean) {
		this.needAddLog = needAdd;
	}

	public getNeedAddLog(): boolean {
		return this.needAddLog;
	}
}
