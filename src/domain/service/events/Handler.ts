import { IocContainerService } from '@/common/contract';
import { HandlerEnum, InteractionState, EventPayload } from './types';

export abstract class Handler {
	abstract type: HandlerEnum;
	protected ioc: IocContainerService;

	constructor(ioc: IocContainerService) {
		this.ioc = ioc;
	}

	abstract enable(state: InteractionState): boolean;

	abstract execute(e: PointerEvent, state: InteractionState, payload: EventPayload): boolean;
}
