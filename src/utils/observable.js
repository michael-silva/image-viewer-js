const Observable = () => {
  const subscribers = [];
  const errorHandlers = [];
  return {
    subscribers: () => subscribers,
    next: (...args) => {
      subscribers.forEach((sub) => sub(...args));
    },
    subscribe: (callback) => {
      subscribers.push(callback);
    },
    error: (...args) => {
      subscribers.forEach((sub) => sub(...args));
    },
    catch: (callback) => {
      errorHandlers.push(callback);
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
