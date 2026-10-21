/* Shared hosting, navigation, fitting, and camera feedback for the lab examples. */
(() => {
  if (window.AFRAME && !AFRAME.components['fit-lab-model']) {
    AFRAME.registerComponent('fit-lab-model', {
      init() {
        this.el.addEventListener('model-loaded', () => {
          const mesh = this.el.getObject3D('mesh');
          if (!mesh) return;
          const T = AFRAME.THREE;
          const local = mesh.clone(true);
          local.updateMatrixWorld(true);
          const bounds = new T.Box3().setFromObject(local);
          const size = bounds.getSize(new T.Vector3());
          const center = bounds.getCenter(new T.Vector3());
          if (bounds.isEmpty() || ![size.x,size.y,size.z].every(Number.isFinite)) return;
          const scale = Math.min(.45/Math.max(size.x,size.z,.001), .5/Math.max(size.y,.001), 6);
          this.el.object3D.scale.setScalar(scale);
          this.el.object3D.position.set(-center.x*scale, .025-bounds.min.y*scale, -center.z*scale);
        });
      }
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label','Lab navigation');
    nav.style.cssText='position:fixed;left:10px;right:10px;top:10px;z-index:10000;display:flex;flex-wrap:wrap;gap:12px;padding:10px;background:#171827ed;color:white;border-radius:10px;font:14px system-ui';
    for (const [label,href] of [[/^B[1-5]\.html$/i.test(location.pathname.split('/').pop())?'← Part B':'← Gallery',/^B[1-5]\.html$/i.test(location.pathname.split('/').pop())?'part-b.html':'index.html'],['A2','A2.html'],['B1','B1.html'],['B2','B2.html'],['B3','B3.html'],['B4','B4.html'],['B5','B5.html'],['Hiro marker','https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png']]) {
      const a = document.createElement('a');
      a.textContent=label; a.href=href; a.style.color='#ffbfdc';
      if (label==='Hiro marker') {a.target='_blank';a.rel='noopener';}
      nav.appendChild(a);
    }
    document.body.appendChild(nav);
    const instruction=document.querySelector('.instruction,#instruction');
    const placeInstructions=()=>{if(instruction) instruction.style.top=(nav.getBoundingClientRect().bottom+8)+'px';};
    placeInstructions(); window.addEventListener('resize',placeInstructions);
    const status=document.createElement('p');
    status.setAttribute('role','status'); status.id='lab-status';
    status.style.cssText='position:fixed;z-index:10000;bottom:8px;left:10px;right:10px;margin:0;padding:8px 12px;border-radius:8px;background:#171827e8;color:#fff;font:13px system-ui;pointer-events:none';
    document.body.appendChild(status);
    const controls=document.getElementById('controlPanel');
    if(controls) {controls.style.bottom='62px';controls.style.maxHeight='45vh';controls.style.overflowY='auto';}
    let tracking=false, ready=!document.querySelector('[gltf-model]'), cameraError='';
    const refresh=()=>status.textContent=cameraError || 'Tracking: '+(tracking?'FOUND':'waiting')+' · Model: '+(ready?'ready':'loading')+'. Point the camera at a Hiro marker.';
    const marker=document.querySelector('a-marker');
    marker?.addEventListener('markerFound',()=>{tracking=true;refresh();});
    marker?.addEventListener('markerLost',()=>{tracking=false;refresh();});
    document.querySelectorAll('[gltf-model]').forEach(el=>{
      el.addEventListener('model-loaded',()=>{ready=true;refresh();});
      el.addEventListener('model-error',()=>{cameraError='Model could not load. Check your connection and reload.';refresh();});
    });
    window.addEventListener('camera-error',()=>{cameraError='Camera unavailable. Allow camera access and open this HTTPS page in Chrome or Safari.';refresh();});
    if(!window.isSecureContext) cameraError='Camera AR requires HTTPS or localhost.';
    refresh();
  });
})();
