/* ============================================================
 *  数据层 —— 密文快照 + 公开净值缓存 + 运行时计算
 * ------------------------------------------------------------
 *  · 持仓快照（成本 / 反推份额 / 基准净值）来自 FinanceSeal 解锁后的密文清单；
 *  · 最新净值是公开行情，由 /api/fund/* 代理拉取，仅缓存净值本身（非敏感）到
 *    localStorage，跨刷新免重复请求；
 *  · 运行时：value = shares × nav；profit = value − cost；profitRate = profit/cost。
 * 旧版逐笔流水（finance_transactions / finance_funds）不再读取、不并入总览。
 * ============================================================ */
const FinanceStore = (function () {
  'use strict'

  const NAV_CACHE_KEY = 'finance-nav-cache:v1'
  const DRAFT_KEY = 'finance-draft:v1'
  const DEFAULT_CATEGORIES = {
    equity: '偏股',
    bond: '偏债',
    index: '指数',
    gold: '黄金',
    qdii: '全球'
  }

  let items = []
  let transactions = []
  let categoryMap = Object.assign({}, DEFAULT_CATEGORIES)
  const historyCache = new Map()
  const benchmarkCache = new Map()
  const estimateCache = new Map()
  let estimateDocs = {}          // code → 静态估算配置（estimate/<code>.json）
  let quoteMap = {}              // sym → 行情记录（/api/quote/batch）
  let quoteMeta = { fetchedAt: 0, failed: [] }

  function FE () { return window.FinanceEstimate || null }

  function setSnapshot (payload) {
    categoryMap = Object.assign({}, DEFAULT_CATEGORIES, (payload && payload.categories) || {})
    items = Array.isArray(payload && payload.data) ? payload.data.slice() : []
    transactions = Array.isArray(payload && payload.transactions) ? payload.transactions.slice() : []
    historyCache.clear()
  }

  function all () { return items }

  /* 净值新鲜度分级（自然日，UTC+8）：仅做展示提示，不代表今日或实时净值 */
  function todayStr (asOf) {
    if (asOf && /^\d{4}-\d{2}-\d{2}$/.test(asOf)) return asOf
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date())
  }
  function freshnessOf (navDate, nav, asOf) {
    if (!Number.isFinite(Number(nav)) || Number(nav) <= 0) return 'unknown'
    if (typeof navDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(navDate)) return 'unknown'
    var today = todayStr(asOf)
    if (navDate > today) return 'future'
    var diff = Math.round((Date.parse(today + 'T00:00:00Z') - Date.parse(navDate + 'T00:00:00Z')) / 864e5)
    if (!Number.isFinite(diff) || diff < 0) return 'unknown'
    if (diff === 0) return 'today'
    if (diff <= 2) return 'recent'
    if (diff <= 7) return 'aging'
    return 'stale'
  }

  function readNavCache () {
    try { return JSON.parse(localStorage.getItem(NAV_CACHE_KEY) || '{}') } catch (e) { return {} }
  }
  function writeNavCache (c) {
    try { localStorage.setItem(NAV_CACHE_KEY, JSON.stringify(c)) } catch (e) { /* 隐私模式忽略 */ }
  }
  /* 历史净值：读取构建期发布的 fund-history/<code>.json（公开行情，无敏感数据）；
     抓取失败/新基金无文件时返回 null，前端降级为空态，不报错。 */
  function loadHistory (code) {
    if (historyCache.has(code)) return Promise.resolve(historyCache.get(code))
    return fetch('/finance/data/fund-history/' + code + '.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => {
        const pts = doc && Array.isArray(doc.points) ? doc.points : null
        historyCache.set(code, pts)
        return pts
      })
      .catch(() => { historyCache.set(code, null); return null })
  }

  /* 对照基准历史：读取构建期发布的 benchmark/<sym>.json（指数未复权收盘点位，
     仅作对照）；无落档文件时返回 null，前端降级为仅基金单线，不直连行情、不臆造序列。 */
  function loadBenchmark (sym) {
    if (!sym) return Promise.resolve(null)
    if (benchmarkCache.has(sym)) return Promise.resolve(benchmarkCache.get(sym))
    return fetch('/finance/data/benchmark/' + sym + '.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => {
        const bars = doc && Array.isArray(doc.bars) ? doc.bars : null
        const pts = bars
          ? bars.map((b) => ({ d: b.date, nav: Number(b.close), name: doc.name, sym: doc.sym }))
              .filter((p) => p.d && Number.isFinite(p.nav))
              .sort((a, b) => a.d.localeCompare(b.d))
          : null
        benchmarkCache.set(sym, pts)
        return pts
      })
      .catch(() => { benchmarkCache.set(sym, null); return null })
  }

  /* 盘中估算配置：读取构建期发布的 fund-estimate/<code>.json（公开披露权重，无敏感数据） */
  function loadEstimate (code) {
    if (estimateCache.has(code)) return Promise.resolve(estimateCache.get(code))
    return fetch('/finance/data/fund-estimate/' + code + '.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => { estimateCache.set(code, doc || null); return doc || null })
      .catch(() => { estimateCache.set(code, null); return null })
  }
  function setEstimateDocs (docs) { estimateDocs = docs || {} }
  function setQuotes (map, meta) {
    quoteMap = map || {}
    quoteMeta = meta || { fetchedAt: 0, failed: [] }
  }
  function getQuote (sym) { return quoteMap[sym] || null }
  function getQuoteMeta () {
    const times=Object.values(quoteMap).map(q=>q.time).filter(t=>/^\d{14}$/.test(String(t))).map(String).sort()
    return Object.assign({}, quoteMeta, { quoteTimeStart:times[0]||null, quoteTimeEnd:times.at(-1)||null })
  }

  function transactionsOf () { return transactions.slice() }

  /* 待登记草稿：仅存浏览器本地，不写入加密快照；正式入账需更新账本源并重跑加密构建。 */
  function readDrafts () {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]') || [] } catch (e) { return [] }
  }
  function writeDrafts (list) {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(list)) } catch (e) { /* 隐私模式忽略 */ }
  }
  function draftList () { return readDrafts() }
  function draftAdd (entry) {
    if (!entry || !entry.code || !entry.action || !Number.isFinite(Number(entry.amount)) || !entry.date) return false
    const list = readDrafts()
    list.push(Object.assign({ createdAt: Date.now() }, entry))
    writeDrafts(list)
    return true
  }
  function draftRemove (index) {
    const list = readDrafts()
    if (index < 0 || index >= list.length) return
    list.splice(index, 1)
    writeDrafts(list)
  }

  function updateNav (code, navInfo) {
    const c = readNavCache()
    c[code] = Object.assign({}, c[code] || {}, navInfo, { updatedAt: Date.now() })
    writeNavCache(c)
  }

  /* 命中行情记录的时间（14 位）：ref 取直通标的，hold 取首个命中持仓标的；无则 null */
  function quoteTimeOf (sym) { const q = sym && quoteMap[sym]; return q && /^\d{14}$/.test(String(q.time)) ? String(q.time) : null }
  function holdQuoteTime (doc) {
    if (!doc || !doc.hold) return null
    const entries = (doc.hold.items || []).concat(doc.hold.proxyItems || [])
    for (const e of entries) { const t = quoteTimeOf(e.sym); if (t) return t }
    return null
  }

  /* 行情参考日期（YYYY-MM-DD）：取最新有效行情时间的日期；缺则 null（门控据此保守阻断） */
  function quoteRefDate () {
    const meta = getQuoteMeta()
    const t = meta.quoteTimeEnd
    if (!t) return null
    return t.slice(0, 4) + '-' + t.slice(4, 6) + '-' + t.slice(6, 8)
  }

  /* 单只运行时计算：净值优先用联网最新值，缺失时回退快照基准净值；可计价与门控口径分开 */
  function compute (it) {
    const navInfo = readNavCache()[it.code] || {}
    const rawNav = Number(navInfo.nav) || Number(it.baseNav) || 0
    const nav = rawNav > 0 ? rawNav : 0
    const changePctRaw = Number(navInfo.changePct)
    const changePct = Number.isFinite(changePctRaw) ? changePctRaw : null
    const shares = Number(it.shares) || 0
    const cost = Number(it.cost) || 0
    const holding = shares > 0
    const priced = nav > 0
    const value = priced ? shares * nav : 0
    const profit = priced ? value - cost : null
    const profitRate = priced && cost > 0 ? (profit / cost) * 100 : null
    // 当日估算盈亏 ≈ value × r/(100+r)，r 为日涨跌%；无涨跌数据则为 null（不臆造）
    let dayEst = null
    if (priced && changePct != null) dayEst = value * changePct / (100 + changePct)
    const navDate = navInfo.navDate || it.baseNavDate || ''
    const freshness = freshnessOf(navDate, nav)

    const f = FE()
    const doc = estimateDocs[it.code] || null
    const estDoc = doc ? { reportDate: doc.reportDate || null, source: doc.source || null, updated: doc.updated || null, method: doc.method || null } : null

    /* 逐只命中行情时间：优先直通标的，其次首个命中持仓标的；行情参考日期据此匹配基准日 */
    let estQuoteTime = null
    if (doc && f) {
      estQuoteTime = quoteTimeOf(doc.ref && doc.ref.sym) || holdQuoteTime(doc)
    }
    const quoteDate = estQuoteTime
      ? estQuoteTime.slice(0, 4) + '-' + estQuoteTime.slice(4, 6) + '-' + estQuoteTime.slice(6, 8)
      : quoteRefDate()

    /* 多标的行情一致性：逐条核对命中行情相对参考日的新旧。
       · fresh（同日且涨跌有限）进入有效命中，参与加权与命中权重；
       · stale/future 阻断估算；
       · unknown（缺合法源时间）不计入有效命中权重/项数，涨跌幅仅作明确标注的方向参考；
       · 不使用全局行情时间或抓取时间替代逐只源时间。 */
    let quoteStale = false, quoteTimeMissing = false
    const quoteDates = []
    const quoteSyms = []
    const validQuotes = {}
    const directionRefs = []
    if (doc) {
      if (doc.ref && doc.ref.sym) quoteSyms.push(doc.ref.sym)
      const hd = doc.hold
      if (hd) (hd.items || []).concat(hd.proxyItems || []).forEach(e => quoteSyms.push(e.sym))
    }
    quoteSyms.forEach(sym => {
      const rec = quoteMap[sym]
      if (!rec || !Number.isFinite(Number(rec.pct))) return
      const use = f && f.quoteUsable ? f.quoteUsable(rec, quoteDate) : null
      const st = use || (f && f.quoteRecordState ? f.quoteRecordState(rec, quoteDate) : { status: 'unknown', date: null })
      if (st.status === 'stale' || st.status === 'future') { quoteStale = true; return }
      if (st.status === 'unknown') {
        quoteTimeMissing = true
        directionRefs.push({ sym: sym, pct: Number(rec.pct), reason: 'time-unknown' })
        return
      }
      if (st.usable !== false) { validQuotes[sym] = rec; if (st.date) quoteDates.push(st.date) }
    })
    quoteDates.sort()
    const estQuoteStart = quoteDates[0] || null
    const estQuoteEnd = quoteDates[quoteDates.length - 1] || null

    /* 基准日 ↔ 行情日匹配门控：不按“净值较新”宽泛放行。
       基准日期过旧/缺失/未来/与行情区间无法匹配时，阻断估算净值、估算市值与估算当日盈亏；
       当天官方净值已公布（published）时直接采用官方结果，不再乘当日涨跌重复计算。 */
    const bench = f && f.benchmarkNavState ? f.benchmarkNavState(navDate, quoteDate, nav) : { ok: false, published: false, reason: 'no-match' }
    const hasValidQuote = Object.keys(validQuotes).length > 0
    const estUsable = !!(priced && bench.ok && !bench.published && !quoteStale && hasValidQuote)

    let estRef = null, estHold = null, est = null, estValue = null, estDay = null, estNavBlocked = false, estBlockReason = null
    if (doc && f) {
      const er = f.estimateRef(doc, validQuotes)
      if (er) estRef = Object.assign({ supported: true, reason: null }, er)
      else estRef = { supported: !!(doc.ref && doc.ref.supported), basis: (doc.ref && doc.ref.basis) || null, reason: (doc.ref && doc.ref.reason) || 'no-quote', directionRefs: directionRefs.filter(d => d.sym === (doc.ref && doc.ref.sym)) }

      const eh = f.estimateHold(doc, validQuotes)
      if (eh) {
        estHold = Object.assign({ supported: true, method: doc.method, directionRefs: directionRefs }, eh)
        if (estUsable) {
          const enav = f.estimateNav(nav, eh.pct)
          if (enav != null) { estValue = shares * enav; estDay = estValue - value }
        } else {
          estNavBlocked = true
          estBlockReason = bench.published ? 'published' : (quoteStale ? 'quote-stale' : (!hasValidQuote && quoteTimeMissing ? 'quote-time-unknown' : bench.reason))
        }
      } else {
        const holdSupported = !!(doc.hold && doc.hold.supported)
        estHold = { supported: holdSupported, basis: (doc.hold && doc.hold.basis) || null, reason: (doc.hold && doc.hold.reason) || 'no-quote', directionRefs: directionRefs, hitWeight: 0, hitItems: 0 }
        if (holdSupported && !estUsable) {
          estNavBlocked = true
          estBlockReason = bench.published ? 'published' : (quoteStale ? 'quote-stale' : (!hasValidQuote && quoteTimeMissing ? 'quote-time-unknown' : bench.reason))
        }
      }
      est = estHold
    }

    return Object.assign({}, it, {
      nav: nav,
      navDate: navDate,
      changePct: changePct,
      freshness: freshness,
      shares: shares,
      cost: cost,
      holding: holding,
      priced: priced,
      navMissing: !priced,
      value: value,
      profit: profit,
      profitRate: profitRate,
      dayEst: dayEst,
      navStale: !navInfo.nav,
      navUpdatedAt: Number(navInfo.updatedAt) || null,
      estRef: estRef,
      estHold: estHold,
      est: est,
      estSupported: !!(estHold && estHold.supported),
      estValue: estValue,
      estDay: estDay,
      estQuoteTime: estQuoteTime,
      estQuoteStart: estQuoteStart,
      estQuoteEnd: estQuoteEnd,
      quoteStale: quoteStale,
      quoteTimeMissing: quoteTimeMissing,
      directionRefs: directionRefs,
      estGeneratedAt: estValue != null ? Date.now() : null,
      estDoc: estDoc,
      estNavBlocked: estNavBlocked,
      estBlockReason: estBlockReason,
      bench: bench
    })
  }

  /* 组合序列聚合：当前份额 × 各基金历史净值，按日期并集前向填充对齐；
     无历史申赎现金流明细，不反推每日真实净值，返回归一化指数与覆盖口径。 */
  function portfolioSeries (rows, histories) {
    const funds = rows.filter((r) => Number.isFinite(r.shares) && r.shares > 0 && histories[r.code])
    if (funds.length < 1) return null
    const dateSet = new Set()
    funds.forEach((r) => (histories[r.code] || []).forEach((p) => dateSet.add(p.d)))
    const dates = Array.from(dateSet).sort()
    if (dates.length < 2) return null

    const lastNav = {}
    const daily = dates.map((d) => {
      let value = 0, knownValue = 0, totalCostWeight = 0
      funds.forEach((r) => {
        const pts = histories[r.code] || []
        const hit = pts.filter((p) => p.d <= d).pop()
        if (hit && Number.isFinite(Number(hit.nav)) && Number(hit.nav) > 0) {
          lastNav[r.code] = Number(hit.nav)
          value += r.shares * lastNav[r.code]
        } else if (Number.isFinite(lastNav[r.code])) {
          value += r.shares * lastNav[r.code]
        }
      })
      return { d, value }
    }).filter((x) => x.value > 0)

    if (daily.length < 2) return null
    const base = daily[0].value
    const points = daily.map((x) => ({ d: x.d, nav: x.value / base }))
    const lastValue = daily[daily.length - 1].value
    return { points: points, lastValue: lastValue, fundCount: funds.length }
  }

  function list () { return items.map(compute) }

  function summary () {
    const rows = list()
    const holdings = rows.filter(r => r.holding)
    const priced = holdings.filter(r => r.priced)
    let value = 0, cost = 0, day = 0, validDay = 0
    let estDay = 0, validEst = 0
    holdings.forEach(r => { cost += r.cost })
    priced.forEach(r => {
      value += r.value
      if (r.dayEst != null) { day += r.dayEst; validDay++ }
      if (r.estDay != null) { estDay += r.estDay; validEst++ }
    })
    const missingCount = holdings.length - priced.length
    const complete = missingCount === 0
    const profit = complete ? value - cost : null
    return {
      rows: rows,
      holdings: holdings,
      value: value,
      cost: cost,
      profit: profit,
      profitRate: complete && cost > 0 ? (profit / cost) * 100 : null,
      complete: complete,
      holdingCount: holdings.length,
      pricedCount: priced.length,
      missingCount: missingCount,
      dayEstimate: validDay ? day : null,
      estDayEstimate: validEst ? estDay : null,
      estCount: validEst,
      count: rows.length
    }
  }

  function byCategory () {
    const agg = {}
    list().filter(r => r.holding).forEach(r => {
      const k = r.category || 'other'
      if (!agg[k]) agg[k] = { key: k, label: categoryMap[k] || k, value: 0, cost: 0, count: 0, priced: 0 }
      agg[k].value += r.value
      agg[k].cost += r.cost
      agg[k].count += 1
      if (r.priced) agg[k].priced += 1
    })
    return Object.values(agg).sort((a, b) => b.value - a.value)
  }

  function categoryLabel (k) { return categoryMap[k] || k }

  return {
    setSnapshot: setSnapshot,
    all: all,
    list: list,
    summary: summary,
    byCategory: byCategory,
    categoryLabel: categoryLabel,
    updateNav: updateNav,
    readNavCache: readNavCache,
    loadHistory: loadHistory,
    portfolioSeries: portfolioSeries,
    loadBenchmark: loadBenchmark,
    loadEstimate: loadEstimate,
    setEstimateDocs: setEstimateDocs,
    setQuotes: setQuotes,
    getQuote: getQuote,
    getQuoteMeta: getQuoteMeta,
    transactionsOf: transactionsOf,
    draftList: draftList,
    draftAdd: draftAdd,
    draftRemove: draftRemove,
    freshnessOf: freshnessOf,
    NAV_CACHE_KEY: NAV_CACHE_KEY
  }
})()
