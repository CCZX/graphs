import { createContext, useContext, ReactNode } from 'react';
import { Container, interfaces, multiInject } from 'inversify';
import { container } from './container';
import { fluentProvide, provide } from 'inversify-binding-decorators';

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

export function useMultiInject<T>(token: symbol): T[] {
	const container = useContext(DIContext);
	if (!container) {
		throw new Error('useMultiInject must be used within a ContextProvider');
	}
	try {
		return container.getAll<T>(token);
	} catch (error) {
		return [];
	}
}

/**
 * 提供一个单例 service
 */
export function fluentProvideWithSingle(token: symbol) {
	return fluentProvide(token).inSingletonScope().done();
}

/**
 * 一个 service 实现多个 interface
 */
export function provideMultiple(...identifiers: interfaces.ServiceIdentifier<any>[]) {
	return function (target: any) {
		identifiers.forEach((id) => provide(id, true)(target));
	};
}
