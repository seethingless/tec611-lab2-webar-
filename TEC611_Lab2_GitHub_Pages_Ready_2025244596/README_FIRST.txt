TEC611 LAB 2 — WEBAR VIEWER

FILES
index.html                 Main interactive WebAR page
models/cyclops.glb         Original hand-painted Cyclops model
models/cyclops.usdz        iPhone AR version, with corrected texture mapping
models/chair.glb           Chair model
models/chair.usdz          Chair, converted for iPhone AR
models/bookshelf.glb       Bookshelf model
models/bookshelf.usdz      Bookshelf, converted for iPhone AR
_headers                   Netlify MIME-type configuration

PUBLISH YOUR WEBAR PAGE
1. Go to https://app.netlify.com/drop on a computer, or in a mobile browser with desktop-site mode if necessary.
2. Extract TEC611_Lab2_WebAR_2025244596.zip into a folder.
3. Drag the *folder* onto the Netlify Drop upload area. Netlify may also accept the ZIP file directly depending on the interface.
4. Wait until Netlify gives you a HTTPS *.netlify.app link.
5. Open that link in Safari on your iPhone.
6. Choose Cyclops, Chair, or Bookshelf. Tap "View in AR" and capture a screenshot.

The local index.html alone is not sufficient for reliable Apple Quick Look or Google Scene Viewer AR. Publish to HTTPS.
The original Cyclops model uses texture stickers. Its iPhone USDZ was tested by the student after a corrected conversion.
Chair/bookshelf USDZ packages were generated and validated structurally, but have NOT been tested in iPhone Quick Look.

IMPORTANT FOR LAB 2
The pre-lab asks for two 3D models + their AR views. This webpage helps demonstrate the WebAR task.
The Python-in-Blender 3D creation and Python 2D-to-3D conversion are separate tasks and are NOT completed by this website.
