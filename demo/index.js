// import TouchEmulator from 'hammer-touchemulator';
import setupViewer from '../src/index';
// import hammerjsAdapter from '../src/adapters/hammerjs-adapter';
import keyboardAdapter from '../src/adapters/keyboard-adapter';

// TouchEmulator();
const canvas = document.getElementById('canvas');

const viewer = setupViewer(canvas);
keyboardAdapter(canvas, viewer);
// hammerjsAdapter(canvas, viewer);
viewer.setPlaceholder((ctx, update) => {
  // if (update && update.loaded === update.total) return;
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
}, true);

viewer.onError((ctx) => {
  const x = viewer.width / 2;
  const y = viewer.height / 2 - 15;
  ctx.beginPath();

  ctx.font = '30px serif';

  ctx.textAlign = 'center';
  ctx.fillText('Error', x, y);
});

viewer
  .addImage('images/home-1622401_1280.jpg')
  .addImage('images/error.jpg')
  .addImage('images/pexels-photo-853199.jpeg');
