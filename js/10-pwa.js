/* ---------- pwa: offline play + install (no-op on file://) ---------- */
if(('serviceWorker'in navigator)&&(location.protocol=='http:'||location.protocol=='https:'))try{navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}
/* ---------- install button: menu me hamesha visible; prompt jab browser de to seedha ---------- */
(function(){
  const btn=document.getElementById('mIns');if(!btn)return;
  const st=typeof matchMedia==='function'&&matchMedia('(display-mode: standalone)').matches;
  if(st||navigator.standalone===true){btn.style.display='none';return} /* pehle se app roop me chal raha */
  const iOS=/iP(hone|ad|od)/.test(navigator.userAgent)&&!!navigator.maxTouchPoints;
  const http=(location.protocol=='http:'||location.protocol=='https:');
  let dp=null;
  btn.textContent=iOS?'Add to Home Screen':'Install · offline';
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});
  window.addEventListener('appinstalled',()=>{dp=null;btn.style.display='none';if(window.toast)try{toast('Installed — chess plays offline!')}catch(e){}});
  btn.addEventListener('click',async()=>{
    if(dp){try{await dp.prompt();const r=await dp.userChoice;if(r&&r.outcome==='accepted')btn.style.display='none'}catch(e){}dp=null;return}
    /* jab native prompt na mile: instructions toast */
    try{if(window.toast)toast(iOS?'Share menu → Add to Home Screen':(http?'Browser menu → Install app':'Double-click se offline chalta hai'))}catch(e){}
  });
})();
