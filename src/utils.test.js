import { sumArrays, subArrays } from './utils';

test('sumArrays should sum each item of two arrays', () => {
  const a1 = [1, 2, 3, 4, 5];
  const a2 = [5, 4, 3, 2, 1];
  const expected = [6, 6, 6, 6, 6];
  const result = sumArrays(a1, a2);
  expect(a1).not.toEqual(result);
  expect(a2).not.toEqual(result);
  expect(expected).toEqual(result);
});

test('subArrays should subtract each item of two arrays', () => {
  const a1 = [1, 2, 3, 4, 5];
  const a2 = [5, 4, 3, 2, 1];
  const expected = [-4, -2, 0, 2, 4];
  const result = subArrays(a1, a2);
  expect(a1).not.toEqual(result);
  expect(a2).not.toEqual(result);
  expect(expected).toEqual(result);
});
