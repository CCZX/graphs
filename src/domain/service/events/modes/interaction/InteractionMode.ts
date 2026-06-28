import {
	EventModeEnum,
	IEventMode,
	IHandler,
	IHandlerWithInteraction,
} from '../../../../contract/eventManager';
import { toolStore, ToolType } from '@/store/tool';
import { fluentProvide } from 'inversify-binding-decorators';
import { multiInject } from 'inversify';

// @ts-expect-error
@fluentProvide(IEventMode).inSingletonScope().done()
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
