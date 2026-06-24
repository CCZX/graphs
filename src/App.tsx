import { FC } from 'react';
import EditorCanvas from './canvas/components/editorCanvas';
import { Toolbar } from './widget/toolbar';
import { Property } from './widget/property';

interface DemoProps {}

const App: FC<DemoProps> = (_props) => {
	return (
		<div className='app-layout'>
			<Toolbar />
			<EditorCanvas />
			<Property />
		</div>
	);
};

export default App;
