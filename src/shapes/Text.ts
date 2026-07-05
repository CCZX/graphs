import { Point, Text as PixiText, TextStyle } from 'pixi.js';
import { viewportStore } from '../store/viewport';
import { ShapeContext, ShapePropertyEnum, ShapeStateEnum, ShapeTypeEnum } from './contract';
import { BaseShape } from './BaseShape';
import { TextProperty } from './property/TextProperty';

// @ts-expect-error
export class Text extends BaseShape<PixiText> {
	private inputDOM: HTMLInputElement | undefined;

	type = ShapeTypeEnum.Text;

	style: TextStyle = new TextStyle({
		fontSize: 16,
	});

	constructor(id: string, context: ShapeContext) {
		super(id, new PixiText(), context);
		this.initInputDOM();
		this.addEventListener();

		this.graphics.text = 'input text';
		this.graphics.style = this.style;
		this.graphics.interactive = true;
		this.graphics.resolution = 16;
	}

	// ---- property ----

	protected initProperty() {
		super.initProperty();
		// @ts-ignore Text extends BaseShape<PixiText>, AbsProperty expects BaseShape<Graphics>
		this.propertyMap.set(ShapePropertyEnum.Text, new TextProperty(this));
	}

	// ---- DOM input ----

	showTextInput(): void {
		if (!this.inputDOM) {
			return;
		}
		if (!this.inputDOM.parentNode) {
			document.body.appendChild(this.inputDOM);
		}
		this.syncInputPosition();
		this.inputDOM.value = this.graphics.text;
		this.inputDOM.style.display = 'block';
		setTimeout(() => this.inputDOM?.focus(), 0);
	}

	hideTextInput(): void {
		if (!this.inputDOM) {
			return;
		}
		this.inputDOM.style.display = 'none';
	}

	commitTextInput(): void {
		if (!this.inputDOM) {
			return;
		}
		const v = this.inputDOM.value;
		this.graphics.text = v;
		this.setProperty(ShapePropertyEnum.Text, { text: v });
	}

	private initInputDOM() {
		const input = document.createElement('input');
		input.style.position = 'absolute';
		input.style.zIndex = '99999';
		input.style.left = '0px';
		input.style.top = '0px';
		input.style.fontSize = '16px';
		input.style.outline = 'none';
		input.style.border = 'none';
		input.style.display = 'none';
		input.style.padding = '0';
		input.style.transformOrigin = 'center left';
		input.value = 'input text';

		this.inputDOM = input;
		this.syncInputPosition();
	}

	private syncInputPosition = () => {
		if (!this.inputDOM) {
			return;
		}
		const { width, height } = this.getWH();
		const topLeft = this.container.toGlobal(new Point(0, 0));
		const bottomRight = this.container.toGlobal(new Point(width, height));
		const { scale: vScale } = viewportStore.getState();

		this.inputDOM.style.transform = `translate3d(${topLeft.x}px, ${topLeft.y}px, 0px)`;
		this.inputDOM.style.width = `${bottomRight.x - topLeft.x}px`;
		this.inputDOM.style.height = `${bottomRight.y - topLeft.y}px`;
		this.inputDOM.style.fontSize = `${((this.graphics.style.fontSize as number) || 12) * vScale}px`;
	};

	// ---- event listeners ----

	private onInputKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			this.setState(ShapeStateEnum.Selected);
		}
	};

	private onInputInput = (e: Event) => {
		const v = (e.target as HTMLInputElement)?.value;
		this.graphics.text = v;
		this.syncInputPosition();
	};

	private onInputBlur = () => {
		this.setState(ShapeStateEnum.Selected);
	};

	private unsubViewport: (() => void) | null = null;

	private addEventListener = () => {
		this.inputDOM?.addEventListener('keydown', this.onInputKeydown);
		this.inputDOM?.addEventListener('input', this.onInputInput);
		this.inputDOM?.addEventListener('blur', this.onInputBlur);
		this.container.on('added', this.onGraphicsAdded);
		this.container.on('removed', this.onGraphicsRemoved);
		this.unsubViewport = viewportStore.subscribe(this.syncInputPosition);
	};

	private removeEventListener = () => {
		this.inputDOM?.removeEventListener('keydown', this.onInputKeydown);
		this.inputDOM?.removeEventListener('input', this.onInputInput);
		this.inputDOM?.removeEventListener('blur', this.onInputBlur);
		this.container.off('added', this.onGraphicsAdded);
		this.container.off('removed', this.onGraphicsRemoved);
		this.unsubViewport?.();
	};

	private onGraphicsAdded = () => {
		document.body.appendChild(this.inputDOM!);
		this.syncInputPosition();
	};

	private onGraphicsRemoved = () => {
		if (this.inputDOM?.parentNode) {
			document.body.removeChild(this.inputDOM);
		}
	};

	destroy(): void {
		this.graphics.destroy();
		this.removeEventListener();
	}
}
