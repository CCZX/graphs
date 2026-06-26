import { EventModeEnum } from '../../types';
import { Handler } from '../../Handler';
import { ResizeHandler } from './handlers/ResizeHandler';
import { RotateHandler } from './handlers/RotateHandler';
import { MoveHandler } from './handlers/MoveHandler';
import { SelectHandler } from './handlers/SelectHandler';
import { HoverHandler } from './handlers/HoverHandler';
import { AbsEventMode } from '../AbsEventMode';
import { toolStore, ToolType } from '@/store/tool';

export class InteractionMode extends AbsEventMode {
	mode = EventModeEnum.InteractionMode;

	handlerList: Handler[] = [
		new ResizeHandler(),
		new RotateHandler(),
		new MoveHandler(),
		new SelectHandler(),
		new HoverHandler(),
	];

	enable(): boolean {
		const tool = toolStore.getState().activeTool;
		return tool === ToolType.Select;
	}
}
