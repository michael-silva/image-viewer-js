import { fromEvent } from './utils/observable';
import { mouseTrack } from './mouse-track';
import { subArrays } from './utils';
import { ViewerImage } from './viewer-image';

export class Viewer {
  get items() { return this._items; }

  get length() { return this.items.length; }

  get current() { return this._current; }

  get selected() { return this.items[this.current]; }

  get width() { return this._canvas.width; }

  get height() { return this._canvas.height; }

  constructor(canvas) {
    this._canvas = canvas;
    this._items = [];
    this._current = null;
    this._ctx = canvas.getContext('2d');
    this._mouse$ = mouseTrack(canvas);

    fromEvent(canvas, 'wheel')
      .subscribe((e) => {
        if (!this.selected || !this.selected.isLoaded()) return;
        const delta = e.wheelDelta / 120;
        this.selected.zoom(delta);
        this.selected.drawOn(this);
      });

    fromEvent(canvas, 'dblclick')
      .subscribe(() => {
        if (!this.selected || !this.selected.isLoaded()) return;
        this.selected.zoomIn();
        this.selected.drawOn(this);
      });

    this._mouse$
      .subscribe(({ currPosition, lastPosition }) => {
        if (!this.selected || !this.selected.isLoaded()) return;
        const delta = subArrays(currPosition, lastPosition);
        this.selected.translate(delta);
        this.selected.drawOn(this);
      });

    fromEvent(canvas.ownerDocument.defaultView, 'resize')
      .subscribe(() => {
        this._resizeCanvasToDisplaySize();
        this.restore();
      });

    this._resizeCanvasToDisplaySize();
  }

  clear() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  drawImage(image, [x, y], [w, h]) {
    this._ctx.drawImage(image, x, y, w, h);
  }

  isAllLoaded() {
    return this._items[this.length - 1].isLoaded();
  }

  addImage(src, imgW, imgH) {
    const item = new ViewerImage(src, imgW, imgH);
    item.onLoading(this._updatePlaceholder.bind(this));
    this.items.push(item);

    if (this.current === null || this.isAllLoaded()) {
      if (this.current === null) {
        this.select(0);
      }
      this._loadImage(this.length - 1);
    }

    return this;
  }

  setPlaceholder(...args) {
    if (typeof args[0] === 'function') {
      const [fn, update] = args;
      this._placeholder = fn;
      this._isToUpdatePlaceholder = update;
    }
    else {
      this.setPlaceholderImage(...args);
    }
  }

  setPlaceholderImage(src, position = [0, 0], [width, height] = []) {
    this._placeholder = new ViewerImage(src, width, height);
    this._placeholder.translate(position);
    if (this.selected && !this.selected.isLoaded()) {
      this._drawPlaceholder();
    }

    return this;
  }

  removeByIndex(index) {
    this._items.splice(index, 1);
    return this;
  }

  select(index) {
    if (index !== this.current) {
      this._current = index;
      this.restore();
    }
    return this;
  }

  next() {
    const index = this.current + 1;
    if (index < this.length) {
      this.select(index);
    }
    return this;
  }

  prev() {
    const index = this.current - 1;
    if (index >= 0) {
      this.select(index);
    }
    return this;
  }

  zoomIn(delta) {
    if (this.selected && this.selected.isLoaded()) {
      this.selected.zoomIn(delta);
      this.selected.drawOn(this);
    }
    return this;
  }

  zoomOut(delta) {
    if (this.selected && this.selected.isLoaded()) {
      this.selected.zoomOut(delta);
      this.selected.drawOn(this);
    }
    return this;
  }

  zoom(delta) {
    if (this.selected && this.selected.isLoaded()) {
      this.selected.zoom(delta);
      this.selected.drawOn(this);
    }
    return this;
  }

  restore() {
    if (this.selected && this.selected.isLoaded()) {
      this.selected.reset();
      this.selected.drawOn(this);
    }
    return this;
  }

  moveTo(x, y) {
    if (this.selected && this.selected.isLoaded()) {
      this.selected.translate(x, y);
      this.selected.drawOn(this);
    }
    return this;
  }

  _resizeCanvasToDisplaySize() {
    const width = this._canvas.clientWidth;
    const height = this._canvas.clientHeight;

    if (this._canvas.width !== width || this._canvas.height !== height) {
      this._canvas.width = width;
      this._canvas.height = height;
    }
  }

  _updatePlaceholder(state) {
    if (!this._isToUpdatePlaceholder) return;
    this._drawPlaceholder(state);
  }

  _drawPlaceholder(...args) {
    if (this._placeholder instanceof ViewerImage) {
      this._placeholder.drawOn(this);
    }
    else if (typeof this._placeholder === 'function') {
      this._placeholder(this._ctx, ...args);
    }
  }

  _loadImage(index) {
    if (index < 0 || index >= this.length) return;
    const item = this._items[index];
    if (index === this.current) {
      this._drawPlaceholder();
    }
    item.load()
      .subscribe(() => {
        if (index === this.current) {
          this.restore();
        }
        this._loadImage(index + 1);
      });
  }
}
