/* eslint-disable no-underscore-dangle */
import { Viewer } from '../viewer';
import keyboardAdapter from './keyboard-adapter';
import { contextMock, canvasMock } from '../test-utils';

test('key press arrow left and arrow right should change to prev and next selected image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  keyboardAdapter(cmock, viewer);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  expect(contextMock.drawImage).toHaveBeenCalledTimes(1);
  expect(viewer.current).toBe(0);
  cmock.ownerDocument.dispatch('keyup', { key: 'ArrowLeft' });
  expect(viewer.current).toBe(0);
  cmock.ownerDocument.dispatch('keyup', { key: 'ArrowRight' });
  expect(viewer.current).toBe(1);
  cmock.ownerDocument.dispatch('keyup', { key: 'ArrowRight' });
  expect(viewer.current).toBe(1);
  cmock.ownerDocument.dispatch('keyup', { key: 'A' });
  expect(viewer.current).toBe(1);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(2);
});
