/* One authenticated library, two presentations. The iframe never receives credentials. */
;(function(){
 'use strict';
 window.BikoAnimeCinema={create(hooks){
  const page=document.querySelector('.anime-page');if(!page)return;
  const button=document.createElement('button');button.type='button';button.className='anime-cinema-launch';button.textContent='影院视图 ↗';button.title='以球面海报墙浏览全部动漫';page.querySelector('.anime-toolbar-row').append(button);
  const dialog=document.createElement('dialog');dialog.className='anime-cinema-shell';dialog.setAttribute('aria-label','追番影院视图');
  const bar=document.createElement('div');bar.className='anime-cinema-bar';const back=document.createElement('button');back.type='button';back.textContent='← 返回追番';const label=document.createElement('span');label.textContent='影院视图 · 全部动漫';bar.append(back,label);
  const frame=document.createElement('iframe');frame.title='全部动漫 · 球面海报墙';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups');dialog.append(bar,frame);page.append(dialog);
  let ready=false,opened=false,focus=null,disposed=false,oldOverflow='';
  const rows=()=>Array.from(new Map(hooks.rows().map(r=>[String(r.id),r])).values());
  function update(){if(!opened||!ready)return;frame.contentWindow.postMessage({type:'anime-cinema:library',items:rows().map(r=>({id:String(r.id),title:r.name_cn||r.name,original:r.name,year:r.year,studio:r.studio,genres:r.genres||[],summary:r.summary,status:r.status,watched:r.epsWatched,total:r.eps,image:r.images?.large||'',covers:r.coverList||[],score:r.score}))},location.origin)}
  function close(){if(!opened)return;opened=false;frame.contentWindow?.postMessage({type:'anime-cinema:suspend'},location.origin);dialog.close();document.documentElement.style.overflow=oldOverflow;focus?.isConnected&&focus.focus({preventScroll:true})}
  function open(){if(disposed||!hooks.unlocked())return;focus=document.activeElement;oldOverflow=document.documentElement.style.overflow;opened=true;dialog.showModal();document.documentElement.style.overflow='hidden';if(!frame.getAttribute('src'))frame.src='/anime/cinema/';else update();back.focus()}
  function receive(e){if(e.origin!==location.origin||e.source!==frame.contentWindow||!opened)return;const d=e.data;if(d?.type==='anime-cinema:ready'){ready=true;update()}else if(d?.type==='anime-cinema:close')close();else if(d?.type==='anime-cinema:edit'&&rows().some(r=>String(r.id)===String(d.id))){close();hooks.open(d.id)}}
  button.onclick=open;back.onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close()});window.addEventListener('message',receive);
  const observer=new MutationObserver(()=>{if(!page.isConnected)dispose()});observer.observe(document.body,{childList:true,subtree:true});
  function dispose(){if(disposed)return;close();disposed=true;window.removeEventListener('message',receive);observer.disconnect();frame.src='about:blank'}
  return {update,close,dispose};
 }};
})();
