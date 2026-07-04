import { IActionLogManager, IShortcutKey } from '@/domain/contract';
import { inject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IShortcutKey)
export class RedoShortcutKey implements IShortcutKey {
	@inject(IActionLogManager)
	private actionLogManager!: IActionLogManager;

	name = '重做';
	key = 'z';
	fnKeys = ['Ctrl+Shift+Z'];

	isMatch(e: KeyboardEvent): boolean {
		return (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z';
	}

	onKeyDown(_e: KeyboardEvent): void {
		this.actionLogManager.redo();
	}

	onKeyUp(_e: KeyboardEvent): void {}
}
