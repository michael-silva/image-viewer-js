import { fromEvent, of } from './observable';

export const stepZoom = (scale) => {
  const steps = [1, 1.4, 1.8, 2];
  const i = steps.findIndex((s) => s === scale);
  if (i === -1 || i === steps.length - 1) return steps[0];
  return steps[i + 1];
};

export const freeZoom = (scale, delta) => {
  const minScale = 1;
  const maxScale = 2;
  return Math.min(maxScale, Math.max(minScale, scale + delta));
};

export const zoomTrack = (canvas) => {
  const transform = {
    scale: 1,
  };
  const transform$ = of(transform);

  fromEvent(canvas, 'wheel')
    .subscribe((e) => {
      const delta = e.wheelDelta / 120;
      const scale = freeZoom(transform.scale, delta);
      transform$.next({ scale });
    });

  fromEvent(canvas, 'dblclick')
    .subscribe(() => {
      const scale = stepZoom(transform.scale);
      transform$.next({ scale });
    });

  transform$.subscribe(({ scale }) => {
    transform.scale = scale;
  });

  return transform$;
};
