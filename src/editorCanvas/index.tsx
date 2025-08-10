import { useEffect, useRef } from 'react';
import './index.less';
import { MOCK_SHAPE_DATA } from '../mock/shapeData';
import { Events } from '../events';
import { Stage } from '@/canvas/core/Stage';
import { shapeManager } from '../canvas/shapes/shapeManager';
import { ShapeCreator } from '../canvas/shapes/shapeCreator';

function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const stage = Stage.createStage(containerRef.current);

    const shapeCreator = new ShapeCreator(stage, MOCK_SHAPE_DATA);
    shapeCreator.create();

    // const circle = new Circle();
    // stage.appendShape(circle.container);

    // const text = new Text();
    // stage.appendShape(text.container);

    // const pixiText = new PixiText('hello', { fontSize: 12 });
    // pixiText.x = 400;
    // pixiText.y = 400;
    // pixiText.resolution = 128
    // stage.appendShape(pixiText);

    window.addEventListener(
      'pointerdown',
      () => {
        for (const [k, v] of shapeManager.getSelectedShapes()) {
          // v.setState(ShapeStateEnum.Normal)
        }
      },
      true,
    );

    const events = new Events();
    events.start();

    return () => {
      stage.destory();
    };
  }, []);

  return <div ref={containerRef} className='editor-canvas-container' />;
}

export default EditorCanvas;
