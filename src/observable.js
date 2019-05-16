const Observable = () => {
  const subscribers = [];
  return {
    next: (...args) => {
      subscribers.forEach((sub) => sub(...args));
    },
    subscribe: (callback) => {
      subscribers.push(callback);
    },
  };
};

export const fromEvent = (elem, event) => {
  const obs = Observable();
  elem.addEventListener(event, (e) => obs.next(e));
  return obs;
};

export { Observable as of };
export default Observable;
