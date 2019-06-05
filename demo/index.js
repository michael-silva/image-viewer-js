// import TouchEmulator from 'hammer-touchemulator';
import setupViewer from '../src/index';
// import hammerjsAdapter from '../src/adapters/hammerjs-adapter';
import keyboardAdapter from '../src/adapters/keyboard-adapter';

// TouchEmulator();
const canvas = document.getElementById('canvas');

const viewer = setupViewer(canvas);
keyboardAdapter(canvas, viewer);
// hammerjsAdapter(canvas, viewer);
viewer
  .addImage('images/home-1622401_1280.jpg')
  .addImage('images/pexels-photo-853199.jpeg');
