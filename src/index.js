import { fromEvent, of } from './observable';
import { sumArrays, subArrays } from './utils';

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

export const boundsOn = (canvas, image) => (scale) => {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const minX = -(width * scale) + canvas.width;
  const minY = -(height * scale) + canvas.height;
  const maxX = 0 * scale;
  const maxY = 0 * scale;
  return {
    minX, maxX, minY, maxY,
  };
};

export const translateOn = (bounds) => (translate, delta) => {
  const {
    minX, maxX, minY, maxY,
  } = bounds;

  const x = Math.max(minX, Math.min(maxX, translate[0] + delta[0]));
  const y = Math.max(minY, Math.min(maxY, translate[1] + delta[1]));

  return sumArrays(translate, [x, y]);
};

export const transformOnCanvas = (canvas, image) => {
  const transform = {
    scale: 1,
    translate: [0, 0],
  };

  const transform$ = of(transform);

  const mouse$ = mouseTrack(canvas);
  const getBounds = boundsOn(canvas, image);
  mouse$
    .subscribe((mouseTransform) => {
      const { currPosition, lastPosition } = mouseTransform;
      const delta = subArrays(currPosition, lastPosition);
      const bounds = getBounds(transform.scale);
      const getTranslation = translateOn(bounds);
      const translate = getTranslation(transform.translate, delta);
      transform$.next({ ...transform, translate });
    });

  fromEvent(canvas, 'wheel')
    .subscribe((e) => {
      const delta = e.delta / 120;
      const scale = freeZoom(transform.scale, delta);
      transform$.next({ ...transform, scale });
    });

  fromEvent(canvas, 'dblclick')
    .subscribe(() => {
      const scale = stepZoom(transform.scale);
      transform$.next({ ...transform, scale });
    });

  return transform$;
};

const drawOnCanvas = (canvas, image) => {
  const ctx = canvas.getContext('2d');
  return ({ position, scale }) => {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, position[0], position[1], width * scale, height * scale);
  };
};


const createImage = (canvas) => (src, imgW, imgH) => {
  const image = new Image(imgW, imgH);
  const draw = drawOnCanvas(canvas, image);
  const load = () => {
    // eslint-disable-next-line
    if (item.loaded) return;
    // eslint-disable-next-line
    item.loading = true;
    image.src = src;
  };
  const canvas$ = transformOnCanvas(canvas, image);

  const item = {
    image,
    load,
    draw,
  };
  fromEvent(image, 'load')
    .subscribe(() => {
      const subscriber = canvas$.subscribe(draw);
      draw({
        ...item,
        loading: false,
        loaded: true,
        subscriber,
      });
    });

  return item;
};

/* eslint-disable no-param-reassign,no-use-before-define */
export const setupViewer = (canvas, w, h) => {
  const defaultState = {
    items: [],
  };

  canvas.width = w || window.innerWidth;
  canvas.height = h || window.innerHeight;

  const viewer = (state) => ({
    addImage: addImage(state),
    removeImage: removeImage(state),
    select: select(state),
    next: next(state),
    prev: prev(state),
    zoomIn: zoomIn(state),
    zoomOut: zoomOut(state),
    restore: restore(state),
    moveTo: moveTo(state),
  });

  const zoomIn = (state) => (delta) => viewer({
    ...state,
    delta,
  });

  const zoomOut = (state) => (delta) => viewer({
    ...state,
    delta,
  });

  const restore = (state) => () => viewer({
    ...state,
  });

  const moveTo = (state) => (delta) => viewer({
    ...state,
    delta,
  });

  const removeImage = (state) => (index) => {
    const items = state.items.slice(index, 1);

    return viewer({
      ...state,
      items,
    });
  };

  const addImage = (state) => (src, imgW, imgH) => {
    const image = createImage(canvas);
    const items = [...state.items, image(src, imgW, imgH)];

    return viewer({
      ...state,
      items,
    });
  };

  const select = (state) => (index) => {
    if (index !== state.index) {
      const items = [...state.items];
      items[state.index].unbind(); // subscriber.unsubscribe()
      items[index].load();
      return viewer({
        ...state,
        items,
        index,
      });
    }

    return viewer({
      ...state,
    });
  };

  const next = (state) => () => {
    const index = state.index + 1;
    if (index < state.items.length) {
      return select({
        ...state,
        index,
      });
    }

    return viewer({
      ...state,
    });
  };

  const prev = (state) => () => {
    const index = state.index - 1;
    if (index > 0) {
      return select({
        ...state,
        index,
      });
    }

    return viewer({
      ...state,
    });
  };

  return viewer(defaultState);
};


/*
add multiples images
preload next image
preloading image
allow programatically do all actions
zoom by pinch
zoom by double tap
move by touch move
swipe to next/prev image
arrow key to next/prev image

full screen mode
create a pluggable version of ui with top and bottom toolbar
*/
