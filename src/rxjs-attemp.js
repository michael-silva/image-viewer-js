import { fromEvent, of, merge } from 'rxjs';
import {
  takeUntil,
  mergeMap,
  map,
  scan,
  withLatestFrom,
  startWith,
  mergeScan,
} from 'rxjs/operators';

const zoomStep = (s) => {
  const steps = [1, 1.4, 1.5, 2];
  const i = steps.findIndex((step) => step === s) || -1;
  const scale = steps[i + 1];
  return scale || steps[0];
};

const freeZoom = (s, d) => Math.max(1, Math.min(2, s + d));

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
  const mouseWheel$ = fromEvent(canvas, 'wheel');
  const scale$ = of(1).pipe(
    mergeScan((prev, scale) => {
      console.log('asa', scale);
      return merge(
        canvasDblClick$.pipe(map(() => {
          console.log('a', scale, zoomStep(scale));
          return prev + zoomStep(scale);
        })),
        mouseWheel$.pipe(map((e) => freeZoom(scale, e.deltaY / 120))),
      );
    }, 1),
  );

  const mouseMove$ = canvasMouseMove(canvas);
  const position$ = mouseMove$.pipe(
    scan((pos, curr) => curr, [0, 0]),
    startWith([0, 0]),
  );

  const viewer$ = merge(
    scale$.pipe(
      withLatestFrom(position$),
      map((params) => [params[1], params[0]]),
    ),
    position$.pipe(withLatestFrom(scale$)),
  ).pipe(
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
