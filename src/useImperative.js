import { useState, useEffect } from 'react';

import { useAction } from './useAction';
import { continuation } from './utils';

const stateLens = (prop, setState) => v => (
  setState(prev => ({ ...prev, [prop]: v }))
);

export const useImperative = fn => {
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
    if (result && result.then) childrenP = result;
    else childrenP = Promise.resolve(result);

    childrenP
      .then(v => {
        if (v !== undefined) {
          setChildren(v);
        }
        return v;
      })
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
