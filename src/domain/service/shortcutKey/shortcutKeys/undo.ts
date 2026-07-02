import { IActionLogManager, IShortcutKey } from '@/domain/contract';
import { inject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IShortcutKey)
export class UndoShortcutKey implements IShortcutKey {
	@inject(IActionLogManager)
	private actionLogManager!: IActionLogManager;

	name = '撤销';
	key = 'z';
	fnKeys = ['Ctrl+Z'];

	isMatch(e: KeyboardEvent): boolean {
		return (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z';
	}

	onKeyDown(_e: KeyboardEvent): void {
		this.actionLogManager.undo();
	}

	onKeyUp(_e: KeyboardEvent): void {}
}
