import { fromEvent } from './observable';
import { mouseTrack } from './mouse-track';
import { zoomTrack } from './zoom-track';
import { subArrays } from './utils';

export const translateOn = (bounds) => (translate, delta) => {
  const {
    minX, maxX, minY, maxY,
  } = bounds;

  const x = Math.max(minX, Math.min(maxX, translate[0] + delta[0]));
  const y = Math.max(minY, Math.min(maxY, translate[1] + delta[1]));

  return [x, y];
  // return sumArrays(translate, [x, y]);
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

  setScale(scale) {
    this._scale = scale;
  }

  setPosition(position) {
    this._position = position;
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
}

export class Viewer {
  get items() { return this._items; }

  get length() { return this.items.length; }

  get current() { return this._current; }

  get selected() { return this.items[this.current]; }

  constructor(canvas) {
    this._canvas = canvas;
    this._items = [];
    this._current = null;
    this._ctx = canvas.getContext('2d');
    this._mouse$ = mouseTrack(canvas);
    this._zoom$ = zoomTrack(canvas);
    this._zoom$
      .subscribe(({ scale }) => {
        if (!this.selected) return;
        if (this.selected.isLoaded() && scale !== this.selected.scale) {
          this.selected.setScale(scale);
          this.drawSelected();
        }
      });
    this._mouse$
      .subscribe(({ currPosition, lastPosition }) => {
        if (!this.selected) return;
        const delta = subArrays(currPosition, lastPosition);
        const bounds = this._getBounds(this.selected.scale);
        const getTranslation = translateOn(bounds);
        const position = getTranslation(this.selected.position, delta);
        if (this.selected.isLoaded()) {
          this.selected.setPosition(position);
          this.drawSelected();
        }
      });

    // eslint-disable-next-line
    const hammer = canvas._hammer || new Hammer(canvas);
    hammer.on('swipeleft', () => this.prev());
    hammer.on('swiperight', () => this.next());
    // eslint-disable-next-line
    canvas._hammer = hammer;

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

  _getBounds(scale) {
    if (!this.selected) return undefined;
    const minX = -(this.selected.naturalWidth * scale) + this._canvas.width;
    const minY = -(this.selected.naturalHeight * scale) + this._canvas.height;
    const maxX = 0 * scale;
    const maxY = 0 * scale;
    return {
      minX,
      maxX,
      minY,
      maxY,
    };
  }

  clear() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }

  drawImage(image, [x, y], [w, h]) {
    this._ctx.drawImage(image, x, y, w, h);
  }

  drawSelected() {
    if (this.selected && this.selected.isLoaded()) {
      this.selected.drawOn(this);
    }
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
          this._zoom$.next({ scale: this.selected.scale });
          this.drawSelected();
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
      const item = this._items[index];
      this._current = index;
      item.reset();
      this._zoom$.next({ scale: item.scale });
      this.drawSelected();
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

  /* zoomIn(delta) {
    if (this.selected) {
      this.selected.zoomIn(delta);
    }
    return this;
  }

  zoomOut(delta) {
    if (this.selected) {
      this.selected.zoomOut(delta);
    }
    return this;
  } */

  restore() {
    if (this.selected) {
      this.selected.reset();
      this._zoom$.next({ scale: this.selected.scale });
      this.drawSelected();
    }
    return this;
  }

  /* moveTo(x, y) {
    if (this.selected) {
      this.selected.moveTo(x, y);
      this.drawSelected();
    }
    return this;
  } */
}
