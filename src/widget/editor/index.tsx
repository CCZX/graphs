import { useEffect, useRef } from 'react';
import './index.less';
import { MOCK_SHAPE_DATA } from './shapeData';
import { Stage } from '@/canvas/core/Stage';
import { shapeManager } from '@/domain/service/shapeManager';
import { useInject, useIOCContainer } from '@/common/context';
import { ICanvasInitService, IEventManager } from '@/domain/contract';

function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const eventManager = useInject<IEventManager>(IEventManager);
	const canvasInitService = useInject<ICanvasInitService>(ICanvasInitService);
	const ioc = useIOCContainer();

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const stage = Stage.createStage(containerRef.current);

		shapeManager.setStage(stage);

		canvasInitService.init(MOCK_SHAPE_DATA, ioc);
		eventManager.start(containerRef.current);

		return () => {
			stage.destory();
		};
	}, []);

	return <div ref={containerRef} className='editor-canvas-container' />;
}

export default Editor;
