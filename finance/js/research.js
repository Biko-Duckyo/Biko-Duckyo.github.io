/* Local, explainable scenario calculations. Never modifies the real ledger. */
;(function(root){
  'use strict';
  function number(v){return typeof v==='number'&&Number.isFinite(v)}
  function history(points){
    var seen=new Map();(points||[]).forEach(function(p){if(/^\d{4}-\d{2}-\d{2}$/.test(p.d)&&number(p.nav)&&p.nav>0)seen.set(p.d,p)});
    var a=Array.from(seen.values()).sort(function(x,y){return x.d.localeCompare(y.d)}).slice(-253);
    if(a.length<21)return null;
    var peak=a[0].nav,dd=0,rs=[];
    a.forEach(function(p,i){peak=Math.max(peak,p.nav);dd=Math.min(dd,p.nav/peak-1);if(i)rs.push(Math.log(p.nav/a[i-1].nav))});
    var mean=rs.reduce(function(s,x){return s+x},0)/rs.length;
    return {start:a[0].d,end:a.at(-1).d,count:a.length,returnPct:(a.at(-1).nav/a[0].nav-1)*100,monthPct:(a.at(-1).nav/a.at(-21).nav-1)*100,maxDrawdown:Math.abs(dd)*100,volatility:Math.sqrt(rs.reduce(function(s,x){return s+(x-mean)**2},0)/Math.max(1,rs.length-1)*252)*100};
  }
  function portfolio(rows,opts){
    opts=opts||{};var cap=Number(opts.cap)||20,total=rows.reduce(function(s,r){return s+r.value},0),cost=rows.reduce(function(s,r){return s+r.cost},0);
    var out=rows.map(function(r){var weight=total?r.value/total*100:0;return Object.assign({},r,{weight:weight,excess:Math.max(0,r.value-total*cap/100),recovery:r.value>0&&r.cost>r.value?(r.cost/r.value-1)*100:0})}).sort(function(a,b){return b.value-a.value});
    return {value:total,cost:cost,recovery:total>0&&cost>total?(cost/total-1)*100:0,rows:out,top3:out.slice(0,3).reduce(function(s,r){return s+r.weight},0),equityWeight:out.filter(function(r){return ['equity','index','qdii'].includes(r.category)}).reduce(function(s,r){return s+r.weight},0)};
  }
  function lossScenario(value,cost,extra,fall){
    if(![value,cost,extra,fall].every(number)||value<0||cost<0||extra<0||fall<0||fall>100)throw Error('情景参数无效');
    return {holdLoss:value*fall/100,addLoss:(value+extra)*fall/100,reduceLoss:value*0.8*fall/100,addRecovery:value+extra>0?Math.max(0,(cost+extra)/(value+extra)-1)*100:0};
  }
  // Signal is formed with previous closes; execution is next available NAV.
  // Unit NAV only: cash dividends, subscription/redemption restrictions are absent.
  function backtest(points,fee){
    var a=(points||[]).filter(function(p){return number(p.nav)&&p.nav>0}).slice().sort(function(x,y){return x.d.localeCompare(y.d)});
    if(a.length<81)return null;fee=fee===undefined?0.0015:fee;if(!number(fee)||fee<0||fee>0.05)throw Error('费用无效');
    var start=60,initial=10000,cash=initial,units=0,turns=0,peak=initial,dd=0;
    for(var i=start;i<a.length;i++){
      var ma20=a.slice(i-20,i).reduce(function(s,p){return s+p.nav},0)/20,ma60=a.slice(i-60,i).reduce(function(s,p){return s+p.nav},0)/60;
      var signal=ma20>ma60;
      if(signal&&!units){units=cash*(1-fee)/a[i].nav;cash=0;turns++}
      else if(!signal&&units){cash=units*a[i].nav*(1-fee);units=0;turns++}
      var equity=cash+units*a[i].nav;peak=Math.max(peak,equity);dd=Math.min(dd,equity/peak-1);
    }
    var last=a.at(-1).nav,holdUnits=initial*(1-fee)/a[start].nav,holdPeak=initial,holdDD=0;
    a.slice(start).forEach(function(p){var v=holdUnits*p.nav;holdPeak=Math.max(holdPeak,v);holdDD=Math.min(holdDD,v/holdPeak-1)});
    return {start:a[start].d,end:a.at(-1).d,trendReturn:(cash+units*last)/initial*100-100,holdReturn:holdUnits*last/initial*100-100,trendDD:Math.abs(dd)*100,holdDD:Math.abs(holdDD)*100,turns:turns,fee:fee};
  }
  root.FinanceResearch={history:history,portfolio:portfolio,lossScenario:lossScenario,backtest:backtest};
})(typeof window==='undefined'?globalThis:window);
