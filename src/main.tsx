import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'reflect-metadata';
import './normalized.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
