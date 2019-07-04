export const contextMock = {
  clearRect: jest.fn(),
  drawImage: jest.fn(),
};

export const createElem = () => {
  const elem = {
    events: {},
    addEventListener: (name, callback) => {
      if (!elem.events[name]) elem.events[name] = [];
      elem.events[name].push(callback);
    },
    dispatch: (name, e) => {
      (elem.events[name] || []).forEach((c) => c(e));
    },
  };

  return elem;
};

export const canvasMock = (w, h) => {
  const ownerDocument = createElem();
  ownerDocument.defaultView = createElem();
  const cmock = {
    ownerDocument,
    events: {},
    offsetTop: 10,
    offsetLeft: 5,
    width: w || 50,
    clientWidth: w || 50,
    height: h || 50,
    clientHeight: h || 50,
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
