import { provide } from 'inversify-binding-decorators';
import { ILoggerService } from '../contract';

@provide(ILoggerService)
export class LoggerService implements ILoggerService {
	log(message: string): void {
		console.log(`[log]: ${message}`);
	}

	warn(message: string): void {
		console.warn(`[warn]: ${message}`);
	}

	error(message: string): void {
		console.error(`[error]: ${message}`);
	}
}
