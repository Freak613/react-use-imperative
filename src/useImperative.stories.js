import React from 'react';
import { storiesOf } from '@storybook/react';

import { useImperative } from './useImperative';
import { RenderPointProvider, useRenderPoint } from './RenderPoint';
import { sleep } from './utils';
import { async } from './toCancellablePromise';

const waitAndDone = render => async(function* () {
  yield render('Loading');
  yield sleep(1000);
  yield render('Result');
  yield sleep(1000);
  console.log('done');
});
const waitAndThrow = render => async(function* () {
  yield render('Loading');
  yield sleep(1000);
  yield render('Result');
  yield sleep(1000);
  throw new Error('Fail');
});
const promiseWaitAndThrow = async render => {
  await render('Loading');
  await sleep(1000);
  await render('Result');
  await sleep(1000);
  throw new Error('Fail');
};

const HookTester = ({ play }) => useImperative(play);

storiesOf('tools/useImperative', module)
  .addDecorator(childrenFn => (
    <ErrorBoundary>{ childrenFn() }</ErrorBoundary>
  ))
  .add('as hook', () => <HookTester play={ waitAndDone } />)
  .add('throw with yield', () => <HookTester play={ waitAndThrow } />)
  .add('throw with promise', () => (
    <HookTester play={ promiseWaitAndThrow } />
  ));

const Runner = ({ component }) => {
  const useParent = useRenderPoint();

  const onClick = () => {
    useParent(component);
  };

  return (
    <button type="button" onClick={ onClick }>Click me</button>
  );
};

const WaitAndThrow = () => useImperative(waitAndThrow);

const WaitAndKeepRunning = () => useImperative(waitAndDone);

const WaitAndHide = () => {
  const useParent = useRenderPoint();

  return useImperative(render => async(function* () {
    yield waitAndDone(render);
    useParent(null);
  }));
};

storiesOf('tools/ImperativeProvider', module)
  .addDecorator(childrenFn => (
    <ErrorBoundary>{ childrenFn() }</ErrorBoundary>
  ))
  .add('render waitAndThrow', () => (
    <RenderPointProvider>
      <Runner component={ <WaitAndThrow /> } />
    </RenderPointProvider>
  ))
  .add('render waitAndKeepRunning', () => (
    <RenderPointProvider>
      <Runner component={ <WaitAndKeepRunning /> } />
    </RenderPointProvider>
  ))
  .add('render waitAndHide', () => (
    <RenderPointProvider>
      <Runner component={ <WaitAndHide /> } />
    </RenderPointProvider>
  ));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { state, props } = this;

    if (state.error) return 'Oops';

    return props.children;
  }
}
