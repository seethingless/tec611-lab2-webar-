/*
  site-state.js: small explicit state machines shared by the TEC611 WebAR pages.

  Each interactive page describes its behaviour as a few machines. A machine
  is a list of states and, for each state, the events it accepts. An event
  that the current state does not list is ignored, so a late, repeated or
  stale event cannot move the page into a state the table does not allow.

  Every machine mirrors its state onto <html> as data-<id>-state, for example
  <html data-model-state="ready" data-tracking-state="found">. People, tests
  and agents can read the page state from the DOM without reading the code.
  Set SiteState.debug = true in the browser console to log every transition.

  The shared definitions below are plain data, so tests/site-state.test.js can
  check them with Node (node --test).
*/
(function (root) {
  'use strict';

  var has = function (object, key) { return Object.prototype.hasOwnProperty.call(object, key); };

  function validate(definition) {
    if (!definition || !definition.id || !definition.states) throw new Error('A machine needs an id and states.');
    if (!has(definition.states, definition.initial)) throw new Error(definition.id + ': unknown initial state "' + definition.initial + '".');
    Object.keys(definition.states).forEach(function (name) {
      var on = definition.states[name].on || {};
      Object.keys(on).forEach(function (event) {
        if (!has(definition.states, on[event])) {
          throw new Error(definition.id + ': ' + name + ' --' + event + '--> unknown state "' + on[event] + '".');
        }
      });
    });
    return definition;
  }

  // Pure transition function: returns the next state, or null when the event is not accepted.
  function next(definition, state, event) {
    var on = (definition.states[state] && definition.states[state].on) || {};
    return has(on, event) ? on[event] : null;
  }

  function createMachine(definition, options) {
    validate(definition);
    var element = options && 'element' in options ? options.element
      : (typeof document !== 'undefined' ? document.documentElement : null);
    var attribute = 'data-' + definition.id + '-state';
    var current = (options && options.initial) || definition.initial;
    if (!has(definition.states, current)) throw new Error(definition.id + ': unknown initial state "' + current + '".');
    var listeners = [];

    function reflect() { if (element) element.setAttribute(attribute, current); }

    var machine = {
      id: definition.id,
      definition: definition,
      get state() { return current; },
      is: function (state) { return current === state; },
      can: function (event) { return next(definition, current, event) !== null; },
      send: function (event, detail) {
        var target = next(definition, current, event);
        if (target === null) {
          if (api.debug) console.debug('[' + definition.id + '] ' + current + ' ignored ' + event);
          return false;
        }
        var from = current;
        current = target;
        reflect();
        if (api.debug) console.debug('[' + definition.id + '] ' + from + ' --' + event + '--> ' + current);
        listeners.slice().forEach(function (listener) {
          listener(current, { event: event, from: from, detail: detail });
        });
        return true;
      },
      subscribe: function (listener) {
        listeners.push(listener);
        return function unsubscribe() { listeners = listeners.filter(function (l) { return l !== listener; }); };
      }
    };
    reflect();
    return machine;
  }

  // Shared machine shapes. Pages create them with SiteState.createMachine(SiteState.machines.model).
  var machines = {
    // A 3D model download. "unavailable" means the 3D viewer library itself
    // failed to load, so nothing can be shown until the page is reloaded.
    model: {
      id: 'model',
      initial: 'loading',
      states: {
        loading: { on: { LOAD: 'loading', LOADED: 'ready', FAILED: 'error', LIBRARY_FAILED: 'unavailable' } },
        ready: { on: { LOAD: 'loading', LIBRARY_FAILED: 'unavailable' } },
        error: { on: { LOAD: 'loading', LIBRARY_FAILED: 'unavailable' } },
        unavailable: {}
      }
    },
    // Whether the camera currently sees the AR marker.
    tracking: {
      id: 'tracking',
      initial: 'searching',
      states: {
        searching: { on: { FOUND: 'found' } },
        found: { on: { LOST: 'searching' } }
      }
    },
    // The webcam feed used by marker AR. insecure, unsupported and blocked are final.
    camera: {
      id: 'camera',
      initial: 'starting',
      states: {
        starting: { on: { STARTED: 'running', BLOCKED: 'blocked', INSECURE: 'insecure', UNSUPPORTED: 'unsupported' } },
        running: { on: { BLOCKED: 'blocked' } },
        blocked: {},
        insecure: {},
        unsupported: {}
      }
    },
    // The "View in AR" / "Place in my room" button for model-viewer pages.
    arLaunch: {
      id: 'ar',
      initial: 'idle',
      states: {
        idle: { on: { REQUEST: 'idle', UNAVAILABLE: 'unavailable', FAILED: 'failed', RESET: 'idle' } },
        unavailable: { on: { REQUEST: 'idle', RESET: 'idle' } },
        failed: { on: { FAILED: 'failed', REQUEST: 'idle', RESET: 'idle' } }
      }
    },
    // Auto-rotation of a preview.
    rotation: {
      id: 'rotation',
      initial: 'spinning',
      states: {
        spinning: { on: { TOGGLE: 'paused', SPIN: 'spinning' } },
        paused: { on: { TOGGLE: 'spinning', SPIN: 'spinning' } }
      }
    }
  };
  Object.keys(machines).forEach(function (key) { validate(machines[key]); });

  /*
    Reports when the model-viewer library could not be downloaded. Pages add
    onerror="SiteState.viewerLibraryFailed()" to the model-viewer <script>, which
    may fire before or after the page script runs, so the failure is remembered.
  */
  var libraryFailed = false;
  var libraryListeners = [];
  function viewerLibraryFailed() {
    if (libraryFailed) return;
    libraryFailed = true;
    libraryListeners.slice().forEach(function (listener) { listener(); });
  }
  function onViewerLibraryFailed(listener) {
    if (libraryFailed) listener();
    else libraryListeners.push(listener);
  }

  /*
    Connects a <model-viewer> to a model machine. A model-viewer "load" event
    carries the URL it loaded; when the user switches model mid-download,
    model-viewer still fires "load" for the cancelled URL, so that event is
    ignored unless it matches the current src.
  */
  function bindModelViewer(viewer, model) {
    viewer.addEventListener('load', function (event) {
      var url = event && event.detail && event.detail.url;
      if (url && url !== viewer.src) return;
      model.send('LOADED', { url: url });
    });
    viewer.addEventListener('error', function (event) {
      model.send('FAILED', event && event.detail);
    });
    onViewerLibraryFailed(function () { model.send('LIBRARY_FAILED'); });
  }

  /* Connects AR.js camera and marker events to camera and tracking machines. */
  function bindMarkerAR(marker, camera, tracking) {
    if (!(typeof window !== 'undefined' && window.isSecureContext)) camera.send('INSECURE');
    else if (!(typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) camera.send('UNSUPPORTED');
    window.addEventListener('arjs-video-loaded', function () { camera.send('STARTED'); });
    window.addEventListener('camera-error', function () { camera.send('BLOCKED'); });
    if (marker) {
      marker.addEventListener('markerFound', function () { tracking.send('FOUND'); });
      marker.addEventListener('markerLost', function () { tracking.send('LOST'); });
    }
  }

  var api = {
    debug: false,
    createMachine: createMachine,
    next: next,
    validate: validate,
    machines: machines,
    viewerLibraryFailed: viewerLibraryFailed,
    onViewerLibraryFailed: onViewerLibraryFailed,
    bindModelViewer: bindModelViewer,
    bindMarkerAR: bindMarkerAR
  };

  root.SiteState = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
