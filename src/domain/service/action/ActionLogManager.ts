import { IAction, IActionLogManager } from '../../contract';
import { provide } from 'inversify-binding-decorators';

@provide(IActionLogManager)
export class ActionLogManager implements IActionLogManager {
	private undoStack: IAction<unknown>[] = [];
	private redoStack: IAction<unknown>[] = [];

	setStreamStart() {}

	setStreamEnd() {}

	addAction(log: IAction<unknown>) {}
}
