// Non-module watchdog: give a helpful error rather than an endless loading spinner.
window.addEventListener('load',()=>{
  setTimeout(()=>{
    if(window.GGV_THREE_STARTED)return;
    const loading=document.querySelector('#loading');
    if(loading){loading.style.display='block';loading.innerHTML='3D engine could not load. Check your connection or browser settings.<small>Try Chrome or Edge, then reload. You can still use the official campus map link below.</small>';}
    const status=document.querySelector('#base-map-status');
    if(status)status.textContent='3D engine unavailable — external library could not load';
  },12000);
});
