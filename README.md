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
