// import TouchEmulator from 'hammer-touchemulator';
import setupViewer from '../src/index';
import keyboardAdapter from '../src/adapters/keyboard-adapter';
import drawMessage from '../src/helpers/drawMessage';
import drawLoadingPlaceholder from '../src/helpers/drawLoadingPlaceholder';

const setupThumbs = (viewer) => {
  const fragment = document.createDocumentFragment();
  viewer.items.forEach((item, index) => {
    item.image.setAttribute('data-index', index);
    fragment.appendChild(item.image);
  });
  const $container = viewer.canvas.parentElement;
  const $thumbs = $container.querySelector('.iv-thumbs');
  $thumbs.appendChild(fragment);

  $container.addEventListener('click', (e) => {
    const index = parseInt(e.target.getAttribute('data-index') || '-1');
    if (index >= 0) {
      viewer.select(index);
    }
  });

  $container.querySelector('.iv-thumbgrid-toggle').addEventListener('click', () => {
    $thumbs.classList.toggle('open');
  });
};

const canvas = document.getElementById('canvas');
const viewer = setupViewer(canvas);
keyboardAdapter(canvas, viewer);

viewer.setPlaceholder(drawLoadingPlaceholder(viewer), true);
viewer.onError(drawMessage(viewer, 'Error to load image'));
viewer.onLoaded(() => viewer.fillWidth());

viewer
  .addImage('https://picsum.photos/1200/1000.jpg?random=1', 1200, 1000)
  .addImage('https://picsum.photos/error.jpg?random=2')
  .addImage('https://picsum.photos/700/1500.jpg?random=3', 700, 1500)
  .addImage('https://picsum.photos/700/1500.jpg?random=4', 1500, 1500);


setupThumbs(viewer);
