export interface IDestroyable {
	destroy(): void;
}

export const IDestroyable = Symbol('IDestroyable');
