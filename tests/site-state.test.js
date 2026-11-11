// Run with: node --test
// Zero dependencies. Checks the shared state machines in site-state.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const SiteState = require('../site-state.js');

const { machines, next, createMachine, validate } = SiteState;

test('every shared machine is well formed', () => {
  for (const definition of Object.values(machines)) {
    assert.doesNotThrow(() => validate(definition), definition.id);
  }
});

test('every state can be reached from the initial state', () => {
  for (const definition of Object.values(machines)) {
    const seen = new Set([definition.initial]);
    const queue = [definition.initial];
    while (queue.length) {
      const on = definition.states[queue.shift()].on || {};
      for (const target of Object.values(on)) {
        if (!seen.has(target)) { seen.add(target); queue.push(target); }
      }
    }
    assert.deepEqual([...seen].sort(), Object.keys(definition.states).sort(), definition.id);
  }
});

test('validate rejects a transition to an unknown state', () => {
  assert.throws(() => validate({ id: 'bad', initial: 'a', states: { a: { on: { GO: 'b' } } } }), /unknown state "b"/);
  assert.throws(() => validate({ id: 'bad', initial: 'missing', states: { a: {} } }), /unknown initial state/);
});

test('model: a stale or repeated LOADED cannot skip loading', () => {
  const m = machines.model;
  assert.equal(next(m, 'loading', 'LOADED'), 'ready');
  assert.equal(next(m, 'ready', 'LOADED'), null);
  assert.equal(next(m, 'ready', 'FAILED'), null, 'an error after a successful load is ignored');
  assert.equal(next(m, 'error', 'LOADED'), null);
  assert.equal(next(m, 'ready', 'LOAD'), 'loading');
  assert.equal(next(m, 'error', 'LOAD'), 'loading', 'retry is allowed');
});

test('model: unavailable (viewer library missing) is final', () => {
  const m = machines.model;
  for (const state of ['loading', 'ready', 'error']) assert.equal(next(m, state, 'LIBRARY_FAILED'), 'unavailable');
  assert.deepEqual(m.states.unavailable.on || {}, {});
});

test('camera: problems are final, so later events cannot hide them', () => {
  const m = machines.camera;
  for (const state of ['blocked', 'insecure', 'unsupported']) {
    for (const event of ['STARTED', 'BLOCKED', 'INSECURE', 'UNSUPPORTED']) assert.equal(next(m, state, event), null, state + ' ' + event);
  }
  assert.equal(next(m, 'starting', 'STARTED'), 'running');
  assert.equal(next(m, 'running', 'BLOCKED'), 'blocked');
});

test('tracking: found and lost alternate', () => {
  const m = machines.tracking;
  assert.equal(next(m, 'searching', 'FOUND'), 'found');
  assert.equal(next(m, 'found', 'LOST'), 'searching');
  assert.equal(next(m, 'searching', 'LOST'), null);
});

test('arLaunch: a new request always clears an old message', () => {
  const m = machines.arLaunch;
  for (const state of Object.keys(m.states)) assert.equal(next(m, state, 'REQUEST'), 'idle', state);
  assert.equal(next(m, 'failed', 'FAILED'), 'failed', 'a newer failure message replaces the old one');
});

test('rotation: toggle flips, SPIN always resumes', () => {
  const m = machines.rotation;
  assert.equal(next(m, 'spinning', 'TOGGLE'), 'paused');
  assert.equal(next(m, 'paused', 'TOGGLE'), 'spinning');
  assert.equal(next(m, 'paused', 'SPIN'), 'spinning');
});

test('createMachine: sends, ignores, notifies and mirrors state', () => {
  const attributes = {};
  const element = { setAttribute: (name, value) => { attributes[name] = value; } };
  const model = createMachine(machines.model, { element });
  assert.equal(attributes['data-model-state'], 'loading');

  const seen = [];
  const unsubscribe = model.subscribe((state, info) => seen.push([info.from, info.event, state, info.detail]));
  assert.equal(model.send('LOADED', { url: 'a.glb' }), true);
  assert.equal(model.state, 'ready');
  assert.equal(attributes['data-model-state'], 'ready');
  assert.equal(model.send('LOADED'), false, 'ignored events return false');
  assert.equal(model.can('LOAD'), true);
  assert.deepEqual(seen, [['loading', 'LOADED', 'ready', { url: 'a.glb' }]]);

  unsubscribe();
  model.send('LOAD');
  assert.equal(seen.length, 1, 'no calls after unsubscribe');
  assert.equal(model.is('loading'), true);
});

test('createMachine: optional initial state', () => {
  const model = createMachine(machines.model, { element: null, initial: 'ready' });
  assert.equal(model.state, 'ready');
  assert.throws(() => createMachine(machines.model, { element: null, initial: 'nope' }), /unknown initial state/);
});

test('viewerLibraryFailed: listeners added before and after the failure both run once', () => {
  let before = 0, after = 0;
  SiteState.onViewerLibraryFailed(() => before++);
  SiteState.viewerLibraryFailed();
  SiteState.viewerLibraryFailed();
  SiteState.onViewerLibraryFailed(() => after++);
  assert.equal(before, 1);
  assert.equal(after, 1);
});
