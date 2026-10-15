/* Loaded in the head: prevent ordinary writers from loading partial restored data. */
;(() => {
  'use strict'
  if(window.__NANALY_BACKUP_ENTRY__)return
  window.__NANALY_BACKUP_ENTRY__=true
  const destination='/backup/'
  const go=()=>window.location.assign(destination)
  try{
    if(localStorage.getItem('nanaly-backup-restore-v1')&&!/^\/backup\/(?:index\.html)?$/.test(location.pathname)){
      window.NANALY_BACKUP_PENDING=true
      document.documentElement.style.visibility='hidden'
      window.location.replace(destination+'?recovery=1')
      return
    }
  }catch(_){/* The backup page will explain denied storage on explicit use. */}
  const attach=()=>{
    const head=document.querySelector('.nanaly-head__actions')||document.querySelector('.nanaly-head')
    if(!head||head.querySelector('.nanaly-backup-entry'))return
    const button=document.createElement('button');button.type='button';button.className='nanaly-head__btn nanaly-backup-entry'
    button.textContent='备份';button.title='本机数据备份与恢复';button.setAttribute('aria-label','本机数据备份与恢复')
    button.addEventListener('click',()=>{
      if(window.NANALY?.chatState?.().busy||window.NANALY_AGENT?.activity?.().busy){window.alert('请先等当前任务结束或手动停止，再进入备份页。');return}
      go()
    });head.append(button)
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach()
  window.addEventListener('pjax:complete',attach)
  window.addEventListener('storage',event=>{
    if(event.key==='nanaly-backup-restore-v1'&&event.newValue&&!window.NANALY_BACKUP_PENDING){
      window.NANALY_BACKUP_PENDING=true;document.documentElement.style.visibility='hidden';window.location.replace(destination+'?recovery=1')
    }
  })
})()
