/* User-defined review thresholds; no order submission or holdings mutation. */
;(function(root){
 'use strict';
 function evaluate(row,plan,asOf){
  const fields=['loss','profit','trail','portion'];if(!plan||!fields.every(k=>Number.isFinite(plan[k])&&plan[k]>0&&plan[k]<=100)||!row||!Number.isFinite(row.nav)||row.nav<=0||!Number.isFinite(row.value)||row.value<0||!Number.isFinite(row.cost)||row.cost<=0)throw Error('计划或持仓参数无效');
  const date=Date.parse(row.navDate+'T00:00:00Z'),now=Date.parse(asOf+'T00:00:00Z');
  if(!Number.isFinite(date)||!Number.isFinite(now)||now-date>7*864e5||date>now) return {status:'净值待核对',triggered:false,stale:true};
  const peak=Math.max(plan.peak||row.nav,row.nav),drawdown=(1-row.nav/peak)*100,pnl=(row.value/row.cost-1)*100,armed=!!plan.armed||pnl>=plan.profit;
  const reason=pnl<=-plan.loss?'止损复核':armed&&drawdown>=plan.trail?'回撤止盈复核':pnl>=plan.profit?'分批止盈复核':'继续观察';
  return {status:reason,triggered:reason!=='继续观察',pnl,drawdown,peak,armed,scenarioAmount:row.value*plan.portion/100};
 }
 root.FundExitPlan={evaluate};
})(typeof window==='undefined'?globalThis:window);
