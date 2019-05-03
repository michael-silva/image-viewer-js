let canvas = null;
let ctx = null;
let isDragging = false;
let canMouseX = 0;
let canMouseY = 0;
let offsetX = 0;
let offsetY = 0;
let image = null;
let imageX = 0;
let imageY = 0;
let movX = 0;
let movY = 0;
let scale = 1;

function drawImage() {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const minX = -(width * scale) + canvas.width;
  const minY = -(height * scale) + canvas.height;
  const maxX = 0 * scale;
  const maxY = 0 * scale;
  imageX = Math.max(minX, Math.min(maxX, imageX + movX));
  imageY = Math.max(minY, Math.min(maxY, imageY + movY));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, imageX, imageY, width * scale, height * scale);
}

function handleMouseDown(e) {
  canMouseX = parseInt(e.clientX - offsetX);
  canMouseY = parseInt(e.clientY - offsetY);
  // set the drag flag
  isDragging = true;
}

function handleMouseUp(e) {
  canMouseX = parseInt(e.clientX - offsetX);
  canMouseY = parseInt(e.clientY - offsetY);
  // clear the drag flag
  isDragging = false;
}

function handleMouseOut(e) {
  canMouseX = parseInt(e.clientX - offsetX);
  canMouseY = parseInt(e.clientY - offsetY);
  // user has left the canvas, so clear the drag flag
  // isDragging=false;
}

function handleMouseMove(e) {
  const mouseX = parseInt(e.clientX - offsetX);
  const mouseY = parseInt(e.clientY - offsetY);
  movX = mouseX - canMouseX;
  movY = mouseY - canMouseY;
  canMouseX = mouseX;
  canMouseY = mouseY;
  // if the drag flag is set, clear the canvas and draw the image
  if (isDragging) {
    drawImage();
  }
}

function handleDblClick() {
  scale += 0.1;
  if (scale >= 1.5) {
    scale = 1;
  }

  drawImage();
}

export const setupViewer = (c, w, h) => (src, imgW, imgH) => {
  canvas = c;
  canvas.width = w || window.innerWidth;
  canvas.height = h || window.innerHeight;
  offsetX = canvas.offsetLeft;
  offsetY = canvas.offsetTop;
  ctx = canvas.getContext('2d');

  image = new Image(imgW, imgH); // Using optional size for image
  image.onload = drawImage; // Draw when image has loaded
  image.src = src;

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseout', handleMouseOut);
  canvas.addEventListener('dblclick', handleDblClick);
};
