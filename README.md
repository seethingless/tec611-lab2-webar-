# TEC611 Lab 2 — WebAR Gallery

Static WebAR gallery for three 3D models: Cone Head Cyclops, an armrest chair, and a bookshelf. The 3D previews use GLB models. On supported iPhones, the `View in AR` button uses the matching USDZ file with Apple Quick Look.

## GitHub Pages publishing

1. Create a **public** GitHub repository such as `tec611-lab2-webar`.
2. Upload the **contents of this folder** to the `main` branch, including `index.html`, `.nojekyll` and the `models` directory. Commit the files.
3. In the repository open **Settings > Pages**. Select **Deploy from a branch**, then branch **main**, folder **/(root)**, then **Save**.
4. Wait for the page build to finish. The repository's Pages settings will show the published URL (usually `https://USERNAME.github.io/tec611-lab2-webar/`).
5. Open the URL in Safari on an ARKit-compatible iPhone. Select a model, tap **View in AR**, and take screenshots for your TEC611 report.

The website must be served over HTTPS for browser-based AR features. Do not upload this ZIP as a single repository file; unpack it and upload the site files.

The included `_headers` file is for Netlify and is ignored by GitHub Pages. All the site assets are referenced by relative URLs, so the site works at a GitHub Pages project path.


## A2–B5 lab examples

The gallery links to the examples from Siti Sara Rais's Vibe Coder folder:

- `A2.html`: rotating red Hiro-marker cube.
- `B1.html`: solar-panel GLB exported from `panel_solar.blend`, with a 3D preview and Camera AR link.
- `B2.html`: textured heart GLB exported from `sticker.blend`, with its supplied texture embedded, plus preview and Camera AR.
- `B3.html`: the supplied `model.glb`, automatically fitted in marker-local coordinates.
- `B4.html`: solar-panel structure built with A-Frame primitives.
- `B5.html`: interactive solar-panel example with size, rotation, tilt, movement, and reset controls.

All site links are relative to the GitHub Pages project. The existing Cyclops, chair, and bookshelf gallery and marker AR remain available. Camera pages require HTTPS and camera permission; open the Hiro marker on another display or paper. Source examples are attributed to Siti Sara Rais; B1/B2 are exported from her supplied Blender files. No reports or Blender source files are published.
