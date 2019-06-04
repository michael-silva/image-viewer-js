/* eslint-disable no-underscore-dangle */
import { canvasMock, contextMock } from './test-utils';
import { Viewer } from './viewer';

afterEach(() => {
  contextMock.drawImage.mockReset();
  contextMock.clearRect.mockReset();
});

test('viewer should add a single image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  viewer.addImage(src1);
  expect(viewer.items).toHaveLength(1);
});

test('viewer should add multiple images', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  const src3 = 'a3';
  viewer.addImage(src1).addImage(src2);
  viewer.addImage(src3);
  expect(viewer.items).toHaveLength(3);
});

test('viewer should remove an image after added', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  const src3 = 'a3';
  viewer.addImage(src1).addImage(src2);
  viewer.addImage(src3);
  viewer.removeByIndex(2);
  viewer.removeByIndex(6); // invalid index
  expect(viewer.items).toHaveLength(2);
  viewer.removeByIndex(0);
  expect(viewer.items).toHaveLength(1);
});

test('viewer should start loading when add first image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  viewer.addImage(src1);
  expect(viewer.items[0].isLoading()).toBeTruthy();
  expect(viewer.items[0].isLoaded()).toBeFalsy();
  expect(contextMock.drawImage).toHaveBeenCalledTimes(0);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  expect(viewer.items[0].isLoading()).toBeFalsy();
  expect(viewer.items[0].isLoaded()).toBeTruthy();
  expect(contextMock.drawImage).toHaveBeenCalledTimes(1);
});

test('viewer should draw only the selected image after loading them in sequence', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.select(1);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  expect(viewer.items[0].isLoading()).toBeFalsy();
  expect(viewer.items[0].isLoaded()).toBeTruthy();
  expect(viewer.items[1].isLoading()).toBeTruthy();
  expect(viewer.items[1].isLoaded()).toBeFalsy();
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  expect(viewer.items[1].isLoading()).toBeFalsy();
  expect(viewer.items[1].isLoaded()).toBeTruthy();
  expect(contextMock.drawImage).toHaveBeenCalledTimes(1);
});

test('viewer should load image in sequence', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  const src3 = 'a3';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.addImage(src3);
  expect(viewer.items[0].isLoading()).toBeTruthy();
  expect(viewer.items[0].isLoaded()).toBeFalsy();
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  expect(viewer.items[0].isLoading()).toBeFalsy();
  expect(viewer.items[0].isLoaded()).toBeTruthy();
  expect(viewer.items[1].isLoading()).toBeTruthy();
  expect(viewer.items[1].isLoaded()).toBeFalsy();
  expect(viewer.items[2].isLoading()).toBeFalsy();
  expect(viewer.items[2].isLoaded()).toBeFalsy();
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  expect(viewer.items[0].isLoading()).toBeFalsy();
  expect(viewer.items[0].isLoaded()).toBeTruthy();
  expect(viewer.items[1].isLoading()).toBeFalsy();
  expect(viewer.items[1].isLoaded()).toBeTruthy();
  expect(viewer.items[2].isLoading()).toBeTruthy();
  expect(viewer.items[2].isLoaded()).toBeFalsy();
  viewer.items[2]._image.dispatchEvent(new Event('load'));
  expect(viewer.items[0].isLoading()).toBeFalsy();
  expect(viewer.items[0].isLoaded()).toBeTruthy();
  expect(viewer.items[1].isLoading()).toBeFalsy();
  expect(viewer.items[1].isLoaded()).toBeTruthy();
  expect(viewer.items[2].isLoading()).toBeFalsy();
  expect(viewer.items[2].isLoaded()).toBeTruthy();
});

test('viewer should navigate between images', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  viewer.addImage('a1').addImage('a2');
  viewer.addImage('a3').addImage('a4');
  expect(viewer.items).toHaveLength(4);
  expect(viewer.current).toBe(0);
  viewer.next();
  expect(viewer.current).toBe(1);
  viewer.next();
  expect(viewer.current).toBe(2);
  viewer.next();
  expect(viewer.current).toBe(3);
  viewer.next();
  expect(viewer.current).toBe(3);
  viewer.prev();
  expect(viewer.current).toBe(2);
  viewer.prev();
  expect(viewer.current).toBe(1);
  viewer.prev();
  expect(viewer.current).toBe(0);
  viewer.prev();
  expect(viewer.current).toBe(0);
});

test('manually trigger zoom in and out should zoomStep just the selected image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.select(1);
  viewer.zoomIn();
  expect(viewer.selected.scale).toBe(1);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  viewer.zoomIn();
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.selected.scale).toBe(1.4);
  viewer.zoomIn();
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.selected.scale).toBe(1.8);
  viewer.zoomIn();
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.selected.scale).toBe(2);
  viewer.zoomIn();
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.selected.scale).toBe(1);
  viewer.zoomOut();
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.selected.scale).toBe(2);
  viewer.zoomOut();
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.selected.scale).toBe(1.8);
  viewer.zoomOut();
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.selected.scale).toBe(1.4);
  viewer.zoomOut();
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.selected.scale).toBe(1);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(9);
});

test('double click should zoomStep just the selected image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.select(1);
  const e = {};
  cmock.dispatch('dblclick', e);
  expect(viewer.selected.scale).toBe(1);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  cmock.dispatch('dblclick', e);
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.items[1].scale).toBe(1.4);
  expect(viewer.selected.scale).toBe(1.4);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(2);
});

