import { stepZoom, freeZoom } from './zoom-track';


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
