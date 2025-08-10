import { Text as PixiText, TextStyle, TextMetrics, Graphics } from 'pixi.js';
import { viewportStore } from '../store/viewport';
import { ShapeTypeEnum } from '../types/shape';
import { BaseShape } from './BaseShape';

/**
 * 文字
 * @see https://github.com/Mwni/pixi-text-input
 */
export class Text extends BaseShape<PixiText> {
  private inputDOM: HTMLInputElement | undefined;

  type = ShapeTypeEnum.Text;

  style: TextStyle = new TextStyle({
    fontSize: 16,
  });

  constructor(id: string) {
    super(id, new PixiText());
    this.initInputDOM();
    this.addEventListener();

    this.graphics.text = 'input text';
    this.graphics.style = this.style;
    this.graphics.interactive = true;
    this.graphics.resolution = 16; // 为了放大时渲染不模糊

    this.graphics.x = 500;
    this.graphics.y = 500;
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
    // input.style.opacity = "0.5"
    input.style.transformOrigin = 'center left';
    input.value = 'input text';

    this.inputDOM = input;

    this.updateInputDOMPosition();
  }

  private onInputKeydown = () => {};

  private onInputInput = (e: Event) => {
    const v = (e.target as HTMLInputElement)?.value;

    this.graphics.text = v;
    this.updateInputDOMPosition();
  };

  private onInputKeyup = () => {};

  private onInputFocus = () => {};

  private onInputBlur = () => {
    this.inputDOM!.style.display = 'none';
  };

  private addEventListener = () => {
    this.inputDOM?.addEventListener('keydown', this.onInputKeydown);
    this.inputDOM?.addEventListener('input', this.onInputInput);
    this.inputDOM?.addEventListener('keyup', this.onInputKeyup);
    this.inputDOM?.addEventListener('focus', this.onInputFocus);
    this.inputDOM?.addEventListener('blur', this.onInputBlur);
    this.graphics.on('added', this.onGraphicsAdded);
    this.graphics.on('removed', this.onGraphicsRemoved);
    this.graphics.on('pointerdown', this.onGraphicsClick);
    viewportStore.subscribe(this.updateInputDOMPosition);
  };

  private removeEventListener = () => {
    this.inputDOM?.removeEventListener('keydown', this.onInputKeydown);
    this.inputDOM?.removeEventListener('input', this.onInputInput);
    this.inputDOM?.removeEventListener('keyup', this.onInputKeyup);
    this.inputDOM?.removeEventListener('focus', this.onInputFocus);
    this.inputDOM?.removeEventListener('blur', this.onInputBlur);
    this.graphics.off('added', this.onGraphicsAdded);
    this.graphics.off('removed', this.onGraphicsRemoved);
    this.graphics.off('pointerdown', this.onGraphicsClick);
  };

  private onGraphicsAdded = () => {
    document.body.appendChild(this.inputDOM!);
    this.updateInputDOMPosition();
  };

  private onGraphicsRemoved = () => {
    document.body.removeChild(this.inputDOM!);
  };

  private updateInputDOMPosition = () => {
    if (!this.inputDOM) {
      return;
    }
    const { x, y, width, height } = this.getBounds();
    const { x: vx, y: vy, scale: vScale } = viewportStore.getState();

    this.inputDOM.style.transform = `translate3d(${x * vScale + vx}px, ${y * vScale + vy}px, 0px)`;
    this.inputDOM.style.width = `${width}px`;
    this.inputDOM.style.height = `${height}px`;
    this.inputDOM.style.fontSize = `${((this.graphics.style.fontSize as number) || 12) * vScale}px`;
  };

  private onGraphicsClick = () => {
    if (!this.inputDOM) {
      return;
    }
    this.updateInputDOMPosition();

    this.inputDOM.style.display = 'block';
    setTimeout(() => {
      this.inputDOM!.focus();
    }, 100);
  };

  destory() {
    this.graphics.destroy();
    this.removeEventListener();
  }
}
