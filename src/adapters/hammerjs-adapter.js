import Hammer from 'hammerjs';

const hammerAdapter = (canvas, viewer) => {
  const hammer = new Hammer(canvas);
  hammer.on('swipeleft', () => viewer.prev());
  hammer.on('swiperight', () => viewer.next());

  hammer.on('doubletap', () => viewer.zoomIn());
  hammer.get('pinch').set({ enable: true });
  hammer.on('pinch', (e) => viewer.zoom(e.scale / 120));

  // eslint-disable-next-line
  canvas._hammer = hammer;
};

export default hammerAdapter;
