import { fromEvent } from '../utils/observable';

const hammerAdapter = (canvas, viewer) => {
  fromEvent(canvas.ownerDocument, 'keyup')
    .subscribe((e) => {
      if (e.key === 'ArrowRight') {
        viewer.next();
      }
      else if (e.key === 'ArrowLeft') {
        viewer.prev();
      }
    });
};

export default hammerAdapter;
