import { ActionTypeEnum } from './type';

export abstract class AbsAction<T = unknown> {
	abstract type: ActionTypeEnum;

	abstract data: T;
}
