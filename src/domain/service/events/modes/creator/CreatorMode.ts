import {
	EventModeEnum,
	IEventMode,
	IHandler,
	IHandlerWithCreator,
} from '../../../../contract/eventManager';
import { toolStore } from '@/store/tool';
import { multiInject } from 'inversify';
import { fluentProvideWithSingle } from '@/common/context';

@fluentProvideWithSingle(IEventMode)
export class CreatorMode implements IEventMode {
	mode = EventModeEnum.CreatorMode;

	@multiInject(IHandlerWithCreator)
	handlerList: IHandler[] = [];

	enable(): boolean {
		const tool = toolStore.getState().activeTool;
		return tool !== null && tool !== 'select' && tool !== 'pen' && tool !== 'eraser';
	}

	onActivate(): void {}
	onDeactivate(): void {}
}
