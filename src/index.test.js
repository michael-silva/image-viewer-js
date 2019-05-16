import { sumArrays, subArrays } from './utils';
import {
  mouseTrack,
  stepZoom,
  freeZoom,
  boundsOn,
  translateOn,
  transformOnCanvas,
  setupViewer,
} from '.';

const canvasMock = () => {
  const cmock = {
    events: {},
    offsetTop: 10,
    offsetLeft: 5,
    width: 50,
    height: 50,
    getContext: () => ({

    }),
    addEventListener: (name, callback) => {
      if (!cmock.events[name]) cmock.events[name] = [];
      cmock.events[name].push(callback);
    },
    dispatch: (name, e) => {
      (cmock.events[name] || []).forEach((c) => c(e));
    },
  };
  return cmock;
};


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

test('mouseTrack dont update if not mouse down', () => {
  const cmock = canvasMock();
  const expecteds = [{
    isDragging: false,
    currPosition: [0, 0],
    lastPosition: [0, 0],
  }];
  const mouse$ = mouseTrack(cmock);
  let count = 0;
  mouse$.subscribe((t) => expect(t).toEqual(expecteds[count++]));
  const e1 = {
    clientX: 120,
    clientY: 50,
  };
  const e2 = {
    clientX: 125,
    clientY: 52,
  };
  cmock.dispatch('mousemove', e1);
  cmock.dispatch('mousemove', e2);
  expect(count).toBe(0);
});

test('mouseTrack move when mouse is down', () => {
  const cmock = canvasMock();
  const expecteds = [{
    isDragging: true,
    currPosition: [120, 42],
    lastPosition: [115, 40],
  }];
  const mouse$ = mouseTrack(cmock);
  let count = 0;
  mouse$.subscribe((t) => expect(t).toEqual(expecteds[count++]));
  const e1 = {
    clientX: 120,
    clientY: 50,
  };
  const e2 = {
    clientX: 125,
    clientY: 52,
  };
  cmock.dispatch('mousedown', e1);
  cmock.dispatch('mousemove', e2);
  expect(count).toBe(expecteds.length);
});

test('mouseTrack stop moving after mouse up', () => {
  const cmock = canvasMock();
  const expecteds = [{
    isDragging: false,
    currPosition: [0, 0],
    lastPosition: [0, 0],
  }];
  const mouse$ = mouseTrack(cmock);
  let count = 0;
  mouse$.subscribe((t) => expect(t).toEqual(expecteds[count++]));
  const e1 = {
    clientX: 120,
    clientY: 50,
  };
  const e2 = {
    clientX: 125,
    clientY: 52,
  };
  cmock.dispatch('mousedown', e1);
  cmock.dispatch('mouseup', e2);
  cmock.dispatch('mousemove', e2);
  expect(count).toBe(0);
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

test('boundsOn should get the bounds of an image into canvas', () => {
  const cmock = canvasMock();
  const cimg = { naturalHeight: 100, naturalWidth: 100 };
  const getBounds = boundsOn(cmock, cimg);
  const result = getBounds(1);
  const expected = {
    minX: -50,
    maxX: 0,
    minY: -50,
    maxY: 0,
  };

  expect(result).toEqual(expected);
});

test('boundsOn should get the bounds by scale', () => {
  const cmock = canvasMock();
  const cimg = { naturalHeight: 100, naturalWidth: 100 };
  const getBounds = boundsOn(cmock, cimg);
  const result = getBounds(2);
  const expected = {
    minX: -150,
    maxX: 0,
    minY: -150,
    maxY: 0,
  };

  expect(result).toEqual(expected);
});

test('translateOn should return a translated array', () => {
  const cmock = canvasMock();
  const cimg = { naturalHeight: 100, naturalWidth: 100 };
  const getBounds = boundsOn(cmock, cimg);
  const getPosition = translateOn(getBounds(1));
  const result = getPosition([0, 0], [-10, -30]);
  const expected = [-10, -30];

  expect(result).toEqual(expected);
});

test('translateOn should not tresspass the bound limits', () => {
  const cmock = canvasMock();
  const cimg = { naturalHeight: 100, naturalWidth: 100 };
  const getBounds = boundsOn(cmock, cimg);
  const getPosition = translateOn(getBounds(1));
  const result = getPosition([0, 0], [10, 30]);
  const expected = [0, 0];

  expect(result).toEqual(expected);
});

test('transformOnCanvas should move if mousetrack changes', () => {
  const cmock = canvasMock();
  const cimg = { naturalHeight: 100, naturalWidth: 100 };
  const expecteds = [{
    scale: 1,
    translate: [-5, -2],
  }];
  const transform$ = transformOnCanvas(cmock, cimg);
  let count = 0;
  transform$.subscribe((t) => expect(t).toEqual(expecteds[count++]));
  const e1 = {
    clientX: 120,
    clientY: 50,
  };
  const e2 = {
    clientX: 125,
    clientY: 52,
  };
  cmock.dispatch('mousedown', e2);
  cmock.dispatch('mousemove', e1);
  expect(count).toBe(expecteds.length);
});

test('transformOnCanvas should scale image on mouse wheel', () => {
  const cmock = canvasMock();
  const cimg = { naturalHeight: 100, naturalWidth: 100 };
  const expecteds = [{
    scale: 1.1,
    translate: [0, 0],
  }];
  const transform$ = transformOnCanvas(cmock, cimg);
  let count = 0;
  transform$.subscribe((t) => expect(t).toEqual(expecteds[count++]));
  const e = {
    delta: 12,
  };
  cmock.dispatch('wheel', e);
  expect(count).toBe(expecteds.length);
});

test('transformOnCanvas should scale on steps dblclick', () => {
  const cmock = canvasMock();
  const cimg = { naturalHeight: 100, naturalWidth: 100 };
  const expecteds = [{
    scale: 1.4,
    translate: [0, 0],
  }];
  const transform$ = transformOnCanvas(cmock, cimg);
  let count = 0;
  transform$.subscribe((t) => expect(t).toEqual(expecteds[count++]));
  const e = {};
  cmock.dispatch('dblclick', e);
  expect(count).toBe(expecteds.length);
});

test('setupViewer should return a viewer', () => {
  const cmock = canvasMock();
  const viewer = setupViewer(cmock, 10, 10);
  const src1 = 'a1';
  const src2 = 'a2';
  viewer.addImage(src1).addImage(src2);
  expect(viewer).not.toBe(null);
});

test('', () => {
});

test('', () => {
});

test('', () => {
});

test('', () => {
});

test('', () => {
});

test('', () => {
});
