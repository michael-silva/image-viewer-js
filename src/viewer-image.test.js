/* eslint-disable no-underscore-dangle */
import { ViewerImage } from './viewer-image';

jest.mock('./utils/load-image');
ViewerImage.ZOOM_STEPS = [1, 1.4, 1.8, 2];

test('stepZoom should increase based on steps', () => {
  const image = new ViewerImage('src', 100, 100);
  const expected1 = 1.4;
  const expected2 = 1.8;
  image.zoomIn();
  const result1 = image._scale;
  image.zoomIn();
  const result2 = image._scale;
  expect(result1).toBe(expected1);
  expect(result2).toBe(expected2);
});

test('stepZoom should go back for first step after max', () => {
  const image = new ViewerImage('src', 100, 100);
  const expected1 = 2;
  const expected2 = 1;
  image.zoomIn();
  image.zoomIn();
  image.zoomIn();
  const result1 = image._scale;
  image.zoomIn();
  const result2 = image._scale;
  expect(result1).toBe(expected1);
  expect(result2).toBe(expected2);
});

test('stepZoom should go to first step if the scale is custom', () => {
  const image = new ViewerImage('src', 100, 100);
  const expected = 1;
  image._scale = 1.3;
  image.zoomIn();
  const result = image._scale;

  expect(result).toBe(expected);
});

test('freeZoom should scale for value passed', () => {
  const image = new ViewerImage('src', 100, 100);
  const expected1 = 1.3;
  const expected2 = 1.7;
  image.zoom(0.3);
  const result1 = image._scale;
  image._scale = 1;
  image.zoom(0.7);
  const result2 = image._scale;
  expect(result1).toBe(expected1);
  expect(result2).toBe(expected2);
});

test('freeZoom should not pass the scale min and max', () => {
  const image = new ViewerImage('src', 100, 100);
  const expected1 = 1;
  const expected2 = 2;
  image.zoom(-0.3);
  const result1 = image._scale;
  image.zoom(4);
  const result2 = image._scale;
  expect(result1).toBe(expected1);
  expect(result2).toBe(expected2);
});
