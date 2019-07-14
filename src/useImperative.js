import React, { useState, useEffect, useContext } from 'react';

import { toCancellablePromise } from './toCancellablePromise';
import { useAction } from './useAction';
import { continuation, isNullOrUndef } from './utils';

const stateLens = (prop, setState) => v => (
  setState(prev => ({ ...prev, [prop]: v }))
);

export const useImperative = (fn, onDone) => {
  const [state, setState] = useState({
    children: null,
    error: null,
    didUpdate: null,
  });
  const setChildren = v => {
    const [didUpdate, onUpdate] = continuation();
    setState(prev => ({
      ...prev,
      children: v,
      didUpdate,
    }));
    return onUpdate;
  };
  const setError = stateLens('error', setState);

  useAction(() => {
    const result = fn(setChildren);

    let childrenP;
    if (isNullOrUndef(result)) childrenP = Promise.resolve(result);
    else if (result.next) childrenP = toCancellablePromise(result);
    else if (result.then) childrenP = result;
    else childrenP = Promise.resolve(result);

    childrenP
      .then(v => {
        if (v !== undefined) {
          setChildren(v);
        }
        return v;
      })
      .then(v => { if (onDone) onDone(v); })
      .catch(setError);

    return () => {
      if (childrenP.cancel) childrenP.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.didUpdate !== null && state.error === null) state.didUpdate();
  }, [state.didUpdate]);

  if (state.error !== null) throw state.error;

  return state.children;
};

export const Imperative = ({ play, onDone }) => useImperative(play, onDone);

export const ImperativeRenderContext = React.createContext();
export const useImperativeContext = () => useContext(ImperativeRenderContext);
export const ImperativeProvider = ({ children }) => {
  const [state, setState] = useState({ render: null });

  const setRender = stateLens('render', setState);
  const onDone = lastChildren => {
    if (lastChildren === null) setRender(null);
  };

  const content = state.render !== null
    ? React.createElement(Imperative, { play: state.render, onDone })
    : children;

  return React.createElement(ImperativeRenderContext.Provider, { value: setRender }, content);
};
