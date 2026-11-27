/* ============================================================
 *  主逻辑 —— 门禁解锁、快照渲染、分类筛选、净值刷新
 * ------------------------------------------------------------
 *  · 门禁：FinanceSeal（PBKDF2-SHA256 + AES-GCM-256）解 /finance/data/finance.enc.html
 *  · 数据：FinanceStore（密文快照 + 净值缓存）；图表：FinanceCharts（纯 HTML 配置条）
 *  · 净值：/api/fund/batch?codes=... 同源代理拉取最新已公布净值，合并后重算市值/盈亏
 * ============================================================ */
(function () {
  'use strict'

  var seal = null
  var unlocked = false
  var gateComposing = false
  var gateBusy = false
  var pendingRefresh = true
  var state = { category: 'all', sort: 'value', search: '', profitFilter: 'all', display: 'confirmed', selectedCode: null, range: '1y', benchMode: 'fund', chartScope: 'fund' }
  var rememberedView = window.BikoView?.read('finance')
  if (rememberedView?.state) Object.keys(state).forEach(function (key) {
    var value = rememberedView.state[key]
    if (typeof value === 'string' && value.length < 120) state[key] = value
  })
  window.BikoView?.register('finance', function () {
    if (!unlocked) return null
    return { state: state, y: window.scrollY, view: document.querySelector('[data-fin-view][aria-pressed="true"]')?.dataset.finView || 'diagnosis', details: Array.from(document.querySelectorAll('.fin-workbench details')).map(function (item) { return item.open }) }
  })
  var lastRefreshAt = null
  var lastRefreshOk = null
  var navRequest = null, navLoading = false, navFailedCount = 0, navFailureHint = ''
  var lastQuoteAt = null
  var marketCache = null
  var breadthCache = null
  var researchSnapshot = null
  var snapshotRequested = false
  var ACTION_LABEL = { buy: '买入', reinvest: '分红再投', sell: '赎回', cash_div: '现金分红', adjust: '调平' }

  /* ================= 门禁（对齐追番 anime_seal 用法） ================= */
  function bootUnlock () {
    var gateEl = document.getElementById('finGate')
    try { seal = window.FinanceSeal ? window.FinanceSeal.create() : null } catch (e) { seal = null }
    if (!seal) { showGate(); return }

    var cached = seal.getData()
    if (cached) { unlockWithData(cached, true); return }

    var hex = seal.recall(seal.KEY_STORE)
    if (hex) {
      var keyBytes = seal.hexToBytes(hex)
      if (keyBytes) {
        seal.fetch().then(function (meta) {
          return seal.decryptWith(keyBytes, meta)
        }).then(function (data) {
          seal.putData(data)
          unlockWithData(data, false)
        }).catch(function () {
          try { seal.remember(seal.KEY_STORE, null) } catch (e) {}
          showGate()
        })
        return
      }
    }
    showGate()
  }

  function showGate () {
    var gateEl = document.getElementById('finGate')
    if (gateEl) gateEl.hidden = false
    window.BikoAccessGate?.ready('locked')
  }

  function unlockWithData (data, offline) {
    unlocked = true
    window.BikoAccessGate?.ready('unlocked')
    var gateEl = document.getElementById('finGate')
    var mainEl = document.getElementById('finMain')
    if (gateEl) {
      gateEl.classList.add('is-leaving')
      setTimeout(function () { if (gateEl) gateEl.hidden = true }, 320)
    }
    if (mainEl) mainEl.hidden = false
    FinanceStore.setSnapshot(data)
    renderSkeleton()
    renderAll()
    refreshNav(false).then(function () { refreshQuote() }) // 净值后再拉盘中行情，失败不打断首屏
  }

  function renderSkeleton () {
    var list = document.getElementById('fin-fund-list')
    if (list) list.innerHTML = '<div class="fin-skeleton fin-skeleton-card"></div>'.repeat(3)
    var tbody = document.getElementById('fin-table-body')
    if (tbody) tbody.innerHTML = '<tr class="fin-skeleton-row"><td colspan="10"><div class="fin-skeleton fin-skeleton-line"></div></td></tr>'.repeat(2)
  }

  function gateFail () {
    try { seal && seal.remember(seal.KEY_STORE, null) } catch (e) {}
    var err = document.getElementById('finGateErr')
    var box = document.getElementById('finGateBox')
    var input = document.getElementById('finGatePass')
    if (err) { err.hidden = false; err.textContent = '口令不正确，或密文不可达，请重新输入' }
    if (box) {
      box.classList.remove('is-shaking')
      void box.offsetWidth
      box.classList.add('is-shaking')
    }
    if (input) input.select()
  }

  function onGateSubmit (e) {
    e.preventDefault()
    if (gateComposing || e.isComposing || gateBusy) return false
    var input = document.getElementById('finGatePass')
    var pass = (input && input.value || '').trim()
    if (!pass || !seal) return false
    gateBusy = true
    var button = document.querySelector('.fin-gate-submit')
    if (button) button.disabled = true
    var error = document.getElementById('finGateErr')
    if (error) error.hidden = true
    seal.open(pass).then(function (data) {
      unlockWithData(data, false)
    }).catch(function (err) {
      console.warn('持仓清单解密失败：', err)
      gateFail()
    }).finally(function () {
      gateBusy = false
      if (button) button.disabled = false
    })
    return false
  }

  /* ================= 工具 ================= */
  function fmtMoney (n) {
    return Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  function signedMoney (n) {
    n = Number(n || 0)
    return (n < 0 ? '-¥' : '+¥') + fmtMoney(Math.abs(n))
  }
  function fmtRate (n) {
    var v = Number(n || 0)
    return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'
  }
  function fmtMktPrice (n) {
    return Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  function fmtAmount (cny) {
    var v = Number(cny)
    if (!isFinite(v)) return '--'
    if (v >= 1e12) return (v / 1e12).toFixed(2) + ' 万亿'
    if (v >= 1e8) return Math.round(v / 1e8) + ' 亿'
    return Math.round(v / 1e4) + ' 万'
  }
  function signClass (n) { return Number(n || 0) >= 0 ? 'positive' : 'negative' }
  /* 14 位行情时间 → 北京时间展示；无则“未知”（不把抓取时间冒充行情时间） */
  function fmtQuoteTime (t) {
    if (!t || !/^\d{14}$/.test(String(t))) return '未知'
    var s = String(t)
    return s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8) + ' ' + s.slice(8, 10) + ':' + s.slice(10, 12) + '（UTC+8）'
  }
  function fmtEpoch (ts) {
    if (!Number.isFinite(Number(ts))) return '未知'
    var d = new Date(Number(ts))
    function p (x) { return String(x).padStart(2, '0') }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
  }
  function esc (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  /* 净值新鲜度角标：分级口径与 store.freshnessOf 一致，仅展示提示 */
  function freshnessTag (row) {
    var map = {
      today: { cls: 'is-today', label: '今日', title: '净值日期为今日' },
      recent: { cls: 'is-recent', label: '近 2 日', title: '净值日期在 1–2 日内；跨市场基金可能属正常滞后' },
      aging: { cls: 'is-aging', label: '3–7 日', title: '净值日期已隔 3–7 个自然日，建议核对是否更新' },
      stale: { cls: 'is-stale', label: '已过期', title: '净值日期超过 7 个自然日，行情参考可能失效' },
      future: { cls: 'is-future', label: '日期异常', title: '净值日期晚于今天，请核对数据源' },
      unknown: { cls: 'is-unknown', label: '日期待核对', title: '缺少有效净值日期或净值，请刷新核对' }
    }
    var m = map[row.freshness] || map.unknown
    return '<span class="fin-nav-tag ' + m.cls + '" title="' + esc(m.title) + '">' + esc(m.label) + '</span>'
  }

  /* 快照已落档的阶段回报 / 规模 / 回撤 / 管理费，只读上屏；字段缺失整段不显，不补造 */
  function fundEvidence (code) {
    var f = researchSnapshot && researchSnapshot.funds && researchSnapshot.funds[code]
    if (!f) return ''
    var rank = f.rank || {}, m = f.metrics || {}, fees = f.fees || {}, items = []
    if (Number.isFinite(Number(rank.return1y))) items.push('<span>近1年 <b class="' + signClass(rank.return1y) + '">' + fmtRate(rank.return1y) + '</b></span>')
    if (Number.isFinite(Number(rank.return3y))) items.push('<span>近3年 <b class="' + signClass(rank.return3y) + '">' + fmtRate(rank.return3y) + '</b></span>')
    if (Number.isFinite(Number(rank.size)) && rank.size > 0) items.push('<span class="fin-mute">规模 ' + esc(fmtAmount(rank.size)) + '</span>')
    if (Number.isFinite(Number(m.maxDrawdown))) items.push('<span class="fin-mute">回撤 ' + Number(m.maxDrawdown).toFixed(1) + '%</span>')
    if (fees.management) items.push('<span class="fin-mute">管理 ' + esc(fees.management) + '</span>')
    return items.length ? '<div class="fin-fund-item-evidence">' + items.join('<span class="fin-mute"> · </span>') + '</div>' : ''
  }

  /* ================= 渲染 ================= */
  function renderAll () {
    renderSummary()
    renderChips()
    renderProfitChips()
    renderList()
    renderTable()
    renderCount()
    renderAllocation()
    renderHistory()
    renderLedger()
    renderNavMeta()
    renderMarket()
    document.dispatchEvent(new CustomEvent('finance:updated'))
  }

  function renderQuotePanel () {
    renderSummary()
    renderList()
    renderTable()
    renderMarket()
    document.dispatchEvent(new CustomEvent('finance:updated'))
  }

  function renderSummary () {
    var s = FinanceStore.summary()
    var incomplete = !s.complete
    setText('fin-total', (incomplete ? '可计价持仓市值 ' : '总资产 ') + '¥' + fmtMoney(s.value))
    setText('fin-stat-total', '¥' + fmtMoney(s.value))
    setText('fin-stat-cost', '¥' + fmtMoney(s.cost))

    var totalLabel = document.getElementById('fin-stat-total-label')
    if (totalLabel) totalLabel.textContent = incomplete ? '可计价持仓市值' : '总市值'

    var profitEl = document.getElementById('fin-stat-profit')
    if (profitEl) {
      if (s.profit == null) { profitEl.textContent = '--'; profitEl.className = 'fin-stat-value fin-mute' }
      else { profitEl.textContent = signedMoney(s.profit); profitEl.className = 'fin-stat-value fin-stat-profit ' + signClass(s.profit) }
    }
    var profitLabel = document.getElementById('fin-stat-profit-label')
    if (profitLabel) profitLabel.textContent = incomplete ? '账面盈亏（口径不完整）' : '账面盈亏'
    var rateEl = document.getElementById('fin-stat-rate')
    if (rateEl) {
      if (s.profitRate == null) { rateEl.textContent = '--'; rateEl.className = 'fin-stat-value fin-mute' }
      else { rateEl.textContent = fmtRate(s.profitRate); rateEl.className = 'fin-stat-value fin-stat-profit ' + signClass(s.profit) }
    }
    var rateLabel = document.getElementById('fin-stat-rate-label')
    if (rateLabel) rateLabel.textContent = incomplete ? '账面收益率（口径不完整）' : '账面收益率'

    var dates = s.rows.map(function (r) { return r.navDate }).filter(Boolean).sort()
    var dateTxt = dates.length ? (dates[0] === dates[dates.length - 1] ? dates[0] : dates[0] + ' ～ ' + dates[dates.length - 1].slice(5)) : '日期待核对'
    var basisTxt
    if (incomplete) {
      basisTxt = '仅汇总已计价 ' + s.pricedCount + '/' + s.holdingCount + ' 只；' + s.missingCount + ' 只净值缺失，总市值暂不完整，缺失值未按零计入。累计盈亏须成本与计价范围一致才计算，当前口径不完整，盈亏与收益率暂置空。'
    } else {
      basisTxt = '各基金最新已公布净值汇总，日期可能不同 · ' + dateTxt + ' · ' + s.holdingCount + ' 只持仓 · 参考 ' + s.estCount + '/' + s.holdingCount + ' 只（非确认收益）'
    }
    if (pendingRefresh) basisTxt += ' · 待刷新'
    setText('fin-summary-basis', basisTxt)

    var dayEl = document.getElementById('fin-stat-day')
    if (dayEl) {
      var dayVal = s.estDayEstimate
      dayEl.title = '盘中持仓参考覆盖 ' + s.estCount + '/' + s.holdingCount + ' 只，非官方净值，不与历史日涨跌混用'
      if (dayVal == null) {
        dayEl.textContent = '--'
        dayEl.className = 'fin-stat-value fin-mute'
      } else {
        dayEl.textContent = signedMoney(dayVal)
        dayEl.className = 'fin-stat-value fin-stat-profit ' + signClass(dayVal)
      }
    }
  }

  function setText (id, txt) {
    var el = document.getElementById(id)
    if (el) el.textContent = txt
  }

  function filteredRows () {
    var rows = FinanceStore.list()
    if (state.category !== 'all') rows = rows.filter(function (r) { return r.category === state.category })
    if (state.search) rows = rows.filter(function(r){return (r.name+' '+r.code).toLowerCase().includes(state.search)})
    if (state.profitFilter === 'profit') rows = rows.filter(function (r) { return r.profit > 0 })
    else if (state.profitFilter === 'loss') rows = rows.filter(function (r) { return r.profit < 0 })
    else if (state.profitFilter === 'flat') rows = rows.filter(function (r) { return r.profit === 0 })
    rows.sort(function (a, b) {
      if (state.sort === 'rate') return b.profitRate - a.profitRate
      if (state.sort === 'loss') return a.profit - b.profit
      if (state.sort === 'day') return (b.changePct == null ? -Infinity : b.changePct) - (a.changePct == null ? -Infinity : a.changePct)
      if (state.sort === 'navDate') return (b.navDate || '').localeCompare(a.navDate || '')
      if (state.sort === 'cost') return b.cost - a.cost
      return b.value - a.value
    })
    return rows
  }

  function renderChips () {
    var wrap = document.getElementById('fin-filter-chips')
    if (!wrap) return
    var all = FinanceStore.list()
    var cats = {}
    all.forEach(function (r) { cats[r.category] = (cats[r.category] || 0) + 1 })
    var order = ['equity', 'bond', 'index', 'gold', 'qdii']
    var list = order.filter(function (k) { return cats[k] }).map(function (k) {
      return [k, FinanceStore.categoryLabel(k), cats[k]]
    })
    var defs = [['all', '全部', all.length]].concat(list)
    wrap.innerHTML = defs.map(function (d) {
      var active = state.category === d[0] ? ' active' : ''
      return '<button type="button" class="fin-chip' + active + '" data-cat="' + d[0] + '">' +
        esc(d[1]) + '<span class="fin-chip-count">' + d[2] + '</span></button>'
    }).join('')
  }

  function renderProfitChips () {
    var wrap = document.getElementById('fin-profit-chips')
    if (!wrap) return
    var defs = [['all', '全部'], ['profit', '盈利'], ['loss', '亏损'], ['flat', '持平']]
    wrap.innerHTML = defs.map(function (d) {
      var active = state.profitFilter === d[0] ? ' active' : ''
      return '<button type="button" class="fin-chip' + active + '" data-profit="' + d[0] + '">' + esc(d[1]) + '</button>'
    }).join('')
  }

  function renderCount () {
    var el = document.getElementById('fin-fund-count')
    if (el) el.textContent = '共 ' + filteredRows().length + ' 只'
  }

  function renderList () {
    var container = document.getElementById('fin-fund-list')
    if (!container) return
    var rows = filteredRows()
    var quoteTime = FinanceStore.getQuoteMeta().quoteTimeEnd
    var stamp = quoteTime ? quoteTime.slice(0,4)+'-'+quoteTime.slice(4,6)+'-'+quoteTime.slice(6,8)+' '+quoteTime.slice(8,10)+':'+quoteTime.slice(10,12) : '时间待核对'
    setText('fin-hold-basis',state.display==='reference'?'非基金净值 · 源行情 '+stamp:'已公布净值与市值')
    document.querySelectorAll('[data-fin-mode]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.finMode===state.display))})
    if (!rows.length) {
      container.innerHTML = '<div class="fin-empty" role="status"><i class="fas fa-inbox" aria-hidden="true"></i><p>没有符合筛选条件的持仓</p><button class="ui-retry" type="button" data-fin-reset>清除筛选</button></div>'
      return
    }
    container.innerHTML = rows.map(function (r) {
      var tag = r.tag ? '<span class="fin-item-tag">' + esc(r.tag) + '</span>' : ''
      var active = state.selectedCode === r.code ? ' active' : ''
      var estimate = r.estHold && Number.isFinite(r.estHold.pct) ? r.estHold : r.estRef && Number.isFinite(r.estRef.pct) ? r.estRef : null
      var refMode = state.display === 'reference'
      var basis = estimate === r.estHold ? '重仓参考' : '指数/ETF参考'
      var blockedNote = refMode && r.estNavBlocked ? ' · ' + blockedReasonText(r.estBlockReason) : ''
      var line = refMode
        ? (estimate ? basis + (estimate.lowCoverage ? ' · 低覆盖' : '') + blockedNote : '暂无参考')
        : (r.priced ? '净值 ' + r.nav.toFixed(4) + (r.navDate ? ' · ' + r.navDate.slice(5) : '') : '净值未知')
      var metric = refMode ? (estimate ? fmtRate(estimate.pct) : '—') : (r.profitRate == null ? '—' : fmtRate(r.profitRate))
      var docBits = []
      docBits.push('净值日 ' + (r.navDate || '未知'))
      docBits.push('行情 ' + fmtQuoteTime(r.estQuoteTime))
      if (r.estDoc && r.estDoc.reportDate) docBits.push('报告日 ' + r.estDoc.reportDate)
      if (r.estDoc && r.estDoc.source) docBits.push('来源 ' + esc(r.estDoc.source))
      var docLine = '<div class="fin-fund-item-doc">' + docBits.join('<span class="fin-mute"> · </span>') + '</div>'
      var metricClass = refMode ? (estimate ? signClass(estimate.pct) : 'fin-mute') : (r.profitRate == null ? 'fin-mute' : signClass(r.profitRate))
      var dayRow = ''
      if (r.dayEst != null) {
        dayRow = '<div class="fin-fund-item-day"><span class="' + signClass(r.dayEst) + '">' + signedMoney(r.dayEst) + '</span>' +
          (r.changePct != null ? ' <span class="fin-mute">' + fmtRate(r.changePct) + '</span>' : '') + '</div>'
      } else if (r.changePct != null) {
        dayRow = '<div class="fin-fund-item-day"><span class="' + signClass(r.changePct) + '">' + fmtRate(r.changePct) + '</span></div>'
      }
      var valueTxt = r.priced ? '¥' + fmtMoney(r.value) : '暂不计价'
      var profitTxt = r.profit == null ? '—' : signedMoney(r.profit)
      return '<button type="button" class="fin-fund-item' + active + '" data-code="' + esc(r.code) + '" aria-pressed="'+String(!!active)+'">' +
        '<div class="fin-fund-item-name">' + esc(r.name) + tag + '</div>' +
        '<div class="fin-fund-item-code">' + esc(r.code) + ' · ' + esc(FinanceStore.categoryLabel(r.category)) + ' ' + freshnessTag(r) + '</div>' +
        '<div class="fin-fund-item-meta">' +
          '<span class="fin-fund-item-price">' + esc(line) + '</span>' +
          '<span class="fin-fund-item-profit ' + metricClass + '">' + metric + '</span>' +
        '</div>' +
        '<div class="fin-fund-item-value-row">' +
          '<span class="fin-fund-item-value">'+(refMode?'已公布市值':'市值')+' ' + valueTxt + '</span>' +
          '<span class="fin-fund-item-total ' + (r.profit == null ? 'fin-mute' : signClass(r.profit)) + '">' + profitTxt + '</span>' +
        '</div>' +
        dayRow +
        docLine +
        fundEvidence(r.code) +
      '</button>'
    }).join('')
  }

  function renderTable () {
    var tbody = document.getElementById('fin-table-body')
    if (!tbody) return
    var rows = filteredRows()
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="fin-table-empty">没有符合筛选条件的持仓</td></tr>'
      return
    }
    tbody.innerHTML = rows.map(function (r) {
      var day = r.changePct == null ? '<span class="fin-mute">--</span>'
        : '<span class="' + signClass(r.changePct) + '">' + fmtRate(r.changePct) + '</span>' +
          (r.dayEst != null ? '<div class="fin-td-sub ' + signClass(r.dayEst) + '">' + signedMoney(r.dayEst) + '</div>' : '')
      var active = state.selectedCode === r.code ? ' active' : ''
      return '<tr data-code="' + esc(r.code) + '" class="' + active.trim() + '">' +
        '<td class="fin-td-name"><button type="button" data-code="'+esc(r.code)+'">' + esc(r.name) + '</button>' +
          '<div class="fin-td-sub">' + esc(r.code) + ' · ' + esc(FinanceStore.categoryLabel(r.category)) +
          (r.tag ? ' · ' + esc(r.tag) : '') + '</div></td>' +
        '<td class="fin-td-num ' + (r.profitRate == null ? 'fin-mute' : signClass(r.profitRate)) + '">' + (r.profitRate == null ? '—' : fmtRate(r.profitRate)) + '</td>' +
        '<td class="fin-td-num ' + (r.profit == null ? 'fin-mute' : signClass(r.profit)) + '">' + (r.profit == null ? '—' : signedMoney(r.profit)) + '</td>' +
        '<td class="fin-td-num"><b>' + (r.priced ? '¥' + fmtMoney(r.value) : '<span class="fin-mute">暂不计价</span>') + '</b></td>' +
        '<td>' + (r.priced ? r.nav.toFixed(4) : '<span class="fin-mute">未知</span>') + '<div class="fin-td-sub">'+esc(r.navDate||'日期待核对')+' ' + freshnessTag(r) + '</div></td>' +
        '<td class="fin-td-num">' + day + '</td>' +
        '<td class="fin-td-num">' + refCell(r) + '</td>' +
        '<td class="fin-td-num">' + holdCell(r) + '</td>' +
        '<td class="fin-td-num">' + r.shares.toFixed(2) + '</td>' +
        '<td class="fin-td-num">¥' + fmtMoney(r.cost) + '</td>' +
      '</tr>'
    }).join('')
  }

  /* 基准日门控阻断文案：行情方向仍可参考，但不生成估算净值/市值/当日盈亏 */
  function blockedReasonText (reason) {
    if (reason === 'published') return '官方净值已公布，不再乘当日涨跌'
    if (reason === 'future') return '净值日期晚于行情日，仅方向参考'
    if (reason === 'stale') return '基准净值过旧，仅方向参考'
    if (reason === 'missing-date' || reason === 'missing-nav') return '基准净值日期缺失，仅方向参考'
    if (reason === 'quote-stale') return '部分行情为陈旧缓存，不生成估算净值'
    if (reason === 'quote-time-unknown') return '逐只行情缺源时间，不生成估算净值，涨跌仅作方向参考'
    return '基准日与行情区间无法匹配，仅方向参考'
  }

  /* 降级原因文案（两列共用） */
  function estReasonText (reason) {
    if (reason === 'qdii') return 'QDII：美股夜间时差 + 季报披露滞后，两列均不估算'
    if (reason === 'etf-no-holdings') return 'ETF 联接无个股明细，持仓推算列留空；参考母 ETF 直通列'
    if (reason === 'no-benchmark-index') return '主动型基金无公开跟踪基准指数，直通列留空；参考重仓推算列'
    if (reason === 'bond-proxy') return '债基：纯债主体以国债 ETF 方向代理，低覆盖弱参考'
    if (reason === 'insufficient-holdings') return '披露持仓覆盖过低，不足以推算'
    return '暂无可用盘中行情'
  }
  /* 外层一句通俗结论；技术口径见右侧“来源与计算口径”与折叠说明 */
  function estPlain (reason) {
    if (reason === 'qdii') return '海外基金，行情有时差与披露滞后，暂不估算'
    if (reason === 'etf-no-holdings') return '联接基金无个股明细，仅参考母 ETF'
    if (reason === 'no-benchmark-index') return '主动基金无公开跟踪指数，仅看重仓推算'
    if (reason === 'bond-proxy') return '债基缺纯债明细，只作弱参考'
    if (reason === 'insufficient-holdings') return '披露持仓太少，不足以推算'
    return '盘中行情暂不可用'
  }

  /* 列A：指数 / ETF 直通参考 */
  function refCell (r) {
    var e = r.estRef
    if (!e) return '<span class="fin-mute">--</span>'
    if (!e.supported) {
      return '<span class="fin-est-na" title="' + esc(estPlain(e.reason) + '。' + estReasonText(e.reason)) + '">—</span>'
    }
    var title = e.basis === 'etf' ? '母 ETF 盘中行情直通，实时性高，仅供参考'
      : '跟踪指数盘中行情直通，仅供参考'
    return '<span class="fin-est fin-est-ref ' + signClass(e.pct) + '" title="' + esc(title) + '">' +
      '<i class="fas fa-link fin-est-ico"></i>' + fmtRate(e.pct) + '</span>'
  }

  /* 列B：重仓 / 债券代理推算 */
  function holdCell (r) {
    var e = r.estHold
    if (!e) return '<span class="fin-mute">--</span>'
    if (!e.supported) {
      return '<span class="fin-est-na" title="' + esc(estPlain(e.reason) + '。' + estReasonText(e.reason)) + '">—</span>'
    }
    var title = holdTip(e)
    if (r.estNavBlocked) title = blockedReasonText(r.estBlockReason) + '，行情涨跌仅作方向参考，不构成净值估算。' + title
    var weak = (e.lowCoverage || r.estNavBlocked) ? ' fin-est-weak' : ''
    return '<span class="fin-est fin-est-hold' + weak + ' ' + signClass(e.pct) + '" title="' + esc(title) + '">' +
      '<i class="fas fa-bolt fin-est-ico"></i>' + fmtRate(e.pct) + '</span>'
  }
  function holdTip (e) {
    if (e.basis === 'bond-proxy') {
      return '债基弱参考：披露股票与可交易可转债按实时价；纯债主体 ' +
        e.proxyWeight + '% 以十年国债 ETF 方向代理；未披露债券不臆造涨跌，仅供参考'
    }
    var cov = e.lowCoverage ? '；披露覆盖偏低，噪声较大' : ''
    var weightRate = e.totalWeight > 0 ? Math.round(e.hitWeight / e.totalWeight * 1000) / 10 : null
    var weightPart = '行情命中权重 ' + e.hitWeight + '%（占基金净资产' +
      (weightRate != null ? '，占披露权重 ' + weightRate + '%' : '') + '）'
    return '披露权重合计 ' + e.totalWeight + '%（占基金净资产）；' + weightPart +
      '；命中项数 ' + e.hitItems + '/' + e.totalItems + '（项数为独立辅助信息，不用项数比例替代权重覆盖）；' +
      '未命中项按零贡献，不代表其实际零涨跌；未披露仓位未计入' + cov + '，仅供参考'
  }

  function loadResearchSnapshot () {
    if (snapshotRequested) return
    snapshotRequested = true
    fetch('/finance/data/research/snapshot.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null })
      .then(function (doc) { researchSnapshot = doc || null; renderAllocation(); renderList(); renderTable() })
      .catch(function () { researchSnapshot = null })
  }

  function renderAllocation () {
    var box = document.getElementById('fin-allocation')
    if (!box || !window.FinanceCharts) return
    var s = FinanceStore.summary()
    var pen = null
    if (researchSnapshot && window.FundEvidence) {
      try { pen = window.FundEvidence.penetration(FinanceStore.list(), researchSnapshot) } catch (e) { pen = null }
    } else {
      loadResearchSnapshot()
    }
    FinanceCharts.renderAllocation(box, FinanceStore.byCategory(), s.value, { penetration: pen })
  }

  /* ---------- 选中持仓联动：左侧卡片 / 表格行 ↔ 净值走势 ---------- */
  function currentRow () {
    var rows = filteredRows()
    var hit = rows.find(function (r) { return r.code === state.selectedCode })
    if (hit) return hit
    var sorted = rows.slice().sort(function (a, b) { return b.value - a.value })
    return sorted[0] || null
  }

  function selectCode (code) {
    if (!code) return
    state.selectedCode = code
    var list = document.getElementById('fin-fund-list')
    if (list) list.querySelectorAll('.fin-fund-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.code === code)
      el.setAttribute('aria-pressed',String(el.dataset.code === code))
    })
    var tbody = document.getElementById('fin-table-body')
    if (tbody) tbody.querySelectorAll('tr[data-code]').forEach(function (tr) {
      tr.classList.toggle('active', tr.dataset.code === code)
    })
    renderHistory()
    document.dispatchEvent(new CustomEvent('finance:selected',{detail:{code:code}}))
  }

  function renderHistory () {
    var box = document.getElementById('fin-history')
    if (!box || !window.FinanceCharts) return
    var row = currentRow()
    var title = document.querySelector('#fin-history-card .fin-history-title-text')
    var scopeWrap = document.getElementById('fin-history-scope')
    if (scopeWrap) scopeWrap.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b.dataset.scope === (state.chartScope || 'fund')) })
    if (!row) {
      box.innerHTML = '<div class="fin-empty"><p>暂无持仓可展示走势</p></div>'
      return
    }
    var scope = state.chartScope || 'fund'
    var benchWrap = document.getElementById('fin-history-bench')
    var estBox = document.getElementById('fin-est-summary')

    if (scope === 'portfolio') {
      if (title) title.textContent = '组合净值'
      if (benchWrap) benchWrap.hidden = true
      if (estBox) estBox.innerHTML = ''
      box.innerHTML = '<div class="fin-empty"><p>加载组合历史…</p></div>'
      var allRows = FinanceStore.list()
      Promise.all(allRows.map(function (r) { return FinanceStore.loadHistory(r.code) })).then(function (histArr) {
        var histories = {}
        allRows.forEach(function (r, i) { histories[r.code] = histArr[i] })
        var result = FinanceStore.portfolioSeries(allRows, histories)
        if (!result) {
          box.innerHTML = '<div class="fin-empty"><p>组合历史净值不足</p></div>'
          return
        }
        FinanceCharts.renderPortfolioHistory(box, result, { range: state.range })
      })
      return
    }

    if (state.selectedCode !== row.code) state.selectedCode = row.code
    if (title) title.textContent = row.name + ' · ' + row.code
    if (benchWrap) benchWrap.hidden = false
    if (benchWrap) benchWrap.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b.dataset.bench === (state.benchMode || 'fund')) })
    box.innerHTML = '<div class="fin-empty"><p>加载历史净值…</p></div>'
    var reqCode = row.code
    var costNav = row.shares > 0 && Number.isFinite(row.cost) && row.cost > 0 ? row.cost / row.shares : null
    var benchMode = state.benchMode || 'fund'
    var baseOpts = { range: state.range, navDate: row.navDate, costNav: costNav, benchMode: benchMode }
    Promise.all([FinanceStore.loadHistory(reqCode), FinanceStore.loadEstimate(reqCode)]).then(function (arr) {
      var points = arr[0], doc = arr[1]
      if (state.selectedCode !== reqCode) return // 快速切换时丢弃过期响应
      if (benchMode === 'fund') {
        FinanceCharts.renderNavHistory(box, points, baseOpts)
        renderEstSummary(row)
        return
      }
      var benchSym = benchMode === 'csi' ? 'sh000300' : (doc && doc.refSym)
      var benchName = benchMode === 'csi' ? '沪深300' : (doc && doc.refName) || '跟踪基准'
      FinanceStore.loadBenchmark(benchSym).then(function (bench) {
        if (state.selectedCode !== reqCode) return
        FinanceCharts.renderNavHistory(box, points, Object.assign({}, baseOpts, { bench: bench, benchName: benchName }))
        renderEstSummary(row)
      })
    })
  }

  /* 选中基金的双口径盘中参考摘要（走势卡下方事实说明，不做买卖建议） */
  function renderEstSummary (row) {
    var box = document.getElementById('fin-est-summary')
    if (!box) return
    var er = row.estRef, eh = row.estHold
    if (!er && !eh) { box.innerHTML = '<span class="fin-mute">盘中行情加载中…</span>'; return }
    var erOk = er && er.supported, ehOk = eh && eh.supported
    if (!erOk && !ehOk) {
      var reason = (eh && eh.reason) || (er && er.reason) || 'no-quote'
      box.innerHTML = '<span class="fin-est-na">暂不估算：</span><span class="fin-mute">' +
        esc(estPlain(reason)) + '</span>' +
        '<details class="fin-est-detail"><summary>口径</summary><span class="fin-mute">' +
        esc(estReasonText(reason)) + '</span></details>'
      return
    }
    var html = ''
    if (erOk) {
      var erBasis = er.basis === 'etf' ? '母 ETF 直通' : '跟踪指数直通'
      html += '<span class="fin-est-label">直通参考</span>' +
        '<span class="fin-est fin-est-ref ' + signClass(er.pct) + '">' + fmtRate(er.pct) + '</span>' +
        '<span class="fin-mute">· ' + erBasis + '</span>'
    }
    if (ehOk) {
      var ehBasis = eh.basis === 'bond-proxy'
        ? '债基代理·低覆盖弱参考'
        : '披露权重合计 ' + eh.totalWeight + '%（占净资产）· 行情命中权重 ' + eh.hitWeight + '%（占净资产）· 命中项数 ' + eh.hitItems + '/' + eh.totalItems + '（项数辅助参考）'
      var dayTxt = row.estDay != null ? ' · 参考盈亏 ' + signedMoney(row.estDay) : ''
      if (row.estNavBlocked) ehBasis += ' · ' + blockedReasonText(row.estBlockReason)
      html += (html ? '<span class="fin-est-sep"></span>' : '') +
        '<span class="fin-est-label">重仓推算</span>' +
        '<span class="fin-est fin-est-hold' + ((eh.lowCoverage || row.estNavBlocked) ? ' fin-est-weak' : '') + ' ' + signClass(eh.pct) + '">' + fmtRate(eh.pct) + '</span>' +
        '<span class="fin-mute">· ' + ehBasis + dayTxt + '</span>'
    }
    html += '<span class="fin-mute">（非官方估值，不代表成交净值）</span>'

    var timeBits = [
      '官方净值日 ' + (row.navDate || '未知'),
      '行情时间 ' + fmtQuoteTime(row.estQuoteTime),
      '净值更新 ' + fmtEpoch(row.navUpdatedAt),
      row.estGeneratedAt != null ? '估算生成 ' + fmtEpoch(row.estGeneratedAt) : '估算生成 未生成',
      row.estDoc && row.estDoc.reportDate ? '持仓报告日 ' + row.estDoc.reportDate : '持仓报告日 未知',
      row.estDoc && row.estDoc.source ? '来源 ' + esc(row.estDoc.source) : '来源 未提供',
      row.estDoc && row.estDoc.method ? '方法 ' + esc(row.estDoc.method) : '方法 未提供'
    ]
    html += '<div class="fin-est-times fin-mute">' + timeBits.join('<span class="fin-mute"> · </span>') + '</div>'
    box.innerHTML = html
  }

  /* ---------- 账本流水（只读，来自加密信封内 transactions） ---------- */
  function ledgerSummary (txns) {
    var month = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date()).slice(0, 7)
    var buy = 0, sell = 0, monthBuy = 0, monthSell = 0
    txns.forEach(function (t) {
      var amt = Number(t.amount) || 0
      var inMonth = String(t.date).slice(0, 7) === month
      if (t.action === 'buy' || t.action === 'reinvest') { buy += amt; if (inMonth) monthBuy += amt }
      else if (t.action === 'sell') { sell += amt; if (inMonth) monthSell += amt }
    })
    return { monthBuy: monthBuy, monthSell: monthSell, monthNet: monthBuy - monthSell, totalBuy: buy }
  }

  function txRow (t, nameMap) {
    var cls = (t.action === 'buy' || t.action === 'reinvest') ? 'buy'
      : t.action === 'sell' ? 'sell' : t.action === 'cash_div' ? 'dividend' : ''
    var label = ACTION_LABEL[t.action] || t.action
    var amt
    if (t.action === 'sell') {
      amt = '赎回 ' + Number(t.shares || 0).toFixed(2) + ' 份 · 到账 ¥' + fmtMoney(t.amount)
    } else if (t.action === 'cash_div') {
      amt = '现金分红 ¥' + fmtMoney(t.amount)
    } else if (t.action === 'adjust') {
      var s = Number(t.shares || 0), a = Number(t.amount || 0)
      amt = '份额 ' + (s >= 0 ? '+' : '−') + Math.abs(s).toFixed(2) +
        ' · 成本 ' + (a >= 0 ? '+' : '−') + '¥' + fmtMoney(Math.abs(a))
    } else {
      amt = Number(t.shares || 0).toFixed(2) + ' 份 · ¥' + fmtMoney(t.amount)
    }
    var linkAttr = t.code ? ' data-tx-code="' + esc(t.code) + '"' : ''
    var linkCls = t.code ? ' fin-tx-link' : ''
    return '<div class="fin-tx-item' + linkCls + '"' + linkAttr + '>' +
      '<div class="fin-tx-item-head"><span class="fin-tx-item-type ' + cls + '">' + label + '</span>' +
      '<span class="fin-tx-item-date">' + esc(t.date) + '</span></div>' +
      '<div class="fin-tx-item-name">' + esc(nameMap[t.code] || t.code) + ' · ' + esc(t.code) +
        (t.note ? ' · ' + esc(t.note) : '') + '</div>' +
      '<div class="fin-tx-item-amount">' + amt + '</div>' +
    '</div>'
  }

  function renderDrafts (nameMap) {
    var list = document.getElementById('fin-draft-list')
    if (!list) return
    var drafts = FinanceStore.draftList()
    if (!drafts.length) { list.innerHTML = '<p class="fin-hint">暂无待登记草稿</p>'; return }
    list.innerHTML = drafts.map(function (d, i) {
      var label = ACTION_LABEL[d.action] || d.action
      var cls = d.action === 'sell' ? 'sell' : 'buy'
      return '<div class="fin-tx-item fin-draft-item">' +
        '<div class="fin-tx-item-head"><span class="fin-tx-item-type ' + cls + '">' + esc(label) + '草稿</span>' +
        '<span class="fin-tx-item-date">' + esc(d.date) + '</span></div>' +
        '<div class="fin-tx-item-name">' + esc(nameMap[d.code] || d.code) + ' · ' + esc(d.code) +
          (d.note ? ' · ' + esc(d.note) : '') + '</div>' +
        '<div class="fin-tx-item-amount">' + (Number(d.shares) || 0).toFixed(2) + ' 份 · ¥' + fmtMoney(d.amount) +
          '<button type="button" class="fin-draft-del" data-draft-index="' + i + '">移除</button></div>' +
      '</div>'
    }).join('')
  }

  function renderLedger () {
    var box = document.getElementById('fin-ledger')
    if (!box) return
    var txns = FinanceStore.transactionsOf()
    var nameMap = {}
    FinanceStore.all().forEach(function (r) { nameMap[r.code] = r.name })
    var sum = ledgerSummary(txns)
    var summaryHtml =
      '<div class="fin-ledger-summary">' +
        '<div class="fin-ledger-metric"><small>本月投入</small><b>¥' + fmtMoney(sum.monthBuy) + '</b></div>' +
        '<div class="fin-ledger-metric"><small>本月赎回</small><b>¥' + fmtMoney(sum.monthSell) + '</b></div>' +
        '<div class="fin-ledger-metric"><small>本月净投入</small><b>' + (sum.monthNet >= 0 ? '+' : '−') + '¥' + fmtMoney(Math.abs(sum.monthNet)) + '</b></div>' +
        '<div class="fin-ledger-metric"><small>累计买入</small><b>¥' + fmtMoney(sum.totalBuy) + '</b></div>' +
      '</div>'
    if (!txns.length) {
      box.innerHTML = summaryHtml + '<div class="fin-empty"><p>暂无交易流水</p>' +
        '<p class="fin-hint">当前为期初快照口径，后续买入 / 赎回将在此记录</p></div>'
    } else {
      var sorted = txns.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1 })
      box.innerHTML = summaryHtml + '<div class="fin-tx-list">' + sorted.map(function (t) { return txRow(t, nameMap) }).join('') + '</div>'
    }
    renderDrafts(nameMap)
    var codeSel = document.getElementById('fin-draft-code')
    if (codeSel && codeSel.options.length !== FinanceStore.all().length) {
      codeSel.innerHTML = FinanceStore.all().map(function (r) {
        return '<option value="' + esc(r.code) + '">' + esc(r.name) + ' · ' + esc(r.code) + '</option>'
      }).join('')
    }
  }

  /* 流水点击：跳转持仓视图并定位高亮对应基金 */
  function locateHolding (code) {
    if (!FinanceStore.all().some(function (r) { return r.code === code })) return
    var viewBtn = document.querySelector('[data-fin-view="holdings"]')
    if (viewBtn) viewBtn.click()
    selectCode(code)
    var el = document.querySelector('.fin-fund-item[data-code="' + code + '"]') ||
      document.querySelector('tr[data-code="' + code + '"]')
    if (el) {
      if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el.classList.add('flash')
      setTimeout(function () { el.classList.remove('flash') }, 1600)
    }
  }

  function navDataState (loading) {
    if (!window.FinanceDataState) return null
    var today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date())
    return FinanceDataState.describe(FinanceStore.list(), { loading: loading === undefined ? navLoading : loading, failed: navFailedCount, attempted: lastRefreshOk !== null, hint: navFailureHint }, today)
  }
  function renderNavMeta () {
    var el = document.getElementById('fin-nav-meta')
    if (!el) return
    if (!unlocked) { el.innerHTML = ''; return }
    if (window.FinanceDataState) {
      var info = navDataState()
      el.textContent = info.label + ' · ' + info.detail
      var overview = document.querySelector('.fin-overview')
      if (overview) {
        var strip = document.getElementById('fin-data-status')
        if (!strip) {
          strip = document.createElement('section'); strip.id = 'fin-data-status'; strip.className = 'fin-data-status'; strip.setAttribute('aria-label', '净值数据状态')
          strip.innerHTML = '<div role="status"><strong></strong><span></span></div><button type="button" class="fin-btn"></button>'
          strip.querySelector('button').onclick = function () { refreshNav(true) }
          overview.appendChild(strip)
        }
        strip.dataset.state = info.kind
        var title = strip.querySelector('strong'), description = strip.querySelector('span'), retry = strip.querySelector('button')
        if (title.textContent !== info.label) title.textContent = info.label
        if (description.textContent !== info.detail) description.textContent = info.detail
        retry.textContent = navLoading ? '读取中…' : info.kind === 'error' ? '重试净值' : '核对净值'
        retry.disabled = navLoading || !info.total
      }
      return
    }
    var dt = lastRefreshAt ? new Date(lastRefreshAt).toLocaleString('zh-CN', { hour12: false }) : ''
    var status = ''
    if (lastRefreshOk === true) status = '<span class="fin-nav-ok">净值已更新</span>'
    else if (lastRefreshOk === false) status = '<span class="fin-nav-warn">部分净值拉取失败，沿用缓存/基准值</span>'
    else status = '<span class="fin-mute">尚未联网刷新，展示快照基准净值</span>'
    el.innerHTML = status + (dt ? '<div class="fin-nav-time">更新于 ' + esc(dt) + '</div>' : '')
  }

  /* ================= 净值刷新 ================= */
  function setRefreshState (kind, summary) {
    var btn = document.getElementById('fin-refresh-btn')
    if (!btn) return
    var label = btn.querySelector('.fin-refresh-label')
    if (kind === 'loading') {
      btn.disabled = true
      if (label) label.textContent = '刷新中…'
      return
    }
    btn.disabled = false
    if (label) label.textContent = '刷新净值'
  }

  function refreshNav (manual) {
    if (navRequest) return navRequest
    var codes = FinanceStore.all().map(function (x) { return x.code })
    if (!codes.length) return Promise.resolve()
    navLoading = true
    setRefreshState('loading')
    renderNavMeta()
    if (manual) window.BikoFeedback?.show('正在刷新净值…', { kind: 'loading' })
    var abort = new AbortController(), timeout = setTimeout(function () { abort.abort() }, 12000)
    navFailureHint = ''
    navRequest = fetch('/api/fund/batch?codes=' + encodeURIComponent(codes.join(',')), { signal: abort.signal })
      .then(function (r) {
        if (!r.ok) {
          var error = new Error('HTTP ' + r.status)
          error.status = r.status
          throw error
        }
        return r.json()
      })
      .then(function (data) {
        var items = (data && data.items) || {}
        var fail = 0
        var errors = []
        codes.forEach(function (code) {
          var it = items[code]
          if (it && it.ok) {
            FinanceStore.updateNav(code, { nav: it.nav, navDate: it.navDate, changePct: it.changePct })
          } else { fail++; if (it && it.error) errors.push(String(it.error)) }
        })
        lastRefreshAt = Date.now()
        lastRefreshOk = fail === 0
        navFailedCount = fail
        navFailureHint = fail ? describeNavFailure(errors[0]) : ''
        if (fail === 0) pendingRefresh = false
        setRefreshState(fail ? 'fail' : 'ok', fail)
        if (manual) {
          var info = navDataState(false)
          var message = fail ? fail + ' 只净值未更新，已保留缓存。' + (navFailureHint ? ' ' + navFailureHint + '。' : '') : info?.stale ? '净值已读取，' + info.stale + ' 只日期仍待核对。' : '净值读取完成，请按净值日期查看。'
          window.BikoFeedback?.show(message, { kind: fail ? 'error' : info?.stale ? 'info' : 'success', retry: fail ? function () { return refreshNav(true) } : null })
        }
      })
      .catch(function (err) {
        lastRefreshOk = false
        navFailedCount = codes.length
        navFailureHint = err && err.status
          ? ([404, 405, 501].includes(err.status) ? '当前静态预览未运行数据接口，请用 npm run preview' : '数据接口返回 HTTP ' + err.status)
          : abort.signal.aborted ? '请求超时，请稍后重试' : '接口未连接或网络中断，请检查网络后重试'
        setRefreshState('fail')
        if (manual) window.BikoFeedback?.show('净值刷新失败，仍显示缓存数据。'+(navFailureHint ? ' '+navFailureHint+'。' : ''), { kind: 'error', retry: function () { return refreshNav(true) } })
      })
      .finally(function () { clearTimeout(timeout); navLoading = false; navRequest = null; renderAll() })
    return navRequest
  }

  function describeNavFailure (message) {
    var match = String(message || '').match(/(?:upstream )?HTTP\s*(\d{3})/i)
    if (match) return '上游数据源返回 HTTP ' + match[1]
    if (/timeout|timed out|abort/i.test(message || '')) return '上游请求超时'
    if (/empty nav list|bad nav|invalid json/i.test(message || '')) return '上游未返回有效净值'
    return '上游数据暂不可用'
  }

  /* ================= 盘中行情（直通列 + 持仓推算列 + 指数快照共用一个批量代理） ================= */
  function collectEstSyms (doc, out) {
    if (!doc) return
    if (doc.ref && doc.ref.supported && doc.ref.sym) out.push(doc.ref.sym)
    if (doc.hold && doc.hold.supported) {
      ;(doc.hold.items || []).forEach(function (it) { if (it.sym) out.push(it.sym) })
      ;(doc.hold.proxyItems || []).forEach(function (it) { if (it.sym) out.push(it.sym) })
    }
  }

  function refreshQuote () {
    var codes = FinanceStore.all().map(function (x) { return x.code })
    if (!codes.length) return Promise.resolve()
    var docs = {}, syms = []
    return Promise.all(codes.map(function (c) { return FinanceStore.loadEstimate(c) }))
      .then(function (arr) {
        arr.forEach(function (d, i) { if (d) { docs[codes[i]] = d; collectEstSyms(d, syms) } })
        return fetch('/finance/data/market.json', { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : null }).catch(function () { return null })
      })
      .then(function (market) {
        marketCache = market || null
        ;(marketCache || []).forEach(function (c) { if (c.sym) syms.push(c.sym) })
        FinanceStore.setEstimateDocs(docs)
        var uniq = Array.from(new Set(syms))
        if (!uniq.length) { renderQuotePanel(); return }
        return fetch('/api/quote/batch?syms=' + encodeURIComponent(uniq.join(',')))
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
          .then(function (data) {
            FinanceStore.setQuotes((data && data.items) || {}, {
              fetchedAt: (data && data.fetchedAt) || 0, failed: (data && data.failed) || []
            })
            lastQuoteAt = Date.now()
          })
          .catch(function () {
            FinanceStore.setQuotes({}, { fetchedAt: 0, failed: codes, ok: false })
          })
          .finally(function () { renderQuotePanel() })
      })
  }

  function renderMarket () {
    var box = document.getElementById('fin-market')
    if (!box) return
    if (!marketCache) {
      box.innerHTML = '<div class="fin-mkt-meta fin-mute">市场行情加载中…</div>'
      fetch('/finance/data/market.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null })
        .then(function (cfg) { marketCache = cfg || null; renderMarket() })
        .catch(function () {})
      return
    }
    if (breadthCache === null) {
      fetch('/finance/data/market-breadth.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null })
        .then(function (cfg) { breadthCache = cfg || null; renderMarket() })
        .catch(function () { breadthCache = false })
    }
    var meta = FinanceStore.getQuoteMeta()
    var open = window.FinanceEstimate && FinanceEstimate.marketSession() === 'open'
    var groups = []
    var groupIndex = {}
    marketCache.forEach(function (c) {
      var g = c.group || '其他'
      if (!groupIndex[g]) { groupIndex[g] = []; groups.push(g) }
      groupIndex[g].push(c)
    })
    var groupsHtml = groups.map(function (g) {
      var chips = groupIndex[g].map(marketChip).join('')
      return '<section class="fin-mkt-group"><div class="fin-mkt-group-label">' + esc(g) + '</div>' +
        '<div class="fin-mkt-row">' + chips + '</div></section>'
    }).join('')
    var breadth = breadthHtml()
    var timeTxt = meta.fetchedAt ? ' · 行情 ' + new Date(meta.fetchedAt).toLocaleTimeString('zh-CN', { hour12: false }) : ''
    var stateTxt = open ? '盘中实时参考' : '非交易时段 · 最近收盘行情'
    box.innerHTML = '<div class="fin-mkt-groups">' + groupsHtml + '</div>' + breadth +
      '<div class="fin-mkt-meta">' + stateTxt + timeTxt +
      '<span class="fin-mkt-note">仅展示公开指数 / ETF 涨跌事实，不作走势预测与买卖建议</span></div>'
  }

  function marketChip (c) {
    var q = FinanceStore.getQuote(c.sym)
    var pct = (q && typeof q.pct === 'number' && isFinite(q.pct)) ? q.pct : null
    var price = (q && typeof q.price === 'number' && isFinite(q.price)) ? q.price : null
    var cls = pct == null ? 'fin-mute' : (pct >= 0 ? 'positive' : 'negative')
    var priceTxt = price == null ? '--' : fmtMktPrice(price)
    var val = pct == null ? '--' : fmtRate(pct)
    return '<span class="fin-mkt-chip">' +
      '<span class="fin-mkt-label">' + esc(c.label) + '</span>' +
      '<span class="fin-mkt-price">' + priceTxt + '</span>' +
      '<span class="' + cls + '">' + val + '</span></span>'
  }

  function breadthHtml () {
    var b = breadthCache && breadthCache.summary
    if (!b) return ''
    var cells = []
    if (isFinite(b.up)) cells.push('<span class="positive">上涨 ' + b.up + '</span>')
    if (isFinite(b.down)) cells.push('<span class="negative">下跌 ' + b.down + '</span>')
    if (isFinite(b.flat)) cells.push('<span class="fin-mute">平盘 ' + b.flat + '</span>')
    if (isFinite(b.limitUp)) cells.push('<span class="positive">涨停 ' + b.limitUp + '</span>')
    if (isFinite(b.limitDown)) cells.push('<span class="negative">跌停 ' + b.limitDown + '</span>')
    if (isFinite(b.amountCny)) cells.push('<span class="fin-mute">成交额 ' + fmtAmount(b.amountCny) + '</span>')
    if (!cells.length) return ''
    var asOf = breadthCache.asOf ? '<span class="fin-mute">广度 ' + esc(breadthCache.asOf) + '</span>' : ''
    return '<div class="fin-mkt-breadth">' + cells.join('<span class="fin-mkt-dot">·</span>') + asOf + '</div>'
  }

  /* ================= 事件 ================= */
  function bindEvents () {
    document.addEventListener('finance:workspace-ready', renderNavMeta)
    var form = document.getElementById('finGateForm') || document.getElementById('finGate')
    if (form) {
      form.addEventListener('submit', onGateSubmit)
      form.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (gateComposing || e.isComposing || e.keyCode === 229)) e.preventDefault()
      })
    }
    var passInput = document.getElementById('finGatePass')
    // Native password fields can disable the Windows IME. Where supported,
    // keep a text editor for composition and conceal glyphs without switching type.
    var imeMask = !!(passInput && window.CSS && CSS.supports && CSS.supports('-webkit-text-security', 'disc'))
    if (passInput) {
      if (imeMask) { passInput.style.webkitTextSecurity = 'disc'; passInput.type = 'text' }
      passInput.addEventListener('compositionstart', function () { gateComposing = true })
      passInput.addEventListener('compositionend', function () { gateComposing = false })
      passInput.addEventListener('input', function () { var err = document.getElementById('finGateErr'); if (err) err.hidden = true })
    }
    var reveal = document.getElementById('finGateReveal')
    if (reveal && passInput) {
      reveal.title = imeMask ? '显示口令' : '显示口令后可使用中文输入法'
      reveal.setAttribute('aria-label', imeMask ? '显示口令' : '显示口令（可输入中文）')
    }
    if (reveal && passInput) reveal.addEventListener('click', function () {
      var visible = reveal.getAttribute('aria-pressed') !== 'true'
      if (imeMask) passInput.style.webkitTextSecurity = visible ? 'none' : 'disc'
      else passInput.type = visible ? 'text' : 'password'
      reveal.setAttribute('aria-pressed', String(visible))
      reveal.setAttribute('aria-label', visible ? '隐藏口令' : (imeMask ? '显示口令' : '显示口令（可输入中文）'))
      reveal.title = visible ? '隐藏口令' : (imeMask ? '显示口令' : '显示口令后可使用中文输入法')
      passInput.focus({ preventScroll: true })
    })

    var refreshBtn = document.getElementById('fin-refresh-btn')
    if (refreshBtn) refreshBtn.addEventListener('click', function () {
      refreshNav(true).then(function () { refreshQuote() })
    })

    document.getElementById('fin-filter-chips').addEventListener('click', function (e) {
      var btn = e.target.closest('.fin-chip')
      if (!btn) return
      state.category = btn.dataset.cat
      state.selectedCode = null
      renderChips()
      renderList()
      renderTable()
      renderHistory()
      renderCount()
    })

    var profitWrap = document.getElementById('fin-profit-chips')
    if (profitWrap) profitWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.fin-chip')
      if (!btn) return
      state.profitFilter = btn.dataset.profit
      state.selectedCode = null
      renderProfitChips()
      renderList()
      renderTable()
      renderHistory()
      renderCount()
    })

    var themeBtn = document.getElementById('fin-theme-toggle')
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme)
    document.addEventListener('input',function(e){if(e.target.id==='fin-fund-search'){state.search=e.target.value.trim().toLowerCase();state.selectedCode=null;renderList();renderTable();renderHistory();renderCount()}})
    document.addEventListener('change',function(e){if(e.target.id==='fin-fund-sort'){state.sort=e.target.value;renderList();renderTable();renderCount()}})
    document.addEventListener('click',function(e){var mode=e.target.closest('[data-fin-mode]');if(!mode)return;state.display=mode.dataset.finMode==='reference'?'reference':'confirmed';renderList()})

    var fundList = document.getElementById('fin-fund-list')
    if (fundList) fundList.addEventListener('click', function (e) {
      if (e.target.closest('[data-fin-reset]')) {
        state.category = 'all'; state.search = ''; state.profitFilter = 'all'; state.selectedCode = null
        var search = document.getElementById('fin-fund-search'); if (search) search.value = ''
        renderChips(); renderProfitChips(); renderList(); renderTable(); renderHistory(); renderCount(); return
      }
      var item = e.target.closest('.fin-fund-item')
      if (item) selectCode(item.dataset.code)
    })

    var tableBody = document.getElementById('fin-table-body')
    if (tableBody) tableBody.addEventListener('click', function (e) {
      var tr = e.target.closest('tr[data-code]')
      if (tr) selectCode(tr.dataset.code)
    })

    var rangeWrap = document.getElementById('fin-history-range')
    if (rangeWrap) rangeWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-range]')
      if (!btn) return
      state.range = btn.dataset.range
      rangeWrap.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === btn) })
      renderHistory()
    })

    var benchWrap = document.getElementById('fin-history-bench')
    if (benchWrap) benchWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-bench]')
      if (!btn) return
      state.benchMode = btn.dataset.bench
      benchWrap.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === btn) })
      renderHistory()
    })

    var scopeWrap = document.getElementById('fin-history-scope')
    if (scopeWrap) scopeWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-scope]')
      if (!btn) return
      state.chartScope = btn.dataset.scope
      scopeWrap.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === btn) })
      renderHistory()
    })

    var draftForm = document.getElementById('fin-draft-form')
    if (draftForm) {
      var draftDate = document.getElementById('fin-draft-date')
      if (draftDate && !draftDate.value) draftDate.value = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date())
      draftForm.addEventListener('submit', function (e) {
        e.preventDefault()
        var code = document.getElementById('fin-draft-code').value
        var action = document.getElementById('fin-draft-action').value
        var amount = Number(document.getElementById('fin-draft-amount').value)
        var shares = Number(document.getElementById('fin-draft-shares').value)
        var date = draftDate.value
        if (!code || !Number.isFinite(amount) || amount <= 0 || !date) return
        var ok = FinanceStore.draftAdd({ code: code, action: action, amount: amount, shares: Number.isFinite(shares) ? shares : 0, date: date, note: '' })
        if (ok) {
          document.getElementById('fin-draft-amount').value = ''
          document.getElementById('fin-draft-shares').value = ''
          renderLedger()
        }
      })
    }

    document.addEventListener('click', function (e) {
      var del = e.target.closest('[data-draft-index]')
      if (del) { FinanceStore.draftRemove(Number(del.dataset.draftIndex)); renderLedger(); return }
      var tx = e.target.closest('[data-tx-code]')
      if (tx) locateHolding(tx.dataset.txCode)
    })

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var gate = document.getElementById('finGate')
        if (gate && !gate.hidden) gate.querySelector('#finGatePass') && gate.querySelector('#finGatePass').focus()
      }
    })
  }

  function toggleTheme () {
    var html = document.documentElement
    var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    html.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', JSON.stringify({ value: next, expiry: Date.now() + 7 * 864e5 })) } catch (e) {}
    syncThemeUI()
  }

  function syncThemeUI () {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark'
    var icon = document.querySelector('#fin-theme-toggle i')
    if (icon) icon.className = dark ? 'fas fa-sun' : 'fas fa-moon'
    var button = document.getElementById('fin-theme-toggle')
    if (button) button.setAttribute('aria-label', dark ? '切换到浅色' : '切换到深色')
    var meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', dark ? '#0d1018' : '#f2f5fa')
  }

  /* 启动 */
  bindEvents()
  syncThemeUI()
  bootUnlock()
})()
