import React from 'react';
import { storiesOf } from '@storybook/react';

import {
  Imperative,
  useImperativeContext,
  ImperativeProvider,
} from './useImperative';
import { sleep } from './utils';

function* waitAndDone(render) {
  yield render('Loading');
  yield sleep(1000);
  yield render('Result');
  yield sleep(1000);
  console.log('done');
}
function* waitAndThrow(render) {
  yield render('Loading');
  yield sleep(1000);
  yield render('Result');
  yield sleep(1000);
  throw new Error('Fail');
}
const promiseWaitAndThrow = async render => {
  await render('Loading');
  await sleep(1000);
  await render('Result');
  await sleep(1000);
  throw new Error('Fail');
};

storiesOf('tools/useImperative', module)
  .addDecorator(childrenFn => (
    <ErrorBoundary>{ childrenFn() }</ErrorBoundary>
  ))
  .add('as hook', () => <Imperative play={ waitAndDone } />)
  .add('throw with yield', () => <Imperative play={ waitAndThrow } />)
  .add('throw with promise', () => (
    <Imperative play={ promiseWaitAndThrow } />
  ));

const Runner = ({ render }) => {
  const useParent = useImperativeContext();

  const onClick = () => {
    useParent(render);
  };

  return (
    <button type="button" onClick={ onClick }>Click me</button>
  );
};

const waitAndKeepRunning = waitAndDone;

function* waitAndHide(render) {
  yield* waitAndDone(render);
  return null;
}

storiesOf('tools/ImperativeProvider', module)
  .addDecorator(childrenFn => (
    <ErrorBoundary>{ childrenFn() }</ErrorBoundary>
  ))
  .add('render waitAndThrow', () => (
    <ImperativeProvider>
      <Runner render={ waitAndThrow } />
    </ImperativeProvider>
  ))
  .add('render waitAndKeepRunning', () => (
    <ImperativeProvider>
      <Runner render={ waitAndKeepRunning } />
    </ImperativeProvider>
  ))
  .add('render waitAndHide', () => (
    <ImperativeProvider>
      <Runner render={ waitAndHide } />
    </ImperativeProvider>
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
