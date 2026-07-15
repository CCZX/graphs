import {
	EventModeEnum,
	IEventMode,
	IHandler,
	IHandlerWithInteraction,
} from '../../../../contract/eventManager';
import { ToolType, IToolService } from '@/domain/contract/ToolService';
import { inject, multiInject, postConstruct } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IEventMode)
export class InteractionMode implements IEventMode {
	mode = EventModeEnum.InteractionMode;

	@multiInject(IHandlerWithInteraction)
	handlerList: IHandler[] = [];

	@postConstruct()
	sortHandlers() {
		this.handlerList.sort((a, b) => a.sort - b.sort);
	}

	@inject(IToolService)
	private toolService!: IToolService;

	enable(): boolean {
		const tool = this.toolService.store.getState().activeTool;
		return tool === ToolType.Select;
	}

	onActivate(): void {}
	onDeactivate(): void {}
}
