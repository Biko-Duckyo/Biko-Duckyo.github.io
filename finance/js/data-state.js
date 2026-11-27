/* Presentation only: fetch success and NAV freshness are separate facts. */
;(function(root){
  'use strict'
  function day(value){
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null
    const time=Date.parse(value+'T00:00:00Z')
    return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===value?time:null
  }
  function describe(rows,request={},asOf){
    const now=day(asOf),total=rows.length
    const stale=rows.filter(r=>{const t=day(r.navDate);return now===null||t===null||t>now||now-t>7*864e5||!Number.isFinite(r.nav)||r.nav<=0}).length
    const cached=rows.filter(r=>r.navStale).length
    const failed=Math.max(0,Math.min(total,Number(request.failed)||0))
    let kind,label,detail
    if(request.loading){kind='loading';label='正在读取';detail='现有数值保留，完成后更新状态'}
    else if(failed){kind='error';label=failed===total?'读取失败':'部分读取失败';detail=failed+'/'+total+' 只未更新，保留原值';if(request.hint)detail+=' · '+request.hint}
    else if(!total){kind='empty';label='暂无持仓';detail='没有需要读取的净值'}
    else if(stale){kind='stale';label='日期待核对';detail=stale+'/'+total+' 只净值缺失、超过 7 天或日期异常'}
    else if(cached||!request.attempted){kind='cache';label='使用已有数据';detail='尚未完成本次联网核对'}
    else{kind='fresh';label='已读取';detail='净值日期均在 7 天内，不代表今日或实时净值'}
    if(failed&&stale)detail+=' · '+stale+' 只日期待核对'
    return {kind,label,detail,stale,cached,failed,total}
  }
  root.FinanceDataState={describe}
})(typeof window==='undefined'?globalThis:window)
