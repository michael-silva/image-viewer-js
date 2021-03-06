import { fromEvent } from '../utils/observable';

const keyboardAdapter = (canvas, viewer) => {
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

export default keyboardAdapter;
