export interface IEventManager {
	start(canvasEl: HTMLElement): void;
}
export const IEventManager = Symbol('IEventManager');
