import { FC } from 'react';
import Editor from './widget/editor';
import { Toolbar } from './widget/toolbar';
import { Property } from './widget/property';

interface DemoProps {}

const App: FC<DemoProps> = (_props) => {
	return (
		<div className='app-layout'>
			<Toolbar />
			<Editor />
			<Property />
		</div>
	);
};

export default App;
