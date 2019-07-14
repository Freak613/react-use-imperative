export const isNullOrUndef = v => v === undefined || v === null;

export const continuation = () => {
  let resolve;
  const promise = new Promise(r => resolve = r);
  return [resolve, promise];
};

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
