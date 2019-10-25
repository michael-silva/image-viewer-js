import { Viewer } from './viewer';

/* eslint-disable no-param-reassign */
export const setupViewer = (canvas, w, h) => {
  canvas.width = w || window.innerWidth;
  canvas.height = h || window.innerHeight;

  return new Viewer(canvas);
};
