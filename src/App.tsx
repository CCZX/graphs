import { FC } from 'react';
import EditorCanvas from './editorCanvas';
import { Toolbar } from './components/toolbar';
import { PropertiesPanel } from './components/propertiesPanel';

interface DemoProps {}

const App: FC<DemoProps> = (_props) => {
	return (
		<div className='app-layout'>
			<Toolbar />
			<EditorCanvas />
			<PropertiesPanel />
		</div>
	);
};

export default App;
