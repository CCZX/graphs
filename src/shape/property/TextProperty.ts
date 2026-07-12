import { AbsProperty } from './AbsProperty';
import { TextPropertyValue } from '../contract';
import { BaseShape } from '../BaseShape';

const DEFAULT_VALUE: TextPropertyValue = { text: '' };

export class TextProperty extends AbsProperty<TextPropertyValue> {
	constructor(shape: BaseShape, value?: TextPropertyValue) {
		super(shape, value || DEFAULT_VALUE);
	}

	draw(): void {
		(this.shape.graphics as { text?: string }).text = this.value.text;
	}
}
