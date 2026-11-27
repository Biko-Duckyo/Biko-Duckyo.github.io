;(function(){
 'use strict';var mounted=false,snapshot=null,fundCode='',sectorMode='存档快照',sectors=null;var E=window.FundEvidence;
 function el(id){return document.getElementById(id)}function esc(v){return String(v??'').replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
 function pct(v){return Number.isFinite(v)?v.toFixed(1)+'%':'—'}function money(v){return Number(v).toLocaleString('zh-CN',{maximumFractionDigits:2})}
 function date(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date())}
 function link(url,text){return '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(text)+' ↗</a>'}
 function mount(){
  if(mounted||!document.querySelector('.fin-worknav'))return;mounted=true;
  var nav=document.querySelector('.fin-worknav'),b=document.createElement('button');b.type='button';b.dataset.finView='evidence';b.textContent='穿透与费率';b.setAttribute('aria-pressed','false');nav.querySelector('[data-fin-view=market]').before(b);
  var panel=document.createElement('section');panel.className='fin-research-panel';panel.dataset.finPanel='evidence';panel.hidden=true;panel.innerHTML='<div class="fin-card"><h2>持仓穿透</h2><p class="fin-hint">按披露仓位映射市值，未知部分保留；非实时持仓。</p><div id="fin-penetration"></div></div><div class="fin-card"><h2>费率与持有期</h2><p class="fin-hint">标准费率 · 支付宝实际折扣待核对</p><label>基金<select id="fin-fee-fund"></select></label><div id="fin-fee-detail"></div><details><summary>单批次费率试算</summary><p class="fin-hint">输入假设确认日；分批买入需逐批核算。</p><form id="fin-fee-calculator" class="fin-paper-form"><label>份额确认日<input id="fin-fee-confirmed" type="date" required></label><label>假设赎回金额（元）<input id="fin-fee-amount" type="number" min="0.01" max="100000000" step="0.01" required></label><button class="fin-btn" type="submit">计算费用</button></form><p id="fin-fee-result" role="status"></p></details></div>';el('finMain').appendChild(panel);
  var decision=document.createElement('div');decision.className='fin-card';decision.innerHTML='<h2>加减仓复核</h2><p class="fin-hint">依据已保存的投资条件，不自动下单。</p><div id="fin-evidence-advice"></div>';document.querySelector('[data-fin-panel=diagnosis]').children[0].after(decision);
  var market=document.querySelector('[data-fin-panel=market]'),hot=document.createElement('div');hot.className='fin-card';hot.innerHTML='<div class="fin-section-head"><h2>行业与方向观察</h2><button class="fin-btn" id="fin-sector-refresh" type="button">刷新</button></div><p class="fin-hint">行情与资金分开看；ETF 代理不等于全行业排名。</p><div id="fin-sector-status" role="status"></div><div id="fin-sectors"></div>';market.prepend(hot);
  var screen=document.createElement('div');screen.className='fin-card';screen.innerHTML='<h2>筛选基金</h2><p id="fin-screen-source" class="fin-hint"></p><div class="fin-scenario-controls"><label>类别<select id="fin-screen-category"><option value="all">全部</option><option value="bond">偏债候选</option><option value="index">指数候选</option><option value="equity">偏股候选</option></select></label><label>历史回撤<select id="fin-screen-dd"><option value="10">不超过 10%</option><option value="15" selected>不超过 15%</option><option value="all">查看全部（含不达标）</option></select></label><label><input id="fin-screen-dedupe" type="checkbox" checked> 合并同名份额</label></div><p class="fin-hint">完整三年、数据有效、申购开放；通过筛选不等于适合购买。</p><div id="fin-candidate-results"></div>';hot.after(screen);
  el('fin-fee-fund').onchange=function(){fundCode=this.value;renderFee()};el('fin-fee-confirmed').max=date();
  el('fin-fee-calculator').onsubmit=function(e){e.preventDefault();try{var r=E.feeScenario(snapshot.funds[fundCode]?.fees,el('fin-fee-confirmed').value,date(),Number(el('fin-fee-amount').value));el('fin-fee-result').textContent='假设持有 '+r.days+' 天；'+(r.locked?'尚未达到 '+r.unlock+' 最短持有日，不能按零赎回费推断可赎回。':r.cycleUnknown?'最短持有期字段不能自动解析，请核对合同。':(r.unlock?'公开字段最短持有日 '+r.unlock+' 已达到，仍需核对开放日；':'公开接口未给最短持有期，请以合同为准；'))+(r.fee!==null?'该天数对应标准赎回费 '+pct(r.rate*100)+'，假设费用约 ¥'+money(r.fee)+'。':'该期限的费率无法可靠匹配，暂不计算金额。')+' 实际按每批份额与确认净值计算。'}catch(err){el('fin-fee-result').textContent=err.message}};
  ['fin-screen-category','fin-screen-dd','fin-screen-dedupe'].forEach(function(id){el(id).onchange=renderCandidates});
  el('fin-sector-refresh').onclick=async function(){this.disabled=true;el('fin-sector-status').textContent='正在读取公开行业行情…';try{var r=await fetch('/api/finance/sectors',{cache:'no-store'});if(!r.ok)throw Error();sectors=await r.json();sectorMode='接口返回（可能含 5 分钟缓存）';renderSectors()}catch(e){sectorMode='实时接口失败，沿用存档快照';renderSectors()}finally{this.disabled=false}};
  load();
 }
 async function load(){try{var r=await fetch('/finance/data/research/snapshot.json',{cache:'no-store'});if(!r.ok)throw Error();snapshot=await r.json();sectors=snapshot.sectors;render()}catch(e){['fin-penetration','fin-fee-detail','fin-evidence-advice','fin-sector-status','fin-candidate-results'].forEach(function(id){el(id).textContent='公开资料暂未加载，保留现有持仓，不生成新结论。'})}}
 function render(){if(!snapshot)return;var rows=FinanceStore.list();if(!fundCode)fundCode=rows.slice().sort(function(a,b){return b.value-a.value})[0]?.code||'';el('fin-fee-fund').innerHTML=rows.map(function(r){return '<option value="'+esc(r.code)+'">'+esc(r.name)+' · '+r.code+'</option>'}).join('');el('fin-fee-fund').value=fundCode;renderPenetration(rows);renderFee();renderAdvice(rows);renderSectors();renderCandidates()}
 function renderPenetration(rows){var p=E.penetration(rows,snapshot),periods=Array.from(new Set(rows.map(function(r){return snapshot.funds[r.code]?.holdings.reportDate}).filter(Boolean))).sort(),period=periods.length===1?periods[0]:'多个报告期';el('fin-penetration').innerHTML='<div class="fin-review-metrics"><div><span>披露样本映射覆盖</span><strong>'+pct(p.coverage)+'</strong></div><div><span>未穿透部分</span><strong>'+pct(p.unknown)+'</strong></div><div><span>披露报告期</span><strong>'+esc(period)+'</strong></div></div><h3>报告期样本中的行业映射（非实时仓位）</h3>'+p.industries.slice(0,8).map(function(x){return '<p>'+esc(x.name)+' · 组合映射占比 '+pct(x.pct)+'</p>'}).join('')+'<h3>共同持有的证券</h3>'+p.securities.filter(function(x){return x.funds.length>1}).slice(0,10).map(function(x){return '<article class="fin-watch-row"><div><b>'+esc(x.name)+'</b><small>'+x.funds.length+' 只基金共同披露 · 映射金额约 ¥'+money(x.value)+'</small></div><small>'+x.funds.map(function(f){return esc(f.name)+' '+pct(f.weight)+'（'+esc(f.reportDate)+'）'}).join('；')+'</small></article>'}).join('')+'<details><summary>逐只披露范围与母 ETF</summary>'+rows.map(function(row){var h=snapshot.funds[row.code]?.holdings;if(!h)return '<p>'+esc(row.name)+'：未获取</p>';return '<article class="fin-watch-row"><div><b>'+esc(row.name)+'</b><small>报告期 '+esc(h.reportDate||'未知')+' · 直接披露 '+h.items.length+' 项</small>'+link(h.source,'公开披露接口')+'</div><div>'+ (h.motherCode?'母 ETF '+esc(h.motherCode)+'，报告期 '+esc(h.mother?.reportDate||'未知')+'；联接实际比例未获取，因此不并入组合映射。母 ETF 样本：'+(h.mother?.items||[]).slice(0,5).map(function(x){return esc(x.name)+' '+pct(x.weight)}).join('；'):'')+'</div></article>'}).join('')+'<p class="fin-hint">'+p.notes.map(esc).join('；')+'</p></details>'}
 function renderFee(){
  var f=snapshot?.funds[fundCode],box=el('fin-fee-detail');el('fin-fee-result').textContent='';
  if(!f?.fees){box.textContent='费率未获取，暂不计算。';return}var x=f.fees;
  box.innerHTML='<div class="fin-fee-status"><span>'+esc(x.buyStatus||'申购状态未知')+'</span><span>'+esc(x.sellStatus||'赎回状态未知')+'</span><span>最短持有：'+esc(x.cycle&&x.cycle!=='--'?x.cycle:'未明确')+'</span></div><p class="fin-hint">管理 '+esc(x.management||'未知')+' · 托管 '+esc(x.custody||'未知')+' · 服务 '+esc(x.service||'未知')+' / 年</p><h3>标准赎回费</h3>'+(x.redemption||[]).map(function(t){return '<div class="fin-fee-band"><span>'+esc(t.time||'公开资料未分期限')+'</span><b>'+esc(t.rate)+'</b></div>'}).join('')+'<p class="fin-hint">零费率不代表已过最短持有期。</p><details class="fin-support"><summary>申购费与来源</summary>'+(x.subscription?.length?x.subscription.map(function(t){return '<p>'+esc(t.money||'全部金额')+'：'+esc(t.source||'标准费率未获取')+'</p>'}).join(''):'<p>公开接口未提供申购阶梯，请核对渠道。</p>')+'<p>更新 '+esc(x.fetchedAt.slice(0,10))+' · '+link(x.document,'费率资料')+' · '+link(x.source,'原始数据')+'</p><p>公开标准费率，不套用天天基金折扣。实际费用、限购、开放日和到账以支付宝及基金公告为准；运行费用通常已在净值中计提，不在赎回时重复扣取。</p></details>';
 }
 var ADVICE_TYPE={ 'stale-nav':'数据风险','concentration':'集中度','floating-loss':'账面浮亏','drawdown':'峰值回撤','estimate-weak':'弱参考','incomplete-weights':'口径不完整','data-insufficient':'资料待补','adjust-template':'调整模板' };
 function adviceProfile(){
  var raw={};try{raw=JSON.parse(localStorage.getItem('finance-risk-profile:v1')||'{}')}catch(e){}
  return { horizon:raw.term||null, drawdownTolerance:raw.drawdown==='5-10'?-10:raw.drawdown==='10-15'?-15:null, liquidityNeed:null, targetWeight:null, positionCap:null };
 }
 function adviceItem(a){
  var tag=ADVICE_TYPE[a.type]||a.type;
  var off=a.enabled===false?' <span class="fin-mute">未启用</span>':'';
  var ev=(a.evidence||[]).map(function(e){return esc(e.field)+'：'+(e.value==null?'未知':esc(e.value))+(e.date?' · '+esc(e.date):'')}).join('；');
  var head=(a.trigger||a.message||'');
  return '<article class="fin-watch-row"><div><b>'+esc(tag)+off+'</b><small>'+esc(head)+'</small></div><span class="fin-status-tag">'+(a.enabled===false?'未启用':esc(a.kind||''))+'</span>'+
   '<details class="fin-support"><summary>判断依据与边界</summary>'+
   '<p><b>口径：</b>'+esc(a.basis||'')+'</p>'+
   '<p><b>风险：</b>'+esc(a.risk||'')+'</p>'+
   '<p><b>解除条件：</b>'+esc(a.reverse||'')+'</p>'+
   '<p><b>失效条件：</b>'+esc(a.invalidation||'')+'</p>'+
   '<p class="fin-hint">数据时间 '+esc(a.dataTime||'未知')+(ev?' · 依据 '+ev:'')+'</p></details></article>';
 }
 function adviceGroup(title,list){
  if(!list||!list.length)return '';
  return '<h3>'+esc(title)+'</h3>'+list.map(adviceItem).join('');
 }
 function renderAdvice(rows){
  var summ=FinanceStore.summary();
  var weightOf=function(r){return summ.value>0?(r.value/summ.value*100):0};
  var adv=FinanceAdvisory.summarizeAdvisory(rows,{ weightOf:weightOf, complete:summ.complete, asOf:date(), profile:adviceProfile() });
  var html=adviceGroup('风险提醒',adv.risks)+adviceGroup('观察项',adv.observations)+adviceGroup('资料待核对',adv.insufficient)+adviceGroup('调整模板',adv.drafts);
  if(!html)html='<p class="fin-hint">当前口径下没有需要复核的风险提醒；观察项不构成买卖动作。</p>';
  html+='<p class="fin-hint">本区为规则复核，不生成自动交易；个人条件仅存于本机浏览器，不写入公开资料或归档。</p>';
  el('fin-evidence-advice').innerHTML=html;
 }
 function renderSectors(){
  if(!sectors)return;var a=sectors.items||[],times=a.map(function(x){return x.quoteTime}).filter(Number.isFinite),last=times.length?new Date(Math.max.apply(null,times)*1000).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}):'时间未知';
  el('fin-sector-status').textContent=(sectors.basis?'ETF代理 · 无资金数据':sectorMode)+' · '+last+' · '+a.length+' 项';
  el('fin-sectors').innerHTML=a.slice(0,12).map(function(x){return '<article class="fin-watch-row"><b>'+esc(x.name)+' · '+pct(x.change)+'</b><span>'+ (x.mainFlow===null?'资金未提供':'主力净额 '+money(x.mainFlow/1e8)+' 亿元')+'</span></article>'}).join('');
  var note=el('fin-sector-method');if(!note){note=document.createElement('details');note.id='fin-sector-method';note.className='fin-support';el('fin-sectors').after(note)}note.innerHTML='<summary>行情范围与来源</summary><p>'+esc(sectorMode)+' · '+esc(sectors.basis||'行业及细分板块涨幅样本')+' · '+a.length+'/'+(sectors.total||'未知')+' 项</p><p>行业与子行业可能重叠，不相加。主力净额为行情商订单分类估算，不是基金申购资金，不构成买入信号；ETF备用源缺少该字段。</p>'+link(sectors.source,'数据来源');
 }
 function renderCandidates(){if(!snapshot)return;var c=el('fin-screen-category').value,threshold=el('fin-screen-dd').value,max=threshold==='all'?Infinity:Number(threshold),dedupe=el('fin-screen-dedupe').checked;
  var a=Object.values(snapshot.funds).filter(function(f){return !f.held&&(c==='all'||f.category===c)&&(threshold==='all'||E.eligible(f,max))}).sort(function(a,b){return (a.metrics?.maxDrawdown??Infinity)-(b.metrics?.maxDrawdown??Infinity)}),seen=new Set();if(dedupe)a=a.filter(function(f){var k=f.name.replace(/[ACBE]$/,'');if(seen.has(k))return false;seen.add(k);return true});
  el('fin-screen-source').textContent='限定候选池 '+Object.values(snapshot.funds).filter(function(f){return !f.held}).length+' 只 · 符合 '+a.length+' 只 · 更新 '+snapshot.asOf;var method=el('fin-screen-method');if(!method){method=document.createElement('details');method.id='fin-screen-method';method.className='fin-support';el('fin-candidate-results').after(method)}method.innerHTML='<summary>筛选范围与来源</summary><p>'+esc(snapshot.universe)+'。排名入池有选择偏差，不代表全市场或最优。</p><p>还需核对支付宝可购性、实际费率及信用/利率风险。同名 A/C 等份额不构成额外分散。</p>';
  var rowsHtml=a.map(function(f){
    var m=f.metrics,x=f.fees,ok=E.eligible(f,15),rk=f.rank||{};
    var y1=Number.isFinite(Number(rk.return1y))?(rk.return1y>=0?'+':'')+Number(rk.return1y).toFixed(1)+'%':'—';
    var scale='';
    if(Number.isFinite(Number(rk.size))&&rk.size>0){scale=rk.size>=1e8?(rk.size/1e8).toFixed(1)+'亿':(rk.size/1e4).toFixed(0)+'万'}
    var period=m&&m.start?esc(m.start)+' ～ '+esc(m.end):'未知';
    var cover=m&&m.threeYearCoverage?'约三年完整样本':'三年样本不足';
    var foot='区间收益 '+pct(m?.returnPct)+' · 近1年 '+y1+(scale?' · 规模 '+scale:'')+' · '+(ok?'历史门槛通过':'未通过15%门槛');
    return '<article class="fin-watch-row"><div><b>'+esc(f.name)+' · '+f.code+'</b><small>'+period+' · '+cover+'</small>'+link('https://fundf10.eastmoney.com/'+f.code+'.html','基金资料')+'</div><div><b>历史最大回撤 '+pct(m?.maxDrawdown)+'</b><small>'+foot+'</small><details class="fin-support"><summary>费用</summary><p>管理 '+esc(x?.management||'未知')+' / 年；销售服务 '+esc(x?.service||'未知')+' / 年。实际渠道费率待核对。</p></details></div></article>';
  }).join('');
  el('fin-candidate-results').innerHTML=a.length?rowsHtml:'<p>此候选池没有符合全部条件的基金；不自动放宽风险门槛或填补结果。</p>';
 }
 document.addEventListener('finance:updated',function(){mount();if(snapshot)render()});document.addEventListener('finance:profile-updated',function(){if(snapshot)renderAdvice(FinanceStore.list())});mount();
})();
