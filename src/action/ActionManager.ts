import { AbsAction } from './AbsAction';
import { AbsActionExecute } from './AbsActionExecute';
import { CreateShapeActionExecute } from './actionExecutes/CreateShpeActionExecute';

class ActionManager {
	private executeList: AbsActionExecute[] = [
		new CreateShapeActionExecute(),
	];

	push(action: AbsAction) {
		const execute = this.executeList.find((item) => item.type === action.type);
		if (execute) {
			execute.execute(action);
		}
	}
}

export const actionManager = new ActionManager();
