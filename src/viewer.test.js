/* eslint-disable no-underscore-dangle */
import { canvasMock, contextMock } from './test-utils';
import { setupViewer } from './viewer';

afterEach(() => {
  contextMock.drawImage.mockReset();
  contextMock.clearRect.mockReset();
});

test('viewer should add a single image', () => {
  const cmock = canvasMock();
  const viewer = setupViewer(cmock, 10, 10);
  const src1 = 'a1';
  viewer.addImage(src1);
  expect(viewer.items).toHaveLength(1);
});

test('viewer should add multiple images', () => {
  const cmock = canvasMock();
  const viewer = setupViewer(cmock, 10, 10);
  const src1 = 'a1';
  const src2 = 'a2';
  const src3 = 'a3';
  viewer.addImage(src1).addImage(src2);
  viewer.addImage(src3);
  expect(viewer.items).toHaveLength(3);
});

test('viewer should start loading when add first image', () => {
  const cmock = canvasMock();
  const viewer = setupViewer(cmock, 10, 10);
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
  const viewer = setupViewer(cmock, 10, 10);
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
  const viewer = setupViewer(cmock, 10, 10);
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
  const viewer = setupViewer(cmock, 10, 10);
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
  const viewer = setupViewer(cmock, 10, 10);
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

test('double tap should zoom Step just the selected image', () => {
});

test('mouse wheel should zoom just the selected image', () => {
});

test('pinch in and pinch out should zoom just the selected image', () => {
});

test('swipe left and right should change to prev and next selected image', () => {
});

test('key press arrow left and arrow right should change to prev and next selected image', () => {
});

test('drag and drop should just move the selected image', () => {
});

test('on resize just all the transformations are reseted', () => {
});

test('on navigate to next or prev just all the transformations are reseted', () => {
});

test('get a lista of thumb images', () => {
});
