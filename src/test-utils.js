export const contextMock = {
  clearRect: jest.fn(),
  drawImage: jest.fn(),
};

export const canvasMock = () => {
  const cmock = {
    events: {},
    offsetTop: 10,
    offsetLeft: 5,
    width: 50,
    height: 50,
    getContext: jest.fn(() => contextMock),
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
