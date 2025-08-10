import { FC } from 'react';
import EditorCanvas from './editorCanvas';

interface DemoProps {}

const App: FC<DemoProps> = (props) => {
  return (
    <>
      <EditorCanvas />
    </>
  );
};

export default App;
