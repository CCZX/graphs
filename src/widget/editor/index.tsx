import { useEffect, useRef } from 'react';
import './index.less';
import { MOCK_SHAPE_DATA } from './shapeData';
import { Stage } from '@/canvas/core/Stage';
import { useInject } from '@/common/context';
import { ICanvasInitService, IEventManager, IShortcutKeyManager } from '@/domain/contract';
import { IViewportService } from '@/domain/contract/ViewportService';

function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const eventManager = useInject<IEventManager>(IEventManager);
	const canvasInitService = useInject<ICanvasInitService>(ICanvasInitService);
	const shortcutKeyManager = useInject<IShortcutKeyManager>(IShortcutKeyManager);
	const viewportService = useInject<IViewportService>(IViewportService);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const stage = Stage.createStage(containerRef.current);

		viewportService.setStage(stage);

		canvasInitService.init(MOCK_SHAPE_DATA);
		eventManager.start(containerRef.current);
		shortcutKeyManager.start();

		return () => {
			shortcutKeyManager.stop();
			eventManager.stop();
			stage.destroy();
		};
	}, []);

	return <div ref={containerRef} className='editor-canvas-container' />;
}

export default Editor;
