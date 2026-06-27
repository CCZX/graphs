export interface IShortcutKeyManager {
	start(): void;
}

export const IShortcutKeyManager = Symbol('IShortcutKeyManager');

export interface IShortcutKey {
	name: string;

	key: string;

	fnKeys: string[];

	isMatch(): boolean;

	onKeyDown(): void;

	onKeyUp(): void;
}

export const IShortcutKey = Symbol('IShortcutKey');
