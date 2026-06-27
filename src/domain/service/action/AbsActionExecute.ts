import { injectable } from 'inversify';
import { AbsAction } from './AbsAction';
import { ActionTypeEnum, IActionExecute } from '../../contract/action';

@injectable()
export abstract class AbsActionExecute<T = unknown> implements IActionExecute {
	abstract type: ActionTypeEnum;

	abstract execute(action: AbsAction<T>): void;
}
