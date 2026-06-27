export interface IocContainerService {
	get<T>(identifier: any): T;
}

export const IocContainerService = Symbol('IocContainerService');
