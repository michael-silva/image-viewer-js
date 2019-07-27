
const drawLoadingPlaceholder = (viewer, emptyStyle = 'gray', fillStyle = 'orange') => (ctx, update) => {
  const x = viewer.width / 2;
  const y = viewer.height / 2;
  const radius = 50;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.lineWidth = 5;
  ctx.strokeStyle = emptyStyle;
  ctx.stroke();
  if (update) {
    const percent = (update.loaded * 100) / update.total;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, ((percent / 100) * 2) * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = fillStyle;
    ctx.stroke();
  }
};

export default drawLoadingPlaceholder;
