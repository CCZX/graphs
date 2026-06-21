import { FC } from 'react';
import EditorCanvas from './editorCanvas';
import { PropertiesPanel } from './components/propertiesPanel';

interface DemoProps {}

const App: FC<DemoProps> = (_props) => {
  return (
    <div className="app-layout">
      <EditorCanvas />
      <PropertiesPanel />
    </div>
  );
};

export default App;
