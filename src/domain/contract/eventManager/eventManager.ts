import { EventModeEnum, EventPayload, HandlerEnum, InteractionState } from '..';

export interface IEventManager {
	start(canvasEl: HTMLElement): void;
}
export const IEventManager = Symbol('IEventManager');

export interface IEventMode {
	mode: EventModeEnum;
	handlerList: IHandler[];

	enable(): boolean;

	onActivate(): void;
	onDeactivate(): void;
}
export const IEventMode = Symbol('IEventMode');

export interface IHandler {
	type: HandlerEnum;

	enable(state: InteractionState): boolean;

	execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean;
}
export const IHandler = Symbol('IHandler');
export const IHandlerWithCreator = Symbol('IHandlerWithCreator');
export const IHandlerWithInteraction = Symbol('IHandlerWithInteraction');
