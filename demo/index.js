import { setupViewer } from '../src/index';

const canvas = document.getElementById('canvas');

const viewer = setupViewer(canvas, 300, 300);
viewer.addImage('https://images.unsplash.com/photo-1483030096298-4ca126b58199?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80').select(0);

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
