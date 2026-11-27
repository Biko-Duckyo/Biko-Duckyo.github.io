(() => {
 const init=()=>document.querySelectorAll('.contrast-timeline-shell').forEach(shell=>{
  if(shell.dataset.timelineReady)return;shell.dataset.timelineReady='true';
  const controls=shell.querySelector('.contrast-view-controls');if(!controls)return;controls.hidden=false;
  controls.addEventListener('click',event=>{const button=event.target.closest('[data-contrast-expand]');if(!button)return;const open=button.dataset.contrastExpand==='true';shell.querySelectorAll('.contrast-background').forEach(detail=>detail.open=open);shell.querySelector('.contrast-view-status').textContent=open?'全部背景已展开':'已切回摘要';});
 });
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 // Register once even if the article script is reloaded by PJAX.
 if(!window.__contrastTimelineInit){window.__contrastTimelineInit=init;document.addEventListener('pjax:complete',init);}
})();
