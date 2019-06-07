// import TouchEmulator from 'hammer-touchemulator';
import setupViewer from '../src/index';
// import hammerjsAdapter from '../src/adapters/hammerjs-adapter';
import keyboardAdapter from '../src/adapters/keyboard-adapter';

// TouchEmulator();

const drawErrorMessage = (viewer) => (ctx) => {
  const x = viewer.width / 2;
  const y = viewer.height / 2 - 15;
  ctx.beginPath();

  ctx.font = '30px serif';

  ctx.textAlign = 'center';
  ctx.fillText('Error', x, y);
};

const drawLoadingPlaceholder = (viewer) => (ctx, update) => {
  const x = viewer.width / 2;
  const y = viewer.height / 2;
  const radius = 50;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'gray';
  ctx.stroke();
  if (update) {
    const percent = (update.loaded * 100) / update.total;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, ((percent / 100) * 2) * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }
};

const canvas = document.getElementById('canvas');
const viewer = setupViewer(canvas);
keyboardAdapter(canvas, viewer);
// hammerjsAdapter(canvas, viewer);

viewer.setPlaceholder(drawLoadingPlaceholder(viewer), true);
viewer.onError(drawErrorMessage(viewer));

viewer
  .addImage('https://picsum.photos/1200/1000.jpg?random=1', 1200, 1000)
  .addImage('https://picsum.photos/error.jpg?random=2')
  .addImage('https://picsum.photos/700/1500.jpg?random=3', 700, 1500);
