import { fromEvent } from './observable';
import { mouseTrack } from './mouse-track';
import { subArrays } from './utils';

export const stepZoom = (scale, step = 1) => {
  const steps = [1, 1.4, 1.8, 2];
  const i = steps.findIndex((s) => s === scale);
  if (i === -1) return steps[0];
  const j = i + step;
  if (j === -1) return steps[steps.length - 1];
  if (j === steps.length) return steps[0];
  return steps[j];
};

export const freeZoom = (scale, delta) => {
  const minScale = 1;
  const maxScale = 2;
  return Math.min(maxScale, Math.max(minScale, scale + delta));
};

class ViewerImage {
  get scale() { return this._scale; }

  get position() { return this._position; }

  get naturalHeight() { return this._image.naturalHeight; }

  get naturalWidth() { return this._image.naturalWidth; }

  constructor(src, width, height) {
    this._src = src;
    this._image = new Image(width, height);
    this.reset();
  }

  isLoaded() {
    return this._loaded;
  }

  isLoading() {
    return this._loading;
  }

  reset() {
    this._position = [0, 0];
    this._scale = 1;
  }

  zoomIn() {
    const step = 1;
    this._scale = stepZoom(this.scale, step);
  }

  zoomOut() {
    const step = -1;
    this._scale = stepZoom(this.scale, step);
  }

  zoom(delta) {
    this._scale = freeZoom(this.scale, delta);
  }

  moveOn(viewer, delta) {
    const bounds = this._getBoundsOn(viewer);
    this._position = this._translateOn(bounds, delta);
  }

  load() {
    if (this._loading || this._loaded) return undefined;
    this._loading = true;
    const load$ = fromEvent(this._image, 'load');
    load$.subscribe(() => {
      this._loading = false;
      this._loaded = true;
    });
    this._image.src = this._src;
    return load$;
  }

  drawOn(viewer) {
    viewer.clear();
    const size = [
      this.naturalWidth * this._scale,
      this.naturalHeight * this._scale,
    ];
    viewer.drawImage(this._image, this.position, size);
  }

  _translateOn(bounds, delta) {
    const {
      minX, maxX, minY, maxY,
    } = bounds;

    const x = Math.max(minX, Math.min(maxX, this.position[0] + delta[0]));
    const y = Math.max(minY, Math.min(maxY, this.position[1] + delta[1]));

    return [x, y];
  }

  _getBoundsOn(viewer) {
    const minX = -(this.naturalWidth * this.scale) + viewer.width;
    const minY = -(this.naturalHeight * this.scale) + viewer.height;
    const maxX = 0 * this.scale;
    const maxY = 0 * this.scale;
    return {
      minX,
      maxX,
      minY,
      maxY,
    };
  }
}

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

    fromEvent(canvas, 'keypress')
      .subscribe((e) => {
        if (e.which === 39) {
          this.next();
        }
        else if (e.which === 37) {
          this.prev();
        }
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
