customElements.whenDefined('model-viewer').then(() => {
  const exercises={
    b1:{title:'B1 · Blender solar panel',description:'Solar panel exported from the supplied Blender project, with its frame, cells and support legs.',src:'lab-b1.glb',alt:'Solar panel with blue cells, metal frame and support legs',ar:'marker-ar.html?model=solar',page:'B1.html'},
    b2:{title:'B2 · Heart sticker',description:'A textured heart-shaped 3D model exported from the supplied Blender project. The image texture is embedded in the GLB.',src:'lab-b2.glb',alt:'Pink heart sticker with Sayang Selalu lettering',ar:'marker-ar.html?model=heart',page:'B2.html'},
    b3:{title:'B3 · Blender GLB model',description:'The supplied Blender model, displayed as a 3D preview here and fitted to the Hiro marker in Camera AR.',src:'lab-b3.glb',alt:'White cup model supplied for the Blender GLB exercise',ar:'marker-ar.html?model=lab-model',page:'B3.html'},
    b4:{title:'B4 · HTML solar structure',description:'The solar panel structure from the HTML exercise, including the base, supports, frame and solar-cell grid.',src:'lab-b4.glb',alt:'Blue solar panel structure with base and two support posts',ar:'B4.html',page:'B4.html'},
    b5:{title:'B5 · Interactive solar panel',description:'Preview the interactive solar structure. Open Camera AR for its size, rotation, tilt, movement and reset controls.',src:'lab-b5.glb',alt:'Solar panel assembly with twelve blue cells, tilted rails and a support base',ar:'B5.html',page:'B5.html'}
  };
  const viewer=document.getElementById('viewer'),buttons=[...document.querySelectorAll('[data-exercise]')];
  const loader=document.getElementById('loader'),status=document.getElementById('model-status'),retry=document.getElementById('retry');
  const rotate=document.getElementById('rotate');
  let selected='b1';
  function select(key,updateURL=true){
    if(!exercises[key])key='b1';
    selected=key;const info=exercises[key];
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.exercise===key)));
    document.getElementById('model-title').textContent=info.title;
    document.getElementById('model-description').textContent=info.description;
    document.getElementById('camera-ar-link').href=info.ar;
    const exerciseLink=document.getElementById('exercise-link');exerciseLink.href=info.page;exerciseLink.textContent='Open '+key.toUpperCase()+' exercise ↗';
    viewer.alt=info.alt;viewer.setAttribute('src',info.src);
    viewer.cameraOrbit='0deg 55deg auto';viewer.fieldOfView='auto';viewer.autoRotate=true;
    rotate.textContent='Pause rotation';retry.hidden=true;
    loader.textContent='Loading 3D model…';status.textContent='Loading '+info.title+'…';
    if(updateURL){const url=new URL(location.href);url.searchParams.set('exercise',key);history.replaceState(null,'',url);}
  }
  buttons.forEach(b=>b.addEventListener('click',()=>{if(b.dataset.exercise!==selected)select(b.dataset.exercise);}));
  rotate.addEventListener('click',()=>{viewer.autoRotate=!viewer.autoRotate;rotate.textContent=viewer.autoRotate?'Pause rotation':'Resume rotation';});
  document.getElementById('reset').addEventListener('click',()=>{viewer.cameraOrbit='0deg 55deg auto';viewer.fieldOfView='auto';viewer.jumpCameraToGoal();});
  viewer.addEventListener('load',()=>{loader.textContent='3D ready · drag to rotate';status.textContent=exercises[selected].title+' ready. Drag to rotate; pinch or scroll to zoom.';retry.hidden=true;});
  viewer.addEventListener('error',()=>{loader.textContent='Model could not load';status.textContent='The model could not load. Check your connection, then retry.';retry.hidden=false;});
  retry.addEventListener('click',()=>{const url=new URL(exercises[selected].src,location.href);url.searchParams.set('retry',Date.now());loader.textContent='Loading 3D model…';status.textContent='Retrying model…';retry.hidden=true;viewer.src=url.href;});
  select(new URLSearchParams(location.search).get('exercise')||'b1',false);
});
