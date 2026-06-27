import { provide } from 'inversify-binding-decorators';
import { IShortcutKey, IShortcutKeyManager } from '../../contract';
import { multiInject } from 'inversify';

@provide(IShortcutKeyManager)
export class ShortcutKeyManager implements IShortcutKeyManager {
	@multiInject(IShortcutKey)
	private shortcutKeys: IShortcutKey[] = [];

	start() {
		window.addEventListener('keydown', (e) => {
			this.shortcutKeys.forEach((key) => {
				if (key.isMatch()) {
					key.onKeyDown();
				}
			});
		});
		window.addEventListener('keyup', (e) => {
			this.shortcutKeys.forEach((key) => {
				if (key.isMatch()) {
					key.onKeyUp();
				}
			});
		});
	}
}
