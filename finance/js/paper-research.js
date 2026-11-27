/* Original implementation inspired by reproducible research / risk-gate patterns.
 * No upstream project code, LLM calls, broker connections or live execution. */
;(function(root){
 'use strict';var P=root.FinancePaper,VERSION='a-share-research-v2';
 function assess(s,o){
  var validPrice=Number.isFinite(Number(o.price))&&Number(o.price)>0;
  var projected=s.cash+Object.entries(s.positions).reduce(function(v,e){return v+e[1].qty*(e[0]===o.sym&&validPrice?Number(o.price):(s.marks[e[0]]||e[1].last))},0),peak=Math.max(s.peakEquity||s.initial,projected),dd=peak>0?(1-projected/peak)*100:0,dayStart=s.dayStartEquity||s.initial,loss=dayStart>0?(1-projected/dayStart)*100:0;
  var buyCount=s.trades.filter(function(t){return t.day===s.day&&t.side==='buy'}).length,checks=[{name:'账户隔离',ok:true,reason:'只操作独立模拟账本'},{name:'回撤约束',ok:o.side!=='buy'||dd<15,reason:'情景回撤 '+dd.toFixed(2)+'%，达到 15% 时阻止新增买入，保留减仓通道'},{name:'日内风险约束',ok:o.side!=='buy'||loss<2,reason:'模拟日损失 '+loss.toFixed(2)+'%，达到 2% 时阻止新增买入'},{name:'买入频率',ok:o.side!=='buy'||buyCount<6,reason:'当日已记录 '+buyCount+' 笔买入，最多 6 笔；卖出不因此受限'}];
  try{P.trade(s,o);checks.push({name:'底仓、资金与仓位',ok:true,reason:'通过 T+1、现金、整手、单只20%、总仓50%、最多3只校验'})}catch(e){checks.push({name:'底仓、资金与仓位',ok:false,reason:e.message})}
  return {allowed:checks.every(function(c){return c.ok}),checks:checks,projectedEquity:projected,drawdown:dd,policyVersion:VERSION};
 }
 function execute(s,o){
  if(!o.id||!/^[-\w]{8,100}$/.test(o.id))throw Error('模拟订单缺少唯一编号');
  if((s.audit||[]).some(function(x){return x.id===o.id}))return {state:s,accepted:false,reason:'该模拟订单已处理，没有重复记账',duplicate:true};
  var gate=assess(s,o),next=JSON.parse(JSON.stringify(s)),reason=gate.checks.filter(function(c){return !c.ok}).map(function(c){return c.reason}).join('；');
  if(gate.allowed)next=P.trade(s,o);
  next.peakEquity=gate.allowed?Math.max(s.peakEquity||s.initial,P.value(next)):s.peakEquity||s.initial;
  next.audit=(s.audit||[]).concat([{id:o.id,day:s.day,order:{sym:o.sym,side:o.side,price:Number(o.price),qty:Number(o.qty)},accepted:gate.allowed,reason:reason||'通过规则检查，按输入情景价模拟记账',checks:gate.checks,policyVersion:VERSION}]).slice(-1000);
  return {state:next,accepted:gate.allowed,reason:reason,checks:gate.checks};
 }
 function validate(bars){
  if(!Array.isArray(bars)||bars.length<120)throw Error('历史日线不足 120 条');var prev='';
  bars.forEach(function(b){if(!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||b.date<=prev||![b.open,b.close,b.high,b.low,b.volume].every(Number.isFinite)||b.open<=0||b.close<=0||b.low<=0||b.high<Math.max(b.open,b.close)||b.low>Math.min(b.open,b.close)||b.volume<0)throw Error('历史日期、OHLC 或成交量无效');prev=b.date});return bars;
 }
 function run(bars,start,end,strategy,slippage){
  var initial=100000,cash=initial,qty=0,bought=-1,trades=0,skipped=0,peak=initial,dd=0,curve=[],totalFees=0;
  for(var i=start;i<end;i++){
   var prior=bars.slice(i-60,i),ma20=prior.slice(-20).reduce(function(s,b){return s+(b.signalClose||b.close)},0)/20,ma60=prior.reduce(function(s,b){return s+(b.signalClose||b.close)},0)/60,signal=strategy==='hold'||ma20>ma60,b=bars[i],equity=cash+qty*b.open,priorClose=bars[i-1].close;
   var buyLimit=priorClose*1.1,sellLimit=priorClose*.9;
   if(signal&&!qty){if(b.volume<=0||b.open>=buyLimit-.005)skipped++;else{var price=Math.round(b.open*(1+slippage)*100)/100,n=Math.floor(equity*.2/price/100)*100,fees=P.fees(n*price,'buy');if(n>0&&n*price+fees<=cash){cash-=n*price+fees;qty=n;bought=i;trades++;totalFees+=fees}}}
   else if(!signal&&qty&&i>bought){if(b.volume<=0||b.open<=sellLimit+.005)skipped++;else{var price=Math.round(b.open*(1-slippage)*100)/100,fees=P.fees(qty*price,'sell');cash+=qty*price-fees;qty=0;trades++;totalFees+=fees}}
   var value=cash+qty*b.close;peak=Math.max(peak,value);dd=Math.max(dd,1-value/peak);curve.push({date:b.date,equity:value});
  }
  return {start:bars[start].date,end:bars[end-1].date,returnPct:(curve.at(-1).equity/initial-1)*100,maxDrawdown:dd*100,trades:trades,skipped:skipped,fees:totalFees,curve:curve};
 }
 function compare(input,opts){
  var bars=validate(input),slip=opts?.slippage??.0005;if(!Number.isFinite(slip)||slip<0||slip>.02)throw Error('滑点应在 0–2% 之间');
  var split=Math.floor(bars.length*.7),actions=0,missing=0;
  bars.forEach(function(b,i){if(!Number.isFinite(b.signalClose)||b.signalClose<=0)missing++;if(b.signalClose&&Math.abs(b.signalClose/b.close-1)>.001)actions++});
  return {version:VERSION,slippage:slip,splitDate:bars[split].date,sampleStart:bars[0].date,sampleEnd:bars.at(-1).date,sampleCount:bars.length,adjustedPriceDifferences:actions,missingSignals:missing,development:{trend:run(bars,60,split,'trend',slip),hold:run(bars,60,split,'hold',slip)},validation:{trend:run(bars,split,bars.length,'trend',slip),hold:run(bars,split,bars.length,'hold',slip)},qualified:false,limitations:['样本不足三年长期验证；留出区间只是独立历史分段，未证明未来有效','未复权价格路径未处理分红送转；复权收盘仅形成趋势信号，收益不等于含分红总收益','普通主板10%价格限制为近似保守过滤；缺少逐笔盘口、完整停牌与除权参考价，不保证成交','固定 MA20/60，20%单标的初始预算，其余现金零收益；没有优化出最佳参数','日线不能验证盘中先后顺序，不把该结果用于证明做T有效']};
 }
 root.PaperResearch={assess:assess,execute:execute,compare:compare,version:VERSION};
})(typeof window==='undefined'?globalThis:window);
