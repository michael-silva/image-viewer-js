import { fromEvent } from './utils/observable';
import { loadImage } from './utils/load-image';
import { sumArrays } from './utils';

export const stepZoom = (scale, step = 1) => {
  const steps = [1, 1.5];
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

export class ViewerImage {
  get image() { return this._image; }

  get scale() { return this._scale; }

  get position() { return this._position; }

  get naturalHeight() { return this._image.naturalHeight; }

  get naturalWidth() { return this._image.naturalWidth; }

  constructor(src, width, height) {
    this._src = src;
    this._image = new Image(width, height);
    this.reset();
  }

  onLoading(callback) {
    if (typeof callback !== 'function') {
      throw new Error('The onLoading parameter needs to be a function');
    }
    this._loadingHandler = callback;
  }

  hasError() {
    return this._hasError;
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

  translate(delta) {
    this._position = sumArrays(this.position, delta);
  }

  load() {
    if (this._loading || this._loaded) return undefined;
    this._loading = true;
    const loading$ = loadImage(this._src, this._image.width * this._image.height);
    loading$.subscribe((current) => {
      if (this._loadingHandler) this._loadingHandler(current);
      const { loaded, total, data } = current;
      if (loaded < total || !data) return;
      this._image.src = data;
    });
    const load$ = fromEvent(this._image, 'load');
    load$
      .subscribe(() => {
        this._loading = false;
        this._loaded = true;
      });

    loading$.catch((e) => {
      this._loading = false;
      this._hasError = true;
      load$.error(e);
    });
    return load$;
  }

  drawOn(viewer) {
    viewer.clear();
    this._repositioning(viewer);
    const size = [
      this.naturalWidth * this.scale,
      this.naturalHeight * this.scale,
    ];
    viewer.drawImage(this._image, this.position, size);
  }

  _repositioning(viewer) {
    const bounds = this._getBoundsOn(viewer);
    const {
      minX, maxX, minY, maxY,
    } = bounds;

    const x = Math.min(maxX, Math.max(minX, this.position[0]));
    const y = Math.min(maxY, Math.max(minY, this.position[1]));

    this._position = [x, y];
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
