import { IActionExecute, IActionManager } from '@/domain/contract/action';
import { AbsAction } from './AbsAction';
import { CreateShapeActionExecute } from './actionExecutes/CreateShpeActionExecute';
import { provide } from 'inversify-binding-decorators';
import { multiInject } from 'inversify';

@provide(IActionManager)
export class ActionManager implements IActionManager {
	@multiInject(IActionExecute)
	private executeList: IActionExecute[] = [];

	push(action: AbsAction) {
		const execute = this.executeList.find((item) => item.type === action.type);
		if (execute) {
			execute.execute(action);
		}
	}
}
