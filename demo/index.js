import { setupViewer } from '../src/index';

const canvas = document.getElementById('canvas');

const viewer = setupViewer(canvas, 300, 300);
viewer('https://images.unsplash.com/photo-1483030096298-4ca126b58199?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80');
