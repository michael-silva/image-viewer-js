import { fromEvent } from 'rxjs';
import {
  takeUntil,
  mergeMap,
  map,
  scan,
  withLatestFrom,
  startWith,
} from 'rxjs/operators';

const zoomStep = (s) => {
  let scale = s + 0.1;
  if (scale >= 1.5) {
    scale = 1;
  }
  return scale;
};

// eslint-disable-next-line no-unused-vars
const freeZoom = (s) => {
  let scale = s + 0.1;
  if (scale >= 1.5) {
    scale = 1;
  }
  return scale;
};

const clientPosition = (canvas) => (e) => [
  parseInt(e.clientX - canvas.offsetLeft),
  parseInt(e.clientY - canvas.offsetTop),
];

const imagePosition = (canvas, image) => ([x, y], [dx, dy], scale) => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const minX = -(width * scale) + canvas.width;
  const minY = -(height * scale) + canvas.height;
  const maxX = 0 * scale;
  const maxY = 0 * scale;
  const imageX = Math.max(minX, Math.min(maxX, x + dx));
  const imageY = Math.max(minY, Math.min(maxY, y + dy));
  return [imageX, imageY];
};

const canvasMouseMove = (canvas) => {
  const canvasMouseMove$ = fromEvent(canvas, 'mousemove');
  const canvasMouseDown$ = fromEvent(canvas, 'mousedown');
  const canvasMouseUp$ = fromEvent(canvas, 'mouseup');

  const getMousePosition = clientPosition(canvas);
  const mouseMove$ = canvasMouseDown$.pipe(
    map(getMousePosition),
    mergeMap((startMousePos) => {
      let prevMousePos = [...startMousePos];
      return canvasMouseMove$.pipe(
        map(getMousePosition),
        map(([x, y]) => {
          const delta = [x - prevMousePos[0], y - prevMousePos[1]];
          prevMousePos = [x, y];
          return delta;
        }),
        takeUntil(canvasMouseUp$),
      );
    }),
  );

  return mouseMove$;
};

const draw = (canvas, image) => {
  const ctx = canvas.getContext('2d');
  return ([x, y], scale) => {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, x, y, width * scale, height * scale);
  };
};

export const setupViewer = (canvas, w, h) => (src, imgW, imgH) => {
  // eslint-disable-next-line no-param-reassign
  canvas.width = w || window.innerWidth;
  // eslint-disable-next-line no-param-reassign
  canvas.height = h || window.innerHeight;

  const image = new Image(imgW, imgH);
  const getImagePosition = imagePosition(canvas, image);
  const drawImage = draw(canvas, image);

  const canvasDblClick$ = fromEvent(canvas, 'dblclick');
  const scale$ = canvasDblClick$.pipe(
    scan((scale) => zoomStep(scale), 1),
    startWith(1),
  );

  const mouseMove$ = canvasMouseMove(canvas);
  const position$ = mouseMove$.pipe(scan((pos, curr) => curr, [0, 0]));

  const viewer$ = position$.pipe(
    withLatestFrom(scale$),
    scan(([imagePos], [delta, scale]) => {
      const newPos = getImagePosition(imagePos, delta, scale);
      return [newPos, scale];
    }),
  );

  viewer$.subscribe(([imagePos, scale]) => {
    console.log(imagePos, scale);
    drawImage(imagePos, scale);
  });

  const imageLoad$ = fromEvent(image, 'load');
  imageLoad$.subscribe(() => drawImage([0, 0], 1));
  image.src = src;
};
