import { createContext, useContext, ReactNode } from 'react';
import { Container } from 'inversify';
import { container } from './container';

const DIContext = createContext<Container | null>(null);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
	return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
};

export function useInject<T>(token: symbol): T {
	const container = useContext(DIContext);
	if (!container) {
		throw new Error('useInject must be used within a ContextProvider');
	}
	return container.get<T>(token);
}

export function useIOCContainer() {
	const container = useContext(DIContext);
	if (!container) {
		throw new Error('useIOCContainer must be used within a ContextProvider');
	}

	return container;
}
