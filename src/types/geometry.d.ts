import { Container } from 'inversify';

declare global {
	interface Rectangle {
		x: number;
		y: number;
		width: number;
		height: number;
		angle?: number;
	}

	interface Point {
		x: number;
		y: number;
	}

	type IocContainer = Container;
}

export {};
