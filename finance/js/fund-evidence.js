/* Public disclosure evidence and local single-lot fee scenarios. */
;(function(root){
 'use strict';
 function day(iso){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return null;var t=Date.parse(iso+'T00:00:00Z');return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===iso?t:null}
 function months(iso,n){var d=new Date(day(iso)),target=d.getUTCMonth()+n,last=new Date(Date.UTC(d.getUTCFullYear(),target+1,0)).getUTCDate();return new Date(Date.UTC(d.getUTCFullYear(),target,Math.min(d.getUTCDate(),last))).toISOString().slice(0,10)}
 function rate(v){return /^\d+(?:\.\d+)?%$/.test(v||'')?Number(v.slice(0,-1))/100:null}
 function matches(text,days){
  if(!text)return true;
  var t=text.replace(/持有期限|持有时间|持有期/g,'t').replace(/[天日\s]/g,'').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/小于/g,'<').replace(/大于等于/g,'>=');
  if(/^<\d+$/.test(t))return days<Number(t.slice(1));
  var parts=t.match(/^(?:(\d+)(<=|<))?t(?:(<=|<|>=|>)(\d+))?$/);if(!parts)return null;
  if(parts[1]&&(parts[2]==='<='?days<Number(parts[1]):days<=Number(parts[1])))return false;
  if(parts[3]){var v=Number(parts[4]);return parts[3]==='<'?days<v:parts[3]==='<='?days<=v:parts[3]==='>'?days>v:days>=v}
  return true;
 }
 function feeScenario(fees,confirmed,asOf,amount){
  if(!fees||day(confirmed)===null||day(asOf)===null||day(confirmed)>day(asOf)||!Number.isFinite(amount)||amount<=0)throw Error('请填写有效的份额确认日与大于零的假设赎回金额');
  var days=Math.floor((day(asOf)-day(confirmed))/864e5),cycle=String(fees.cycle||''),m=cycle.match(/^(\d+)个月$/),unlock=m?months(confirmed,Number(m[1])):null;
  var bands=(fees.redemption||[]).filter(function(b){return matches(b.time,days)===true&&rate(b.rate)!==null});
  return {days:days,unlock:unlock,locked:!!unlock&&asOf<unlock,rate:bands.length===1?rate(bands[0].rate):null,fee:bands.length===1?amount*rate(bands[0].rate):null,amount:amount,cycleUnknown:!!cycle&&cycle!=='--'&&!m};
 }
 function penetration(rows,snapshot){
  var total=rows.reduce(function(s,r){return s+r.value},0),securities=new Map(),industries=new Map(),mapped=0,notes=[];
  rows.forEach(function(row){var h=snapshot.funds[row.code]?.holdings;if(!h||day(h.reportDate)===null){notes.push(row.name+'：披露日期缺失');return}var stale=Date.now()-day(h.reportDate)>200*864e5;
    var seen=new Set(),items=(h.items||[]).filter(function(x){if(seen.has(x.key))return false;seen.add(x.key);return Number.isFinite(x.weight)&&x.weight>0&&x.weight<=100});
    var sum=items.reduce(function(s,x){return s+x.weight},0);if(sum>105||stale){notes.push(row.name+'：'+(stale?'披露超期':'持仓合计异常')+'，不计入映射');return}
    items.forEach(function(x){var value=row.value*x.weight/100,m=securities.get(x.key)||{key:x.key,name:x.name||x.code,kind:x.kind,value:0,funds:[]};m.value+=value;m.funds.push({code:row.code,name:row.name,weight:x.weight,reportDate:h.reportDate});securities.set(x.key,m);mapped+=value;var k=x.industry&&x.industry!=='--'?x.industry:'行业未披露';industries.set(k,(industries.get(k)||0)+value)});
    if(h.motherCode)notes.push(row.name+'：母 ETF '+h.motherCode+' 的样本单独展示；联接投资比例未获取，不套用到组合');
  });
  return {coverage:total?mapped/total*100:0,unknown:total?Math.max(0,100-mapped/total*100):100,securities:Array.from(securities.values()).sort(function(a,b){return b.value-a.value}),industries:Array.from(industries.entries()).map(function(e){return {name:e[0],pct:total?e[1]/total*100:0}}).sort(function(a,b){return b.pct-a.pct}),notes:notes};
 }
 function eligible(f,maxDD){var m=f.metrics,t=m&&day(m.end),age=t===null?Infinity:Date.now()-t,feeAge=Date.now()-Date.parse(f.fees?.fetchedAt||'');return !!m&&m.threeYearCoverage&&!m.missing&&!m.anomalous&&m.maxDrawdown<=maxDD&&age>=-864e5&&age<10*864e5&&feeAge>=-864e5&&feeAge<7*864e5&&!!f.fees&&f.fees.buyStatus==='开放申购'}
 /* 只透传官方 R1–R5 风险等级；无官方字段返回 null，不按基金大类自行映射低/中/高。 */
 function riskLevel(f){var v=f&&f.riskLevel;return typeof v==='string'&&/^R[1-5]$/.test(v)?v:null}
 root.FundEvidence={day:day,rate:rate,matches:matches,feeScenario:feeScenario,penetration:penetration,eligible:eligible,riskLevel:riskLevel};
})(typeof window==='undefined'?globalThis:window);
