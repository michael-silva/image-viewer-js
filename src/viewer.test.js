/* eslint-disable no-underscore-dangle */
import { canvasMock, contextMock } from './test-utils';
import { Viewer, freeZoom, stepZoom } from './viewer';

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


test('stepZoom should increase based on steps', () => {
  const expected1 = 1.4;
  const expected2 = 1.8;
  const result1 = stepZoom(1);
  const result2 = stepZoom(result1);
  expect(result1).toBe(expected1);
  expect(result2).toBe(expected2);
});

test('stepZoom should go back for first step after max', () => {
  const expected1 = 2;
  const expected2 = 1;
  const result1 = stepZoom(1.8);
  const result2 = stepZoom(result1);
  expect(result1).toBe(expected1);
  expect(result2).toBe(expected2);
});

test('stepZoom should go to first step if the scale is custom', () => {
  const expected = 1;
  const result = stepZoom(1.3);

  expect(result).toBe(expected);
});

test('freeZoom should scale for value passed', () => {
  const expected1 = 1.3;
  const expected2 = 1.7;
  const result1 = freeZoom(1, 0.3);
  const result2 = freeZoom(1, 0.7);
  expect(result1).toBe(expected1);
  expect(result2).toBe(expected2);
});

test('freeZoom should not pass the scale min and max', () => {
  const expected1 = 1;
  const expected2 = 2;
  const result1 = freeZoom(1, -0.3);
  const result2 = freeZoom(result1, 4);
  expect(result1).toBe(expected1);
  expect(result2).toBe(expected2);
});
