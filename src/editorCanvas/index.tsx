import { useEffect, useRef } from 'react';
import './index.less';
import { MOCK_SHAPE_DATA } from '../mock/shapeData';
import { EventManager } from '../events';
import { Stage } from '@/canvas/core/Stage';
import { ShapeCreator } from '../canvas/shapes/shapeCreator';
import { shapeManager } from '@/canvas/shapes/shapeManager';

function EditorCanvas() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const stage = Stage.createStage(containerRef.current);

		shapeManager.setStage(stage);

		const shapeCreator = new ShapeCreator(stage, MOCK_SHAPE_DATA);
		shapeCreator.create();

		const eventManager = new EventManager();
		eventManager.start(containerRef.current);

		return () => {
			stage.destory();
		};
	}, []);

	return <div ref={containerRef} className='editor-canvas-container' />;
}

export default EditorCanvas;
