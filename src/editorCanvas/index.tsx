import { useEffect, useRef } from 'react';
import './index.less';
import { MOCK_SHAPE_DATA } from '../mock/shapeData';
import { EventManager } from '../events';
import { Stage } from '@/canvas/core/Stage';
import { stageRef } from '@/canvas/core/stageRef';
import { ShapeCreator } from '../canvas/shapes/shapeCreator';

function EditorCanvas() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}

		const stage = Stage.createStage(containerRef.current);
		stageRef.current = stage;

		const shapeCreator = new ShapeCreator(stage, MOCK_SHAPE_DATA);
		shapeCreator.create();

		const eventManager = new EventManager();
		eventManager.start(containerRef.current);

		return () => {
			stageRef.current = null;
			stage.destory();
		};
	}, []);

	return <div ref={containerRef} className='editor-canvas-container' />;
}

export default EditorCanvas;
