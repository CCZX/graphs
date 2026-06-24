import { FC } from 'react';
import EditorCanvas from './canvas/components/editorCanvas';
import { Toolbar } from './widget/toolbar';
import { PropertiesPanel } from './widget/propertiesPanel';

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
