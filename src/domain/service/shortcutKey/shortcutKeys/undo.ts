import { IActionLogManager, IShortcutKey } from '@/domain/contract';
import { inject } from 'inversify';
import { fluentProvide } from 'inversify-binding-decorators';

// @ts-ignore
@fluentProvide(IShortcutKey).inSingletonScope().done()
export class UndoShortcutKey implements IShortcutKey {
	@inject(IActionLogManager)
	private actionLogManager!: IActionLogManager;

	name = '撤销';
	key = 'z';
	fnKeys = ['Ctrl+Z'];

	isMatch(): boolean {
		return true;
	}

	onKeyDown(): void {
		this.actionLogManager.undo();
		console.log('撤销');
	}

	onKeyUp(): void {}
}
