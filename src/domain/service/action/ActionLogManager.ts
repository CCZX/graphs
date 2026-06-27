import { inject } from 'inversify';
import { IAction, IActionLogManager, IActionManager } from '../../contract';
import { provide } from 'inversify-binding-decorators';
import { IocContainerService } from '@/common/contract';

@provide(IActionLogManager)
export class ActionLogManager implements IActionLogManager {
	@inject(IocContainerService)
	private ioc!: IocContainerService;

	private undoStack: IAction<unknown>[] = [];
	private redoStack: IAction<unknown>[] = [];

	setStreamStart() {}

	setStreamEnd() {}

	undo() {
		if (this.undoStack.length === 0) {
			return;
		}
		const backAction = this.undoStack.pop();
		if (backAction) {
			const actionManager = this.ioc.get<IActionManager>(IActionManager);
			actionManager.push(backAction);
		}
	}

	redo() {}

	addAction(action: IAction<unknown>) {
		const backAction = action.genBackAction();
		this.undoStack.push(backAction);
	}
}
