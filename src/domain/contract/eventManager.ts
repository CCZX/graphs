export interface IEventManager {
	start(canvasEl: HTMLElement, ioc: IocContainer): void;
}
export const IEventManager = Symbol('IEventManager');
