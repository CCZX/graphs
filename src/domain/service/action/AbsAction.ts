import { ActionTypeEnum } from '../../contract/action';

export abstract class AbsAction<T = unknown> {
	abstract type: ActionTypeEnum;

	abstract data: T;

	abstract genBackAction(): AbsAction<T>;
}
