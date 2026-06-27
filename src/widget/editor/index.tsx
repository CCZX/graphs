import { useEffect, useRef } from 'react';
import './index.less';
import { MOCK_SHAPE_DATA } from './shapeData';
import { Stage } from '@/canvas/core/Stage';
import { useInject, useIOCContainer } from '@/common/context';
import { ICanvasInitService, IEventManager, IShapeManager } from '@/domain/contract';

function Editor() {
	const containerRef = useRef<HTMLDivElement>(null);
	const eventManager = useInject<IEventManager>(IEventManager);
	const canvasInitService = useInject<ICanvasInitService>(ICanvasInitService);
	const shapeManager = useInject<IShapeManager>(IShapeManager);
	const ioc = useIOCContainer();

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const stage = Stage.createStage(containerRef.current);

		shapeManager.setStage(stage);

		canvasInitService.init(MOCK_SHAPE_DATA, ioc);
		eventManager.start(containerRef.current, ioc);

		return () => {
			stage.destory();
		};
	}, []);

	return <div ref={containerRef} className='editor-canvas-container' />;
}

export default Editor;
