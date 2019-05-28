import { fromEvent, of } from './observable';

export const mouseTrack = (elem) => {
  const transform = {
    lastPosition: [0, 0],
    currPosition: [0, 0],
    isDragging: false,
  };

  const getMousePosition = (e) => {
    const x = parseInt(e.clientX - elem.offsetLeft);
    const y = parseInt(e.clientY - elem.offsetTop);
    return [x, y];
  };

  const transform$ = of(transform);

  fromEvent(elem, 'mousedown')
    .subscribe((e) => {
      transform.lastPosition = getMousePosition(e);
      transform.isDragging = true;
    });

  fromEvent(elem, 'mousemove')
    .subscribe((e) => {
      if (transform.isDragging) {
        transform.currPosition = getMousePosition(e);
        transform$.next({ ...transform });
        transform.lastPosition = transform.currPosition.slice(0);
      }
    });

  fromEvent(elem, 'mouseup')
    .subscribe(() => {
      transform.isDragging = false;
    });

  return transform$;
};
