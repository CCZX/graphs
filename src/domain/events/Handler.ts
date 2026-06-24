import { HandlerEnum, InteractionState, EventPayload } from './types';

export abstract class Handler {
	abstract type: HandlerEnum;

	abstract enable(state: InteractionState): boolean;

	abstract execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean;
}
