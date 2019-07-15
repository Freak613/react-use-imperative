'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

// Fork of https://github.com/awmleer/use-action

var shouldExecute = function shouldExecute(oldDeps, deps) {
  if (oldDeps === undefined || deps === undefined) return true;
  if (oldDeps.length !== deps.length) return true;
  var length = oldDeps.length;

  for (var i = 0; i < length; i++) {
    if (deps[i] !== oldDeps[i]) return true;
  }

  return false;
};

var useMutableState = function useMutableState(init) {
  return React.useRef(init).current;
};

var useAction = function useAction(action, deps) {
  var data = useMutableState({
    deps: undefined,
    cleanUp: undefined
  });
  var execute = shouldExecute(data.deps, deps);

  if (execute) {
    if (data.cleanUp) data.cleanUp();
    data.deps = deps;
    data.cleanUp = action();
  }

  React.useEffect(function () {
    return function () {
      if (data.cleanUp) data.cleanUp();
    };
  }, []);
};

var isNullOrUndef = function isNullOrUndef(v) {
  return v === undefined || v === null;
};
var continuation = function continuation() {
  var resolve;
  var promise = new Promise(function (r) {
    return resolve = r;
  });
  return [resolve, promise];
};

var stateLens = function stateLens(prop, setState) {
  return function (v) {
    return setState(function (prev) {
      var _extends2;

      return _extends({}, prev, (_extends2 = {}, _extends2[prop] = v, _extends2));
    });
  };
};

var useImperative = function useImperative(fn) {
  var _useState = React.useState({
    children: null,
    error: null,
    didUpdate: null
  }),
      state = _useState[0],
      setState = _useState[1];

  var setChildren = function setChildren(v) {
    var _continuation = continuation(),
        didUpdate = _continuation[0],
        onUpdate = _continuation[1];

    setState(function (prev) {
      return _extends({}, prev, {
        children: v,
        didUpdate: didUpdate
      });
    });
    return onUpdate;
  };

  var setError = stateLens('error', setState);
  useAction(function () {
    var result = fn(setChildren);
    var childrenP;
    if (result && result.then) childrenP = result;else childrenP = Promise.resolve(result);
    childrenP.then(function (v) {
      if (v !== undefined) {
        setChildren(v);
      }

      return v;
    }).catch(setError);
    return function () {
      if (childrenP.cancel) childrenP.cancel();
    };
  }, []);
  React.useEffect(function () {
    if (state.didUpdate !== null && state.error === null) state.didUpdate();
  }, [state.didUpdate]);
  if (state.error !== null) throw state.error;
  return state.children;
};

var toCancellablePromise = function toCancellablePromise(gen) {
  var cancelled = false,
      resolve,
      reject,
      runningPromise;
  var machine = {
    handleYield: function handleYield(_ref) {
      var _this = this;

      var done = _ref.done,
          value = _ref.value;

      if (done) {
        if (isNullOrUndef(value)) {
          resolve(value);
          return;
        }

        if (value.then) {
          var _promise = value;
          runningPromise = _promise;

          _promise.then(function (v) {
            if (!cancelled) resolve(v);
          }, function (e) {
            if (!cancelled) reject(e);
          });

          return;
        }

        resolve(value);
        return;
      }

      var promise = value;
      runningPromise = promise;
      promise.then(function (v) {
        return _this.onResolve(v);
      }, function (e) {
        return _this.onReject(e);
      });
    },
    onResolve: function onResolve(res) {
      if (!cancelled) {
        try {
          this.handleYield(gen.next(res));
        } catch (e) {
          reject(e);
        }
      }
    },
    onReject: function onReject(err) {
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
    }
  };
  var promise = new Promise(function (promiseResolve, promiseReject) {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  promise.cancel = function () {
    cancelled = true;
    if (runningPromise && runningPromise.cancel) runningPromise.cancel();
  }; // Run it


  machine.onResolve();
  return promise;
};
var async = function async(gen) {
  return toCancellablePromise(gen());
};

var RenderPointContext = React__default.createContext();
var useRenderPoint = function useRenderPoint() {
  return React.useContext(RenderPointContext);
};
var RenderPointProvider = function RenderPointProvider(_ref) {
  var children = _ref.children;

  var _useState = React.useState(null),
      state = _useState[0],
      setState = _useState[1];

  return React__default.createElement(RenderPointContext.Provider, {
    value: setState
  }, state !== null ? state : children);
};

exports.RenderPointContext = RenderPointContext;
exports.RenderPointProvider = RenderPointProvider;
exports.async = async;
exports.toCancellablePromise = toCancellablePromise;
exports.useAction = useAction;
exports.useImperative = useImperative;
exports.useRenderPoint = useRenderPoint;
