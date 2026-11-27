;(function () {
  'use strict'
  const M=window.BikoSpinModel,V=window.BikoSpinVisuals,$=s=>document.querySelector(s)
  const params=new URLSearchParams(location.search)
  let storedTheme
  try { storedTheme=localStorage.getItem('theme');if(storedTheme?.startsWith('{'))storedTheme=JSON.parse(storedTheme).value } catch {}
  let s=M.state({topic:params.get('topic'),theme:params.get('theme')||storedTheme}), playing=false, visible=true, raf=0,last=0
  if(params.get('embed')==='1')document.body.classList.add('embedded')
  const explanations={
    moment:['磁矩来自内禀角动量。静磁场下低能态略多，产生沿场方向的净磁化；不是把每个核都完全排齐。','ΔE = ℏγB₀；P = tanh(ΔE / 2kT)','热平衡 ¹H、自旋 1/2、310 K 的简化模型；图中布居差夸大，仅旁侧 ppm 为按模型计算。'],
    precession:['绕静磁场进动时，磁化的大小和锥角可保持不变。观察它与“磁化恢复/衰减”的区别。','ω₀ = γB₀；f₀ = γB₀ / 2π','采用正旋磁比的 ¹H；转速按固定比例大幅慢放，屏幕秒数不是实际核进动时间。此模式不叠加弛豫。'],
    t1:['观察纵向分量回到平衡值。零起点在 1 T1 时恢复约 63%；反转起点在 1 T1 时并不是 63%。','Mz/M₀ = 1 + [Mz(0)/M₀ − 1]e^(−t/T1)','理想瞬时脉冲、单组分、固定平衡值的模型。初始条件会改变恢复曲线；T1 随样品和测量条件变化。'],
    t2:['在旋转坐标系中观察横向相干幅度缩短；1 T2 时剩约 37%。这里不额外叠加静态频差。','Mxy/Mxy(0) = e^(−t/T2)','宏观单指数模型，不模拟微观相互作用。静态场不均匀还可带来 T2* 失相；180° 不能恢复所有 T2 损失。']
  }
  function pause(){playing=false;cancelAnimationFrame(raf);raf=0;last=0;$('#play').textContent='播放演示'}
  function paint(announce=true){
    document.documentElement.dataset.theme=s.theme
    const svg=V.render(s)
    // Reframe the same drawing into two readable panels on narrow screens,
    // rather than shrinking 13px scientific labels down to 6px.
    if(innerWidth<=620){
      const crops={moment:['0 60 330 234','330 70 330 234'],precession:['0 46 330 244','330 70 330 200'],t1:['0 46 330 292','330 46 330 286'],t2:['0 46 330 258','330 46 330 286']}[s.topic]
      $('#visual').innerHTML='<p class="graphic-title">'+M.names[s.topic]+'</p>'+crops.map((crop,i)=>svg.replace('viewBox="0 0 660 368"','viewBox="'+crop+'"').replaceAll('spin-title','spin-title-'+i).replaceAll('spin-desc','spin-desc-'+i).replaceAll('id="blue"','id="blue-'+i+'"').replaceAll('id="orange"','id="orange-'+i+'"').replaceAll('url(#blue)','url(#blue-'+i+')').replaceAll('url(#orange)','url(#orange-'+i+')')).join('')
    }else $('#visual').innerHTML=svg
    $('#time').value=Math.round(s.u*100);$('#time').disabled=s.topic==='moment';$('#play').disabled=s.topic==='moment'
    $('#time-label').value=s.topic==='precession'?`${(4*s.u).toFixed(1)} 演示秒`:`${Math.round(s.u*s.tau)} ms`
    $('#field-label').value=s.b0.toFixed(1)+' T';$('#angle-label').value=s.angle+'°';$('#tau-label').value=s.tau+' ms';$('#tau-name').textContent='时间常数 '+(s.topic==='t2'?'T2':'T1')
    for(const el of document.querySelectorAll('[data-for]'))el.hidden=!el.dataset.for.split(' ').includes(s.topic)
    for(const el of document.querySelectorAll('[data-topic]'))el.setAttribute('aria-pressed',String(el.dataset.topic===s.topic))
    const [text,formula,boundary]=explanations[s.topic];$('#explanation').textContent=text;$('#formula').textContent=formula;$('#boundary').textContent=boundary
    $('#article-link').href=s.topic==='moment'||s.topic==='precession'?'/2026/10/31/NMR-01-原子核自旋与静磁场基础/':'/2026/10/31/NMR-02-共振激发射频脉冲与弛豫/'
    if(announce){$('#reading').textContent=s.topic==='moment'?`计算布居极化：${(M.polarization(s.b0)*1e6).toFixed(2)} ppm（310 K）`:s.topic==='precession'?`真实频率 ${M.frequencyMHz(s.b0).toFixed(2)} MHz；画面为慢放`:`t / ${s.topic==='t1'?'T1':'T2'} = ${s.u.toFixed(2)}；归一化幅度 ${(s.topic==='t1'?M.recovery(s.u,s.initial):M.transverse(s.u)).toFixed(3)}`}
  }
  function tick(now){if(!playing||!visible||document.hidden)return pause();if(last)s.u=Math.min(5,s.u+(now-last)/1000*.35);last=now;paint(false);if(s.u>=5){pause();paint();return}raf=requestAnimationFrame(tick)}
  $('#play').onclick=()=>{if(playing){pause();paint();return}if(s.u>=5)s.u=0;playing=true;$('#play').textContent='暂停演示';raf=requestAnimationFrame(tick)}
  $('#reset').onclick=()=>{pause();s.u=0;paint()}
  $('#time').oninput=e=>{pause();s.u=Number(e.target.value)/100;paint()}
  $('#one-tau').onclick=()=>{pause();s.u=1;paint()}
  for(const [id,key]of[['field','b0'],['angle','angle'],['tau','tau'],['initial','initial']])$('#'+id).addEventListener('input',e=>{pause();s=M.state({...s,[key]:Number(e.target.value),u:0});paint()})
  for(const el of document.querySelectorAll('[data-topic]'))el.onclick=()=>{pause();s=M.state({...s,topic:el.dataset.topic,u:0});params.set('topic',s.topic);history.replaceState(null,'',location.pathname+'?'+params.toString());paint()}
  $('#save').onclick=()=>{const svg=V.render(s).replace('<desc id="spin-desc">',`<desc id="spin-desc">B0=${s.b0} T; tau=${s.tau} ms; initial=${s.initial}; t/tau=${s.u}; `);const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`biko-${s.topic}-${Math.round(s.u*100)}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()})
  window.addEventListener('pagehide',pause)
  window.addEventListener('resize',()=>paint(false))
  window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='biko-tools:theme'){s.theme=e.data.theme==='dark'?'dark':'light';paint()}if(e.data?.type==='biko-tools:visibility'){visible=e.data.visible===true;if(!visible)pause()}})
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&parent!==window)parent.postMessage({type:'biko-tools:escape'},location.origin)})
  paint()
  if(params.get('embed')==='1'&&parent!==window&&typeof ResizeObserver==='function'){
    new ResizeObserver(()=>parent.postMessage({type:'biko-science:height',height:Math.ceil(document.body.scrollHeight)},location.origin)).observe(document.body)
  }
})()
