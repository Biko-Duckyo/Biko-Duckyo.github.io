/* Explicit-price sandbox, not a live exchange simulator or brokerage connector. */
;(function(root){
 'use strict';
 var universe=[['sh600036','招商银行','银行'],['sz000333','美的集团','家电'],['sh600941','中国移动','通信'],['sh600900','长江电力','公用事业'],['sh600887','伊利股份','消费'],['sh600030','中信证券','证券']];
 function fresh(){return {v:1,initial:100000,cash:100000,day:1,positions:{},trades:[],marks:{}}}
 function round(x){return Math.round((x+Number.EPSILON)*100)/100}
 function fees(gross,side){return round(Math.max(5,gross*0.0003)+gross*0.00001+(side==='sell'?gross*0.0005:0))}
 function value(s){return s.cash+Object.entries(s.positions).reduce(function(v,e){return v+e[1].qty*(s.marks[e[0]]||e[1].last)},0)}
 function trade(input,order){
  var s=JSON.parse(JSON.stringify(input)),sym=order.sym,q=Number(order.qty),p=Number(order.price),side=order.side;
  // 准入只校验代码格式与方向；观察池成员由上层引擎/自选清单控制，账本不再固定写死六只。
  if(!/^(sh|sz)\d{6}$/.test(sym)||!['buy','sell'].includes(side))throw Error('请选择合法的沪深 A 股代码和买卖方向');
  if(!Number.isInteger(q)||q<=0||q%100!==0)throw Error('此沙盘每笔按 100 股整数倍练习');
  if(!Number.isFinite(p)||p<=0||p>1000000||Math.abs(p*100-Math.round(p*100))>1e-6)throw Error('情景价格须大于 0，最多两位小数');
  var pos=s.positions[sym]||{qty:0,available:0,basis:0,last:p},gross=round(q*p),fee=fees(gross,side);
  // 卖出成交当时按持仓累计成本快照记账；成本口径异常时不写盈亏字段，不按现价反推历史成本。
  var avgCost=null,costAllocated=null,realized=null;
  if(side==='buy'){
    if(gross+fee>s.cash)throw Error('模拟可用资金不足');
    if(!pos.qty&&Object.values(s.positions).filter(function(x){return x.qty>0}).length>=3)throw Error('稳健练习模式最多同时持有 3 只');
    var equity=value(s);
    if((pos.qty+q)*p>equity*0.2+0.01)throw Error('超过单只 20% 的模拟仓位上限');
    var existing=Object.entries(s.positions).reduce(function(v,e){return v+e[1].qty*(e[0]===sym?p:(s.marks[e[0]]||e[1].last))},0);
    if(existing+gross>equity*0.5+0.01)throw Error('超过 50% 的模拟股票总仓位上限');
    s.cash=round(s.cash-gross-fee);pos.qty+=q;pos.basis+=gross+fee;
  }else{
    if(q>pos.available)throw Error('可卖底仓不足：A 股当日新买入部分不能当日卖出');
    if(gross<=fee)throw Error('成交额不足以覆盖费用');
    if(pos.qty>0&&pos.basis>0){avgCost=pos.basis/pos.qty;costAllocated=round(avgCost*q);realized=round(gross-fee-costAllocated)}
    pos.basis*=1-q/pos.qty;pos.qty-=q;pos.available-=q;s.cash=round(s.cash+gross-fee);
  }
  pos.last=p;s.positions[sym]=pos;s.marks[sym]=p;
  var trade={day:s.day,sym:sym,side:side,qty:q,price:p,fee:fee,cash:s.cash};
  if(side==='sell'&&realized!==null){trade.avgCost=round(avgCost*100)/100;trade.costAllocated=costAllocated;trade.realized=realized}
  s.trades.push(trade);return s;
 }
 function next(s){s=JSON.parse(JSON.stringify(s));s.day++;s.dayStartEquity=value(s);Object.values(s.positions).forEach(function(p){p.available=p.qty});return s}
 root.FinancePaper={fresh:fresh,trade:trade,next:next,fees:fees,value:value,universe:universe};
})(typeof window==='undefined'?globalThis:window);
