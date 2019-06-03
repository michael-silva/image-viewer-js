import { fromEvent } from './observable';
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
        this.selected.moveOn(this, delta);
        this.selected.drawOn(this);
      });

    fromEvent(canvas, 'resize')
      .subscribe(() => this.restore());
    fromEvent(window, 'resize')
      .subscribe(() => this.restore());
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

  _loadImage(index) {
    if (index < 0 || index >= this.length) return;
    const item = this._items[index];
    item.load()
      .subscribe(() => {
        if (index === this.current) {
          this.restore();
        }
        this._loadImage(index + 1);
      });
  }

  addImage(src, imgW, imgH) {
    const item = new ViewerImage(src, imgW, imgH);
    this.items.push(item);

    if (this.current === null || this.isAllLoaded()) {
      this._loadImage(this.length - 1);
      if (this.current === null) {
        this.select(0);
      }
    }

    return this;
  }

  /* removeImage(index) {
    this._items.splice(index, 1);
    return this;
  } */

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
      this.selected.moveTo([x, y]);
      this.selected.drawOn(this);
    }
    return this;
  }
}
