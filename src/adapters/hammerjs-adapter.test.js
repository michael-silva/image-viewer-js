/* eslint-disable no-underscore-dangle */
import { canvasMock, contextMock } from '../test-utils';
import { Viewer } from '../viewer';
import hammerAdapter from './hammerjs-adapter';

afterEach(() => {
  contextMock.drawImage.mockReset();
  contextMock.clearRect.mockReset();
});

test('pinch in and pinch out should zoom just the selected image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  hammerAdapter(cmock, viewer);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.select(1);
  cmock._hammer.emit('pinch', { scale: 60 });
  expect(viewer.selected.scale).toBe(1);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  cmock._hammer.emit('pinch', { scale: 60 });
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.items[1].scale).toBe(1.5);
  expect(viewer.selected.scale).toBe(1.5);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(2);
});

test('swipe left and right should change to prev and next selected image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  hammerAdapter(cmock, viewer);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  expect(contextMock.drawImage).toHaveBeenCalledTimes(1);
  expect(viewer.current).toBe(0);
  cmock._hammer.emit('swipeleft', { });
  expect(viewer.current).toBe(0);
  cmock._hammer.emit('swiperight', { });
  expect(viewer.current).toBe(1);
  cmock._hammer.emit('swiperight', { });
  expect(viewer.current).toBe(1);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(2);
});

test('double tap should zoom Step just the selected image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  hammerAdapter(cmock, viewer);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.select(1);
  cmock._hammer.emit('doubletap', {});
  expect(viewer.selected.scale).toBe(1);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  cmock._hammer.emit('doubletap', {});
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.items[1].scale).toBe(1.4);
  expect(viewer.selected.scale).toBe(1.4);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(2);
});
