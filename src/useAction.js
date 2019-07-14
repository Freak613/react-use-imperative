// Fork of https://github.com/awmleer/use-action
import { useRef, useEffect } from 'react';

const shouldExecute = (oldDeps, deps) => {
  if (oldDeps === undefined || deps === undefined) return true

  if (oldDeps.length !== deps.length) return true

  const length = oldDeps.length
  for (let i = 0; i < length; i++) {
    if (deps[i] !== oldDeps[i]) return true
  }
  return false
}

const useMutableState = init => useRef(init).current;

export const useAction = (action, deps) => {
  const data = useMutableState({
    deps: undefined,
    cleanUp: undefined,
  });

  const execute = shouldExecute(data.deps, deps);
  if (execute) {
    if (data.cleanUp) data.cleanUp();
    data.deps = deps;
    data.cleanUp = action();
  }

  useEffect(() => () => {
    if (data.cleanUp) data.cleanUp();
  }, []);
};
