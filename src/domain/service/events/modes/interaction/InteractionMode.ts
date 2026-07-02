import {
	EventModeEnum,
	IEventMode,
	IHandler,
	IHandlerWithInteraction,
} from '../../../../contract/eventManager';
import { toolStore, ToolType } from '@/store/tool';
import { multiInject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IEventMode)
export class InteractionMode implements IEventMode {
	mode = EventModeEnum.InteractionMode;

	@multiInject(IHandlerWithInteraction)
	handlerList: IHandler[] = [];

	enable(): boolean {
		const tool = toolStore.getState().activeTool;
		return tool === ToolType.Select;
	}

	onActivate(): void {}
	onDeactivate(): void {}
}
