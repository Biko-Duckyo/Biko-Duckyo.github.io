/* ============================================================
 * 盘中参考估算 · 前端纯函数（与 tools/finance/estimate-core.mjs 同源口径）
 * ------------------------------------------------------------
 * · estimateRef(doc, q)  直通列：etf→母ETF；index→跟踪指数；无外部基准 null
 * · estimateHold(doc, q) 持仓推算列：披露股票/可转债加权；债基合并纯债ETF代理项；
 *   未命中行情按 0（保守，不做覆盖度归一放大）；不支持 / 无行情返回 null
 * · marketSession()：本地时钟粗判 A 股交易时段（9:30–15:00 工作日），仅弱化提示。
 * ============================================================ */
window.FinanceEstimate = (function () {
  'use strict'

  var ESTIMATE_VERSION = 'estimate-core-v1'

  function round2 (n) { return Math.round(n * 100) / 100 }
  function isFiniteNum (v) { return typeof v === 'number' && isFinite(v) }

  function weighted (entries, quoteMap) {
    var sum = 0, hit = 0, hitW = 0, totalW = 0
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i]
      var w = Number(e.weight) || 0
      totalW += w
      var q = quoteMap && quoteMap[e.sym]
      if (q && isFiniteNum(q.pct)) { sum += w * q.pct; hit++; hitW += w }
    }
    return { sum: sum, hit: hit, hitW: hitW, totalW: totalW }
  }

  function estimateRef (doc, quoteMap) {
    if (!doc || !doc.ref || doc.ref.supported !== true || !doc.ref.sym) return null
    var rec = quoteMap && quoteMap[doc.ref.sym]
    if (!rec || !isFiniteNum(rec.pct)) return null
    return { pct: round2(rec.pct), basis: doc.ref.basis, sym: doc.ref.sym, label: doc.ref.label || null }
  }

  function estimateHold (doc, quoteMap) {
    if (!doc || !doc.hold || doc.hold.supported !== true) return null
    var h = doc.hold
    var items = Array.isArray(h.items) ? h.items : []
    var proxies = Array.isArray(h.proxyItems) ? h.proxyItems : []
    var entries = items.concat(proxies)
    if (!entries.length) return null
    var r = weighted(entries, quoteMap)
    if (!r.hit) return null
    return {
      pct: round2(r.sum / 100),
      basis: h.basis,
      hitItems: r.hit,
      totalItems: entries.length,
      hitWeight: round2(r.hitW),
      totalWeight: round2(r.totalW),
      proxyWeight: Number(h.proxyWeight) || 0,
      lowCoverage: !!h.lowCoverage
    }
  }

  function estimateNav (nav, estPct) {
    if (nav == null || estPct == null) return null
    var n = Number(nav), e = Number(estPct)
    if (!isFiniteNum(n) || !isFiniteNum(e)) return null
    return round2(n * (1 + e / 100) * 10000) / 10000
  }

  function parseDate (s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
    var d = new Date(s + 'T00:00:00Z')
    return isNaN(d.getTime()) ? null : d
  }

  function quoteDateOf (time) {
    var t = String(time || '')
    if (!/^\d{14}$/.test(t)) return null
    return t.slice(0, 4) + '-' + t.slice(4, 6) + '-' + t.slice(6, 8)
  }

  function quoteRecordState (rec, refDate) {
    var out = { date: null, status: 'unknown', invalid: false }
    if (!rec || !isFiniteNum(Number(rec.pct))) { out.invalid = true; return out }
    var d = quoteDateOf(rec.time)
    if (!d) return out
    out.date = d
    var rd = parseDate(refDate)
    if (!rd) { out.status = 'unknown'; return out }
    var dd = new Date(d + 'T00:00:00Z').getTime()
    if (dd > rd.getTime()) out.status = 'future'
    else if (dd < rd.getTime()) out.status = 'stale'
    else out.status = 'fresh'
    return out
  }

  function parseTime14 (t) {
    if (!/^\d{14}$/.test(t)) return null
    var d = new Date(Number(t.slice(0, 4)), Number(t.slice(4, 6)) - 1, Number(t.slice(6, 8)),
      Number(t.slice(8, 10)), Number(t.slice(10, 12)), Number(t.slice(12, 14)))
    return isNaN(d.getTime()) ? null : d.getTime()
  }

  /* 盘中新鲜度：fresh 同日且在窗内；expired 同日但超时；其余同日期状态。
     future/stale/unknown/invalid/expired 均不可命中；unknown 仅作方向参考。 */
  function quoteFreshness (rec, refDate, nowMs, maxAgeMs) {
    var base = quoteRecordState(rec, refDate)
    var out = { date: base.date, status: base.status, invalid: base.invalid, ageMs: null }
    if (base.status !== 'fresh') return out
    var t = parseTime14(rec.time)
    if (t == null) { out.status = 'unknown'; return out }
    var now = nowMs == null ? Date.now() : nowMs
    var max = maxAgeMs == null ? 45000 : maxAgeMs
    out.ageMs = now - t
    if (out.ageMs < 0) out.status = 'future'
    else if (out.ageMs > max) out.status = 'expired'
    return out
  }

  /* 基准净值是否可乘行情区间涨跌：仅按星期几推断上一交易日，不含法定节假日；无法确认时保守阻断。
     published：当天官方净值已公布，直接用官方结果，不再乘当日涨跌重复计算。 */
  function quoteUsable (rec, refDate, nowMs, maxAgeMs) {
    var st = arguments.length >= 3 ? quoteFreshness(rec, refDate, nowMs, maxAgeMs) : quoteRecordState(rec, refDate)
    return { usable: st.status === 'fresh' && !st.invalid, status: st.status, invalid: st.invalid, date: st.date, ageMs: st.ageMs == null ? null : st.ageMs }
  }

  function benchmarkNavState (navDate, quoteDate, nav) {
    if (!isFiniteNum(Number(nav)) || Number(nav) <= 0) return { ok: false, published: false, reason: 'missing-nav' }
    var nd = parseDate(navDate)
    if (!nd) return { ok: false, published: false, reason: 'missing-date' }
    var qd = parseDate(quoteDate)
    if (!qd) return { ok: false, published: false, reason: 'no-match' }
    if (nd.getTime() > qd.getTime()) return { ok: false, published: false, reason: 'future' }
    var d = Math.round((qd.getTime() - nd.getTime()) / 864e5)
    if (d === 0) return { ok: true, published: true, reason: 'published' }
    if (d < 0) return { ok: false, published: false, reason: 'future' }
    if (d > 7) return { ok: false, published: false, reason: 'stale' }
    var wd = qd.getUTCDay()
    var allowed
    if (wd === 1) allowed = [1, 3]
    else if (wd >= 2 && wd <= 5) allowed = [1]
    else allowed = [1, 2]
    return allowed.indexOf(d) >= 0
      ? { ok: true, published: false, reason: 'match' }
      : { ok: false, published: false, reason: 'no-match' }
  }

  /* 本地粗判 A 股连续竞价时段；港股重叠在白天，这里不细分 */
  function marketSession () {
    var d = new Date()
    var day = d.getDay()
    if (day === 0 || day === 6) return 'closed'
    var hm = d.getHours() * 60 + d.getMinutes()
    if (hm >= 570 && hm <= 900) return 'open'
    return 'closed'
  }

  return { ESTIMATE_VERSION: ESTIMATE_VERSION, estimateRef: estimateRef, estimateHold: estimateHold, estimateNav: estimateNav, benchmarkNavState: benchmarkNavState, quoteDateOf: quoteDateOf, quoteRecordState: quoteRecordState, quoteFreshness: quoteFreshness, quoteUsable: quoteUsable, round2: round2, marketSession: marketSession }
})()
