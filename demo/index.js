// import TouchEmulator from 'hammer-touchemulator';
import setupViewer from '../src/index';
import hammerjsAdapter from '../src/adapters/hammerjs-adapter';
import keyboardAdapter from '../src/adapters/keyboard-adapter';

// TouchEmulator();
const canvas = document.getElementById('canvas');

const viewer = setupViewer(canvas, 300, 300);
keyboardAdapter(canvas, viewer);
hammerjsAdapter(canvas, viewer);
viewer
  .addImage('https://images.unsplash.com/photo-1483030096298-4ca126b58199?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80')
  .addImage('https://images.pexels.com/photos/68147/waterfall-thac-dray-nur-buon-me-thuot-daklak-68147.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260');
