/*
  Part B gallery behaviour as explicit state machines (see site-state.js and AGENTS.md):
  model    loading -> ready | error (Retry button), or unavailable if the viewer library fails
  rotation spinning <-> paused (choosing an exercise always resumes spinning)
  The selected exercise is data, mirrored as data-selected-exercise on <html> and ?exercise= in the URL.
*/
(() => {
  const exercises={
    b1:{title:'B1 · Blender solar panel',description:'Solar panel exported from the supplied Blender project, with its frame, cells and support legs.',src:'lab-b1.glb',alt:'Solar panel with blue cells, metal frame and support legs',ar:'marker-ar.html?model=solar',page:'B1.html'},
    b2:{title:'B2 · Heart sticker',description:'A textured heart-shaped 3D model exported from the supplied Blender project. The image texture is embedded in the GLB.',src:'lab-b2.glb',alt:'Pink heart sticker with Sayang Selalu lettering',ar:'marker-ar.html?model=heart',page:'B2.html'},
    b3:{title:'B3 · Blender GLB model',description:'The supplied Blender model, displayed as a 3D preview here and fitted to the Hiro marker in Camera AR.',src:'lab-b3.glb',alt:'White cup model supplied for the Blender GLB exercise',ar:'marker-ar.html?model=lab-model',page:'B3.html'},
    b4:{title:'B4 · HTML solar structure',description:'The solar panel structure from the HTML exercise, including the base, supports, frame and solar-cell grid.',src:'lab-b4.glb',alt:'Blue solar panel structure with base and two support posts',ar:'B4.html',page:'B4.html'},
    b5:{title:'B5 · Interactive solar panel',description:'Preview the interactive solar structure. Open Camera AR for its size, rotation, tilt, movement and reset controls.',src:'lab-b5.glb',alt:'Solar panel assembly with twelve blue cells, tilted rails and a support base',ar:'B5.html',page:'B5.html'}
  };
  const model=SiteState.createMachine(SiteState.machines.model);
  const rotation=SiteState.createMachine(SiteState.machines.rotation);
  const viewer=document.getElementById('viewer'),buttons=[...document.querySelectorAll('[data-exercise]')];
  const loader=document.getElementById('loader'),status=document.getElementById('model-status'),retry=document.getElementById('retry');
  const rotate=document.getElementById('rotate');
  let selected='b1';

  // Everything the user sees about loading is derived from the model state here, in one place.
  model.subscribe((state,{detail})=>{
    const title=exercises[selected].title;
    retry.hidden=state!=='error';
    if(state==='loading'){loader.textContent='Loading 3D model…';status.textContent=detail&&detail.retry?'Retrying model…':'Loading '+title+'…';}
    else if(state==='ready'){loader.textContent='3D ready · drag to rotate';status.textContent=title+' ready. Drag to rotate; pinch or scroll to zoom.';}
    else if(state==='error'){loader.textContent='Model could not load';status.textContent='The model could not load. Check your connection, then retry.';}
    else {loader.textContent='3D viewer unavailable';status.textContent='The 3D viewer could not load. Check your connection, then reload the page.';}
  });
  rotation.subscribe(state=>{
    viewer.autoRotate=state==='spinning';
    rotate.textContent=state==='spinning'?'Pause rotation':'Resume rotation';
  });

  function select(key,updateURL=true){
    if(!exercises[key])key='b1';
    selected=key;const info=exercises[key];
    document.documentElement.dataset.selectedExercise=key;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.exercise===key)));
    document.getElementById('model-title').textContent=info.title;
    document.getElementById('model-description').textContent=info.description;
    document.getElementById('camera-ar-link').href=info.ar;
    const exerciseLink=document.getElementById('exercise-link');exerciseLink.href=info.page;exerciseLink.textContent='Open '+key.toUpperCase()+' exercise ↗';
    viewer.alt=info.alt;viewer.setAttribute('src',info.src);
    viewer.cameraOrbit='0deg 55deg auto';viewer.fieldOfView='auto';
    rotation.send('SPIN');
    model.send('LOAD',{key});
    if(updateURL){const url=new URL(location.href);url.searchParams.set('exercise',key);history.replaceState(null,'',url);}
  }

  // The library-failure hook works even if model-viewer never defines itself.
  SiteState.onViewerLibraryFailed(()=>model.send('LIBRARY_FAILED'));

  customElements.whenDefined('model-viewer').then(()=>{
    SiteState.bindModelViewer(viewer,model);
    buttons.forEach(b=>b.addEventListener('click',()=>{if(b.dataset.exercise!==selected)select(b.dataset.exercise);}));
    rotate.addEventListener('click',()=>rotation.send('TOGGLE'));
    document.getElementById('reset').addEventListener('click',()=>{viewer.cameraOrbit='0deg 55deg auto';viewer.fieldOfView='auto';viewer.jumpCameraToGoal();});
    retry.addEventListener('click',()=>{const url=new URL(exercises[selected].src,location.href);url.searchParams.set('retry',Date.now());viewer.src=url.href;model.send('LOAD',{key:selected,retry:true});});
    select(new URLSearchParams(location.search).get('exercise')||'b1',false);
  });
})();
