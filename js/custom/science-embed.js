;(function () {
  'use strict'
  if(window.BikoScienceEmbeds)return
  window.BikoScienceEmbeds=true
  const topics=new Set(['moment','precession','t1','t2'])
  function sync(details){
    const topic=details.dataset.scienceDemo;if(!topics.has(topic))return
    let frame=details.querySelector('iframe')
    const theme=document.documentElement.dataset.theme==='dark'?'dark':'light'
    if(details.open&&!frame){
      frame=document.createElement('iframe');frame.title=details.querySelector('summary').textContent;frame.src=`/tools/apps/science/?embed=1&topic=${topic}&theme=${theme}`
      frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-downloads allow-popups');frame.referrerPolicy='same-origin'
      frame.addEventListener('load',()=>sync(details));details.querySelector('.science-demo-stage').append(frame)
    }
    if(frame){frame.contentWindow.postMessage({type:'biko-tools:visibility',visible:details.open},location.origin);frame.contentWindow.postMessage({type:'biko-tools:theme',theme},location.origin)}
  }
  document.addEventListener('toggle',e=>{if(e.target.matches?.('details[data-science-demo]'))sync(e.target)},true)
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin)return
    const frame=Array.from(document.querySelectorAll('.science-demo iframe')).find(f=>f.contentWindow===e.source);if(!frame)return
    if(e.data?.type==='biko-science:height'&&Number.isFinite(e.data.height))frame.style.height=Math.max(400,Math.min(2200,e.data.height+4))+'px'
    if(e.data?.type==='biko-tools:escape'){const details=frame.closest('details');details.open=false;sync(details);details.querySelector('summary').focus()}
  })
  document.addEventListener('pjax:send',()=>{for(const d of document.querySelectorAll('details[data-science-demo]'))if(d.open){d.open=false;sync(d)}})
  new MutationObserver(()=>{for(const d of document.querySelectorAll('details[data-science-demo]'))sync(d)}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']})
})()