test('mouse wheel should zoom just the selected image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.select(1);
  const e = { wheelDelta: 60 };
  cmock.dispatch('wheel', e);
  expect(viewer.selected.scale).toBe(1);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  cmock.dispatch('wheel', e);
  expect(viewer.items[0].scale).toBe(1);
  expect(viewer.items[1].scale).toBe(1.5);
  expect(viewer.selected.scale).toBe(1.5);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(2);
});

test('key press arrow left and arrow right should change to prev and next selected image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  expect(contextMock.drawImage).toHaveBeenCalledTimes(1);
  expect(viewer.current).toBe(0);
  cmock.dispatch('keypress', { which: 37 });
  expect(viewer.current).toBe(0);
  cmock.dispatch('keypress', { which: 39 });
  expect(viewer.current).toBe(1);
  cmock.dispatch('keypress', { which: 39 });
  expect(viewer.current).toBe(1);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(2);
});

test('drag and drop should just move the selected image', () => {
  const cmock = canvasMock();
  cmock.height = 10;
  cmock.width = 10;
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  expect(contextMock.drawImage).toHaveBeenCalledTimes(1);
  expect(viewer.items[1].position).toEqual([0, 0]);
  expect(viewer.selected.position).toEqual([0, 0]);
  cmock.dispatch('mousemove', { clientX: 40, clientY: 40 });
  cmock.dispatch('mousedown', { clientX: 30, clientY: 30 });
  expect(viewer.selected.position).toEqual([0, 0]);
  expect(viewer.items[1].position).toEqual([0, 0]);
  cmock.dispatch('mousemove', { clientX: 40, clientY: 40 });
  expect(viewer.selected.position).toEqual([10, 10]);
  expect(viewer.items[1].position).toEqual([0, 0]);
  cmock.dispatch('mouseup', { clientX: 40, clientY: 40 });
  cmock.dispatch('mousemove', { clientX: 60, clientY: 30 });
  expect(viewer.selected.position).toEqual([10, 10]);
  expect(viewer.items[1].position).toEqual([0, 0]);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(2);
});

test('manually trigger the move should just move the selected image', () => {
  const cmock = canvasMock();
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  Object.defineProperty(viewer.items[0]._image, 'naturalWidth', { get: () => 100 });
  Object.defineProperty(viewer.items[0]._image, 'naturalHeight', { get: () => 100 });
  expect(contextMock.drawImage).toHaveBeenCalledTimes(1);
  expect(viewer.items[1].position).toEqual([0, 0]);
  expect(viewer.selected.position).toEqual([0, 0]);
  viewer.moveTo([10, 10]);
  expect(viewer.selected.position).toEqual([0, 0]);
  expect(viewer.items[1].position).toEqual([0, 0]);
  viewer.moveTo([-10, -10]);
  expect(viewer.selected.position).toEqual([-10, -10]);
  expect(viewer.items[1].position).toEqual([0, 0]);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(3);
});

test('on resize just all the transformations are reseted', () => {
  const cmock = canvasMock();
  cmock.height = 10;
  cmock.width = 10;
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  expect(contextMock.drawImage).toHaveBeenCalledTimes(1);
  expect(viewer.selected.position).toEqual([0, 0]);
  expect(viewer.selected.scale).toEqual(1);
  cmock.dispatch('mousedown', { clientX: 30, clientY: 30 });
  cmock.dispatch('mousemove', { clientX: 40, clientY: 40 });
  cmock.dispatch('mouseup', { clientX: 40, clientY: 40 });
  cmock.dispatch('wheel', { wheelDelta: 60 });
  expect(viewer.selected.position).toEqual([10, 10]);
  expect(viewer.selected.scale).toEqual(1.5);
  cmock.dispatch('resize', { });
  expect(viewer.selected.position).toEqual([0, 0]);
  expect(viewer.selected.scale).toEqual(1);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(4);
});

test('on navigate to next or prev just all the transformations are reseted', () => {
  const cmock = canvasMock();
  cmock.height = 10;
  cmock.width = 10;
  const viewer = new Viewer(cmock);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1);
  viewer.addImage(src2);
  viewer.items[0]._image.dispatchEvent(new Event('load'));
  viewer.items[1]._image.dispatchEvent(new Event('load'));
  expect(contextMock.drawImage).toHaveBeenCalledTimes(1);
  expect(viewer.selected.position).toEqual([0, 0]);
  expect(viewer.selected.scale).toEqual(1);
  cmock.dispatch('mousedown', { clientX: 30, clientY: 30 });
  cmock.dispatch('mousemove', { clientX: 40, clientY: 40 });
  cmock.dispatch('mouseup', { clientX: 40, clientY: 40 });
  cmock.dispatch('wheel', { wheelDelta: 60 });
  expect(viewer.selected.position).toEqual([10, 10]);
  expect(viewer.selected.scale).toEqual(1.5);
  viewer.next();
  expect(viewer.selected.position).toEqual([0, 0]);
  expect(viewer.selected.scale).toEqual(1);
  viewer.prev();
  expect(viewer.selected.position).toEqual([0, 0]);
  expect(viewer.selected.scale).toEqual(1);
  expect(contextMock.drawImage).toHaveBeenCalledTimes(5);
});
