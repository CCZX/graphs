import { EventModeEnum } from '../../types';
import { Handler } from '../../Handler';
import { AbsEventMode } from '../AbsEventMode';
import { CreateHandler } from './handlers/CreateHandler';
import { toolStore } from '@/store/tool';

export class CreatorMode extends AbsEventMode {
	mode = EventModeEnum.CreatorMode;

	handlerList: Handler[] = [];

	constructor(ioc: IocContainer) {
		super(ioc);
		this.handlerList = [new CreateHandler(ioc)];
	}

	enable(): boolean {
		const tool = toolStore.getState().activeTool;
		return tool !== null && tool !== 'select' && tool !== 'pen' && tool !== 'eraser';
	}
}
