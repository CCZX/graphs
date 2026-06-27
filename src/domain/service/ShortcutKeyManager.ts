import { provide } from 'inversify-binding-decorators';
import { IShortcutKeyManager } from '../contract';

@provide(IShortcutKeyManager)
export class ShortcutKeyManager implements IShortcutKeyManager {}
