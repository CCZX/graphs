import { HandlerEnum, InteractionState, EventPayload } from './types';

export abstract class Handler {
	abstract type: HandlerEnum;
	protected ioc: IocContainer;

	constructor(ioc: IocContainer) {
		this.ioc = ioc;
	}

	abstract enable(state: InteractionState): boolean;

	abstract execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean;
}
