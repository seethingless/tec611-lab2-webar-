# AGENTS.md

Notes for anyone (human or AI agent) changing this site. It is a static GitHub Pages site: no build step, no package.json, every page is a plain HTML file served from the repository root.

## Pages

| Page | What it is | Library |
| --- | --- | --- |
| `index.html` | Part A gallery: Cyclops, chair, bookshelf. `?model=chair` selects a model. | model-viewer |
| `part-b.html` + `part-b.js` | Part B gallery: B1 to B5. `?exercise=b3` selects an exercise. | model-viewer |
| `lab3.html`, `sofa.html` | Single-model viewers with "Place in my room". `lab3.html` is the Lab 3 QR target, so keep its URL. | model-viewer |
| `B1.html`, `B2.html` | Single-model previews. | model-viewer |
| `marker-ar.html` | Hiro marker camera AR for every model. `?model=<key>` selects one. | A-Frame + AR.js |
| `A2.html`, `B3.html`, `B4.html`, `B5.html` | Lecturer's lab examples (Siti Sara Rais). `lab-support.js` adds the nav bar and status bar. Keep their scenes as supplied. | A-Frame + AR.js |
| `cone-ar.html`, `kitten-ar.html` | Kitten pattern-marker AR (`kitten.patt`). | A-Frame + AR.js |
| `*-marker.html`, `cone-lab.html`, `lab3-qr.html`, `lecturer-marker.html` | Static marker and link sheets. No script. | none |

## State machines

Page behaviour lives in small explicit state machines from `site-state.js`. A machine lists its states and the events each state accepts; anything else is ignored. Each machine mirrors itself onto `<html>` as `data-<id>-state`, so you can read a page's state from the DOM:

```js
document.documentElement.dataset   // { modelState: "ready", trackingState: "found", cameraState: "running", ... }
SiteState.debug = true             // log every transition in the console
```

| Machine | States | Events | Used on |
| --- | --- | --- | --- |
| `model` | `loading`, `ready`, `error`, `unavailable` (final) | `LOAD`, `LOADED`, `FAILED`, `LIBRARY_FAILED` | every page with a 3D model |
| `camera` | `starting`, `running`, `blocked`, `insecure`, `unsupported` (last three final) | `STARTED`, `BLOCKED`, `INSECURE`, `UNSUPPORTED` | AR.js pages |
| `tracking` | `searching`, `found` | `FOUND`, `LOST` | AR.js pages |
| `ar` (`arLaunch`) | `idle`, `unavailable`, `failed` | `REQUEST`, `UNAVAILABLE`, `FAILED`, `RESET` | `index.html`, `lab3.html`, `sofa.html` |
| `rotation` | `spinning`, `paused` | `TOGGLE`, `SPIN` | `index.html`, `part-b.html` |
| `test-cube` | `hidden`, `shown` | `TOGGLE` | `marker-ar.html` (defined inline) |

Selections are data, not machine states: `data-selected-model` (gallery and camera AR) and `data-selected-exercise` (Part B). B5's sliders and buttons use a reducer instead (`update(state, action)` then `render()`), and expose `data-scale`, `data-rotate`, `data-tilt` and `data-position` on `#controlPanel`.

## Rules that prevent the old bugs

1. **Derive every status message from machine state in one `render()` or `subscribe()` function.** Never write status text straight from an event handler. That is how a camera error used to be overwritten by a later "model ready" message.
2. **Ignore stale loads.** Switching models does not cancel the old download.
   - model-viewer still fires `load` for the cancelled URL. `SiteState.bindModelViewer` drops any `load` whose `event.detail.url` is not the current `viewer.src`.
   - A-Frame's `gltf-model` still finishes the old download and replaces the mesh. `fit-marker-model` in `marker-ar.html` only accepts the current component's model and puts the right mesh back.
3. **Final states stay final.** `unavailable` and the camera problems accept no events, so nothing can hide them.
4. **Load `site-state.js` before the page's own scripts**, and keep `onerror="SiteState.viewerLibraryFailed()"` on the model-viewer `<script type="module">` so a failed CDN download shows a message instead of "Loading…" forever.
5. Most files use CRLF line endings. Keep each file's existing endings so diffs stay small.

## Testing

- `node --test` runs `tests/site-state.test.js` (Node 18 or newer, no install). It checks every shared machine definition and the engine.
- In a browser, check the `data-*-state` attributes on `<html>` after each action. Camera pages need HTTPS (GitHub Pages) or `localhost`, and a Hiro or kitten marker.
- Useful edge cases: switch model while a big GLB (`models/cyclops.glb`, `sofa_final.glb`) is still loading; open a camera page over plain HTTP; deny camera permission; block `unpkg.com` to simulate a failed viewer library.
