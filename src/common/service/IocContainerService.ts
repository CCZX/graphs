import { provide } from 'inversify-binding-decorators';
import { IocContainerService as IIocContainerService } from '../contract';
import { container } from '../container';

@provide(IIocContainerService)
export class IocContainerService implements IIocContainerService {
	get<T>(identifier: any): T {
		return container.get(identifier);
	}
}
