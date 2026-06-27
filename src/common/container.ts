import { Container } from 'inversify';
import { buildProviderModule } from 'inversify-binding-decorators';
import '@/domain';
import './service';

const container = new Container();
container.load(buildProviderModule());

export { container };
