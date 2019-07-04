const Observable = () => {
  const subscribers = [];
  const errorHandlers = [];
  const instance = {
    next: (...args) => {
      subscribers.forEach((sub) => sub(...args));
    },
    subscribe: (callback) => {
      subscribers.push(callback);
      return { catch: instance.catch };
    },
    error: (...args) => {
      errorHandlers.forEach((sub) => sub(...args));
    },
    catch: (callback) => {
      errorHandlers.push(callback);
    },
  };
  return instance;
};

export const fromEvent = (elem, event) => {
  const obs = Observable();
  elem.addEventListener(event, (e) => obs.next(e));
  return obs;
};

export { Observable as of };
export default Observable;
