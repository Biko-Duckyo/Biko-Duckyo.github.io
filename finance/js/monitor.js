/* Read-only holding review. No thresholds, plans or transactions are written here. */
;(function(root){
 'use strict';
 function review(rows,snapshot,plans,asOf,cap=20){
  const total=rows.reduce((v,r)=>v+(Number.isFinite(r.value)&&r.value>0?r.value:0),0);
  return rows.map(r=>{
   const weight=total?r.value/total*100:0,issues=[],missing=[];
   const now=root.FundEvidence.day(asOf),date=root.FundEvidence.day(r.navDate);
   const stale=date===null||date>now||now-date>7*864e5;
   if(stale)missing.push('净值日期待核对');
   if(weight>cap)issues.push('占组合 '+weight.toFixed(1)+'%，超过 '+cap+'% 提醒线');
   let plan=null;
   if(plans[r.code]){try{plan=root.FundExitPlan.evaluate(r,plans[r.code],asOf);if(plan.triggered)issues.unshift(plan.status)}catch{missing.push('复核计划参数待核对')}}
   const f=snapshot?.funds?.[r.code],h=f?.holdings;
   const report=root.FundEvidence.day(h?.reportDate);
   if(!h||report===null||report>now||now-report>200*864e5)missing.push('持仓披露缺失或超期');
   const feeTime=Date.parse(f?.fees?.fetchedAt||'');
   if(!f?.fees||!Number.isFinite(feeTime)||feeTime>now+864e5||now-feeTime>7*864e5)missing.push('公开费率待更新');
   const status=stale?'数据不足':plan?.triggered?'触及复核线':weight>cap?'持仓集中':'暂需观察';
   return {row:r,weight,issues,missing,plan,status,priority:stale?3:plan?.triggered?4:weight>cap?2:1};
  }).sort((a,b)=>b.priority-a.priority||b.weight-a.weight);
 }
 root.FinanceMonitor={review};
 if(typeof document==='undefined')return;
 let mounted=false,snapshot=null,selected='',filter='all',loadState='公开披露加载中';
 const detailStates=new Map();
 const el=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money=n=>Number.isFinite(n)?'¥'+n.toLocaleString('zh-CN',{maximumFractionDigits:2}):'—';
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date());
 function mount(){
  const panel=document.querySelector('[data-fin-panel=diagnosis]');if(mounted||!panel)return;mounted=true;
  const domains=document.querySelector('.fin-domain-nav'),nav=document.querySelector('.fin-worknav');if(domains&&nav){const group=document.createElement('div');group.className='fin-monitor-navigation';domains.before(group);group.append(domains,nav)}
  const card=document.createElement('section');card.className='fin-card fin-monitor';card.setAttribute('aria-label','持仓监控');
  card.innerHTML='<div class="fin-section-head"><div><p class="bss-eyebrow">Holding monitor</p><h2>今天先看这些</h2></div><label>查看<select id="fin-monitor-filter"><option value="all">全部持仓</option><option value="review">需复核</option><option value="missing">资料待补</option></select></label></div><p class="fin-hint" id="fin-monitor-source"></p><div class="fin-monitor-layout"><div><div class="fin-monitor-list" id="fin-monitor-list" role="group" aria-label="选择持仓"></div></div><div id="fin-monitor-detail" aria-live="polite"></div></div>';
  panel.prepend(card);
  el('fin-monitor-filter').onchange=e=>{filter=e.target.value;render()};
  el('fin-monitor-list').onclick=e=>{const b=e.target.closest('[data-monitor-code]');if(b){selected=b.dataset.monitorCode;render()}};
  card.addEventListener('click',e=>{const b=e.target.closest('[data-monitor-view]');if(!b)return;document.querySelector('[data-fin-view="'+b.dataset.monitorView+'"]').click();const field=el(b.dataset.monitorView==='evidence'?'fin-fee-fund':'fin-exit-fund');if(field){field.value=selected;field.dispatchEvent(new Event('change'))}if(b.dataset.monitorView==='diagnosis'){el('fin-exit-result')?.closest('.fin-card').scrollIntoView({block:'center',behavior:'smooth'})}});
  el('fin-cap')?.addEventListener('input',render);
  document.addEventListener('finance:plans-updated',render);
  fetch('/finance/data/research/snapshot.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{snapshot=d;loadState='公开资料快照 '+(d.asOf||'日期未知');render()}).catch(()=>{loadState='公开资料暂不可用';render()});
 }
 function render(){mount();if(!mounted)return;const prior=el('fin-monitor-detail');if(prior?.dataset.code)detailStates.set(prior.dataset.code,Array.from(prior.querySelectorAll('details')).map(d=>d.open));let plans={};try{plans=JSON.parse(localStorage.getItem('finance-exit-plans:v1')||'{}')||{}}catch{}
  const cap=Number(el('fin-cap')?.value);if(!Number.isFinite(cap)||cap<5||cap>50){el('fin-monitor-source').textContent='单只提醒线请输入 5–50%；监控暂不判断。';el('fin-monitor-list').replaceChildren();el('fin-monitor-detail').textContent='输入有效提醒线后重新计算，旧判断已收起。';return}
  const all=review(FinanceStore.list(),snapshot,plans,today(),cap),items=all.filter(x=>filter==='all'||(filter==='review'?x.issues.length:x.missing.length));
  if(!items.some(x=>x.row.code===selected))selected=items[0]?.row.code||'';
  el('fin-monitor-source').textContent=all.length+' 只持仓 · '+all.filter(x=>x.issues.length).length+' 只需复核 · '+all.filter(x=>x.missing.length).length+' 只资料待核对';
  el('fin-monitor-list').innerHTML=items.map(x=>'<button type="button" data-monitor-code="'+esc(x.row.code)+'" aria-pressed="'+(selected===x.row.code)+'"><span><b>'+esc(x.row.name)+'</b><small>'+esc(x.row.code)+' · '+x.weight.toFixed(1)+'%</small></span><span class="fin-monitor-tag">'+x.status+'</span></button>').join('')||'<p class="fin-hint">当前筛选下没有持仓。</p>';
  const x=items.find(x=>x.row.code===selected),box=el('fin-monitor-detail');if(!x){box.textContent='选择持仓后查看复核依据。';return}
  const r=x.row,f=snapshot?.funds?.[r.code];
  const overlap=snapshot?.funds?root.FundEvidence.penetration(FinanceStore.list(),snapshot).securities.filter(v=>v.funds.length>1&&v.funds.some(y=>y.code===r.code)).slice(0,3):[];
  const overlapText=overlap.length?'披露样本中与其他基金共同持有：'+overlap.map(v=>v.name+'（'+v.funds.length+' 只）').join('、')+'。':'暂未发现可核对的共同披露证券；样本不足不代表没有重叠。';
  box.innerHTML='<h3>'+esc(r.name)+'</h3><div class="fin-monitor-numbers"><div><small>已公布市值</small><strong>'+money(r.value)+'</strong></div><div><small>账面收益率</small><strong>'+(Number.isFinite(r.profitRate)?r.profitRate.toFixed(2)+'%':'—')+'</strong></div></div><p class="fin-hint">净值日 '+esc(r.navDate||'未知')+' · '+(x.status==='数据不足'?'净值过期或无效，暂不判断盈亏复核线':r.navStale?'快照基准，待联网核对':'已读取净值')+'</p><div class="fin-monitor-actions"><button class="fin-btn" data-monitor-view="evidence">查穿透与费率</button><button class="fin-btn" data-monitor-view="diagnosis">查复核计划</button></div><details class="fin-monitor-reasons"><summary>复核依据与持仓关联</summary><h4>复核依据</h4><ul>'+(x.issues.length?x.issues:[x.status==='数据不足'?'净值日期待核对，暂不判断是否触及盈亏复核线。':x.plan?'未触及已设提醒线；继续按持有逻辑观察。':'未启用盈亏复核计划；当前仅检查集中度与资料。']).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><h4>披露持仓关联</h4><p>'+esc(overlapText)+'</p><h4>调整前补齐</h4><p>'+esc(x.missing.join('；')||'公开资料已获取，仍需核对实际交易批次。')+'</p><p class="fin-hint">份额确认日、支付宝实际费率未登记，暂不能计算实际赎回费用与可卖份额。</p></details><details><summary>数据与判断边界</summary><p>'+esc(loadState)+'</p><p>持仓报告期 '+esc(f?.holdings?.reportDate||'未获取')+'；费率采集 '+esc(f?.fees?.fetchedAt?.slice(0,10)||'未获取')+'。披露样本不代表当前全部持仓。</p><p>本区为规则复核，不生成 AI 买卖指令；盘中参考、热点和账面亏损均不单独作为加仓依据。</p></details>';
  box.dataset.code=r.code;box.querySelectorAll('details').forEach((d,i)=>{d.open=detailStates.get(r.code)?.[i]===true});
 }
 document.addEventListener('finance:updated',render);document.addEventListener('storage',e=>{if(e.key==='finance-exit-plans:v1')render()});render();
})(typeof window==='undefined'?globalThis:window);
