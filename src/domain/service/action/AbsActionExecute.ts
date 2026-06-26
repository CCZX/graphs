import { AbsAction } from './AbsAction';
import { ActionTypeEnum } from './type';

export abstract class AbsActionExecute<T = unknown> {
	abstract type: ActionTypeEnum;

	abstract execute(action: AbsAction<T>): void;
}
