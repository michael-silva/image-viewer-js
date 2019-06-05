import { canvasMock } from './utils/test-utils';
import { mouseTrack } from './mouse-track';


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
