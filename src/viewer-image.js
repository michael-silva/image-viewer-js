import { fromEvent } from './utils/observable';
import { loadImage } from './utils/load-image';
import { sumArrays } from './utils';

export class ViewerImage {
  get image() { return this._image; }

  get scale() { return this._scale * this.aspectRatio; }

  get position() { return this._position; }

  get naturalHeight() { return this._image.naturalHeight; }

  get naturalWidth() { return this._image.naturalWidth; }

  get aspectRatio() { return this._ratio; }

  constructor(src, width, height) {
    this._ratio = 1;
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

  onLoaded(callback) {
    if (typeof callback !== 'function') {
      throw new Error('The onLoaded parameter needs to be a function');
    }
    this._loadedHandler = callback;
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

  setZoomSteps(zoomSteps) {
    this._zoomSteps = zoomSteps;
  }

  setAspectRatio(ratio) {
    this._ratio = ratio;
  }

  reset() {
    this._position = [0, 0];
    this._scale = 1;
  }

  zoomIn() {
    this._scale = this._stepZoom(1);
  }

  zoomOut() {
    this._scale = this._stepZoom(-1);
  }

  zoom(delta) {
    const { MAX_SCALE, MIN_SCALE } = ViewerImage;
    this._scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, this._scale + delta));
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
        if (this._loadedHandler) this._loadedHandler();
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

  _stepZoom(step = 1) {
    const steps = ViewerImage.ZOOM_STEPS;
    const i = steps.findIndex((s) => s === this._scale);
    if (i === -1) return steps[0];
    const j = i + step;
    if (j === -1) return steps[steps.length - 1];
    if (j === steps.length) return steps[0];
    return steps[j];
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

ViewerImage.MAX_SCALE = 2;
ViewerImage.MIN_SCALE = 1;
ViewerImage.ZOOM_STEPS = [1, 1.5];
