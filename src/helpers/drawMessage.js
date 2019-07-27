
const drawCenterMessage = (viewer, fontStyle = '30px serif') => (ctx, message) => {
  const x = viewer.width / 2;
  const y = viewer.height / 2 - 15;
  ctx.beginPath();

  ctx.font = fontStyle;

  ctx.textAlign = 'center';
  ctx.fillText(message, x, y);
};

export default drawCenterMessage;
