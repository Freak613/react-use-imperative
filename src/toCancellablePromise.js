import { isNullOrUndef } from './utils';

// Takes Generator and produce Promise with .cancel() method
export const toCancellablePromise = gen => {
  let cancelled = false,
      resolve,
      reject,
      runningPromise;

  const machine = {
    handleYield({ done, value }) {
      if (done) {
        if (isNullOrUndef(value)) {
          resolve(value);
          return;
        }
        if (value.then) {
          const promise = value;
          runningPromise = promise;
          promise.then(
            v => { if (!cancelled) resolve(v); },
            e => { if (!cancelled) reject(e); },
          );
          return;
        }

        resolve(value);
        return;
      }

      const promise = value;
      runningPromise = promise;
      promise.then(v => this.onResolve(v), e => this.onReject(e));
    },
    onResolve(res) {
      if (!cancelled) {
        try {
          this.handleYield(gen.next(res));
        } catch (e) {
          reject(e);
        }
      }
    },
    onReject(err) {
      if (!cancelled) {
        try {
          // Direct an error back to the generator,
          // to be able to catch {} it
          this.handleYield(gen.throw(err));
        } catch (e) {
          // And if it's not handled
          // redirect error to the promise reject
          reject(e);
        }
      }
    },
  };

  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  promise.cancel = () => {
    cancelled = true;
    if (runningPromise && runningPromise.cancel) runningPromise.cancel();
  };

  // Run it
  machine.onResolve();

  return promise;
};

export const async = gen => toCancellablePromise(gen());
