/* ============================================================
 *  图表 —— 纯 HTML/CSS + 内联 SVG（不依赖 ECharts / CDN）
 *  · renderAllocation：堆叠条展示五大类市值占比；图例展示各类市值、占比、只数。
 *  · renderNavHistory：单只基金历史单位净值折线（3M / 6M / 1Y 前端按日期过滤）。
 * ============================================================ */
(function (global) {
  'use strict'

  var CATEGORY_COLORS = {
    equity: '#e0655a',
    bond: '#6aa6d8',
    index: '#8f7fd6',
    gold: '#d8a94e',
    qdii: '#5fb89a',
    other: '#9aa7b8'
  }

  function fmtMoney (n) {
    return Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function esc (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  /* agg: [{key,label,value,cost,count}]；totalValue: 组合总市值；opts.penetration: 研究快照穿透汇总 */
  function renderAllocation (container, agg, totalValue, opts) {
    if (!container) return
    if (!agg || !agg.length) {
      container.innerHTML = '<div class="fin-empty"><p>暂无配置数据</p></div>'
      return
    }
    var total = totalValue || agg.reduce(function (s, a) { return s + a.value }, 0)
    var segments = agg.map(function (a) {
      var pct = total > 0 ? (a.value / total) * 100 : 0
      var color = CATEGORY_COLORS[a.key] || CATEGORY_COLORS.other
      return '<div class="fin-alloc-seg" style="flex:' + pct.toFixed(3) + ';background:' + color + '" ' +
        'title="' + esc(a.label) + ' ' + pct.toFixed(1) + '%"></div>'
    }).join('')

    var legend = agg.map(function (a) {
      var pct = total > 0 ? (a.value / total) * 100 : 0
      var color = CATEGORY_COLORS[a.key] || CATEGORY_COLORS.other
      return '<div class="fin-alloc-legend-item">' +
        '<span class="fin-alloc-dot" style="background:' + color + '"></span>' +
        '<span class="fin-alloc-legend-label">' + esc(a.label) + '</span>' +
        '<span class="fin-alloc-legend-value">¥' + fmtMoney(a.value) + '</span>' +
        '<span class="fin-alloc-legend-pct">' + pct.toFixed(1) + '%</span>' +
        '<span class="fin-alloc-legend-count">' + a.count + ' 只</span>' +
        '</div>'
    }).join('')

    var detailHtml = (opts && opts.penetration) ? allocationDetail(opts.penetration) : ''

    container.innerHTML =
      '<div class="fin-alloc-bar" role="img" aria-label="资产配置占比堆叠条">' + segments + '</div>' +
      '<div class="fin-alloc-legend">' + legend + '</div>' + detailHtml
  }

  /* 披露行业穿透二级区：行业权重汇总自研究快照披露持仓；未映射仓位明确标注，不臆造行业。 */
  function allocationDetail (pen) {
    var cov = Math.min(100, Math.max(0, Number(pen.coverage) || 0))
    var unk = Math.max(0, Number.isFinite(Number(pen.unknown)) ? Number(pen.unknown) : 100 - cov)
    var inds = (pen.industries || []).slice(0, 5)
    var rest = (pen.industries || []).length - inds.length
    var overlap = (pen.securities || []).filter(function (s) { return s.funds && s.funds.length > 1 }).slice(0, 3)

    var bar = '<div class="fin-pen-bar">' +
      '<div class="fin-pen-disclosed" style="flex:' + cov.toFixed(3) + '"></div>' +
      '<div class="fin-pen-unknown" style="flex:' + unk.toFixed(3) + '"></div></div>'

    var indLegend = inds.map(function (i) {
      return '<span class="fin-pen-ind"><span class="fin-alloc-dot"></span>' + esc(i.name) + ' ' + Number(i.pct).toFixed(1) + '%</span>'
    }).join('')
    if (rest > 0) indLegend += '<span class="fin-pen-ind fin-mute">其他 ' + rest + ' 个行业</span>'

    var head = '<div class="fin-pen-head"><span>披露行业穿透</span>' +
      '<span class="fin-mute">已披露 ' + cov.toFixed(1) + '% · 未映射 ' + unk.toFixed(1) + '%</span></div>'
    var overlapHtml = overlap.length
      ? '<div class="fin-pen-overlap">共同持有 ' + overlap.map(function (o) { return esc(o.name) + '（' + o.funds.length + ' 只）' }).join('、') + '</div>'
      : ''

    return '<div class="fin-pen">' + head + bar + '<div class="fin-pen-legend">' + indLegend + '</div>' + overlapHtml + '</div>'
  }

  /* ---------- 历史净值折线（纯 SVG，无依赖） ---------- */
  var RANGE_DAYS = { '3m': 91, '6m': 183, '1y': 366 }

  function shiftDays (iso, delta) {
    var d = new Date(iso + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    var m = String(d.getMonth() + 1).padStart(2, '0')
    var day = String(d.getDate()).padStart(2, '0')
    return d.getFullYear() + '-' + m + '-' + day
  }

  function filterByRange (points, range) {
    if (!points || !points.length) return []
    var days = RANGE_DAYS[range] || RANGE_DAYS['1y']
    var cutoff = shiftDays(points[points.length - 1].d, -days)
    var out = points.filter(function (p) { return p.d >= cutoff })
    if (out.length < 2) out = points.slice() // 窗口内点太少则放宽到全量
    return out
  }

  function fmtNav (v) { return Number(v).toFixed(4) }

  /* points: [{d,nav,pct}] 升序；opts.range / costNav / navDate；
     opts.benchMode: 'fund'|'track'|'csi'；opts.bench: [{d,nav}]；opts.benchName */
  function renderNavHistory (container, points, opts) {
    if (!container) return
    opts = opts || {}
    var range = opts.range || '1y'
    var data = filterByRange(points, range)

    if (!data || data.length < 2) {
      container.innerHTML =
        '<div class="fin-empty"><i class="fa-solid fa-chart-line"></i>' +
        '<p>暂无历史净值走势</p>' +
        '<p class="fin-hint">新基金成立较晚或历史尚未抓取，可稍后点“刷新净值”重试</p></div>'
      return
    }

    var overlay = opts.benchMode === 'track' || opts.benchMode === 'csi'
    var bench = overlay && opts.bench ? filterByRange(opts.bench, range) : null

    if (!overlay || !bench || bench.length < 2) {
      drawSingle(container, data, opts, overlay ? (opts.benchName || '基准') : null)
      return
    }
    drawOverlay(container, data, bench, opts)
  }

  function drawSingle (container, data, opts, benchMissingName) {
    var n = data.length
    var navs = data.map(function (p) { return p.nav })
    var min = Math.min.apply(null, navs)
    var max = Math.max.apply(null, navs)
    if (max === min) max = min + 1e-6
    var span = max - min
    min -= span * 0.08
    max += span * 0.08

    var W = 640, H = 216, padL = 50, padR = 16, padT = 16, padB = 26
    var x = function (i) { return padL + (i / (n - 1)) * (W - padL - padR) }
    var y = function (v) { return padT + (1 - (v - min) / (max - min)) * (H - padT - padB) }

    var line = data.map(function (p, i) {
      return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.nav).toFixed(1)
    }).join(' ')
    var area = line + ' L' + x(n - 1).toFixed(1) + ' ' + (H - padB) +
      ' L' + x(0).toFixed(1) + ' ' + (H - padB) + ' Z'

    var first = data[0].nav, last = data[n - 1].nav
    var chg = (last - first) / first * 100
    var up = chg >= 0
    var lineColor = up ? 'var(--fin-profit)' : 'var(--fin-loss)'

    var grid = ''
    for (var g = 0; g <= 3; g++) {
      var gv = min + (max - min) * (g / 3)
      var gy = y(gv)
      grid += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) +
        '" y2="' + gy.toFixed(1) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4"/>'
      grid += '<text x="' + (padL - 6) + '" y="' + (gy + 3).toFixed(1) +
        '" text-anchor="end" font-size="10" fill="var(--fin-fg-mute)">' + gv.toFixed(3) + '</text>'
    }

    var xLabels =
      '<text x="' + padL + '" y="' + (H - 8) + '" font-size="10" fill="var(--fin-fg-mute)">' + data[0].d + '</text>' +
      '<text x="' + (W - padR) + '" y="' + (H - 8) + '" text-anchor="end" font-size="10" fill="var(--fin-fg-mute)">' + data[n - 1].d + '</text>'

    var lastPt = data[n - 1]
    var lastPct = lastPt.pct
    var lastPctHtml = (lastPct == null || !Number.isFinite(lastPct)) ? ''
      : '<em class="' + (lastPct >= 0 ? 'up' : 'down') + '">' + (lastPct >= 0 ? '+' : '') + lastPct.toFixed(2) + '%</em>'

    var rangeLabel = opts.range === '3m' ? '近 3 月' : opts.range === '6m' ? '近 6 月' : '近 1 年'
    var high = Math.max.apply(null, navs), low = Math.min.apply(null, navs)

    var costNav = Number(opts.costNav)
    var hasCost = Number.isFinite(costNav) && costNav > 0
    var costInside = hasCost && costNav >= low && costNav <= high
    var costY = !hasCost ? null : (costInside ? y(costNav) : (costNav > high ? padT : H - padB))
    var costLabel = !hasCost ? '' : (costInside ? '成本 ' + fmtNav(costNav) : (costNav > high ? '成本高于本区间' : '成本低于本区间'))
    var costLabelY = !hasCost ? 0 : (costNav > high ? costY + 13 : costY - 5)

    var costLine = hasCost
      ? '<line x1="' + padL + '" y1="' + costY.toFixed(1) + '" x2="' + (W - padR) +
        '" y2="' + costY.toFixed(1) + '" stroke="var(--fin-fg-mute)" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.85"/>' +
        '<text x="' + (W - padR) + '" y="' + costLabelY.toFixed(1) + '" text-anchor="end" font-size="10" fill="var(--fin-fg-mute)">' +
        esc(costLabel) + '</text>'
      : ''

    var benchNote = benchMissingName ? ' · ' + esc(benchMissingName) + '历史未落档，仅显示基金' : ''

    container.innerHTML =
      '<div class="fin-history-meta">' +
        '<span class="fin-hi-latest">历史末点 '+esc(lastPt.d)+' <b>' + fmtNav(last) + '</b>' + lastPctHtml + (opts.navDate&&opts.navDate>lastPt.d?' · 历史序列落后于持仓净值':'') + '</span>' +
        '<span class="fin-hi-range">' + rangeLabel + '涨跌 <b class="' + (up ? 'up' : 'down') + '">' +
          (up ? '+' : '') + chg.toFixed(2) + '%</b>' +
          '<span class="fin-hi-hl">区间高 ' + high.toFixed(4) + ' / 低 ' + low.toFixed(4) + '</span></span>' +
      '</div>' +
      '<svg class="fin-history-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="历史净值折线">' +
        '<path d="' + area + '" fill="' + lineColor + '" opacity="0.10"/>' +
        '<path d="' + line + '" fill="none" stroke="' + lineColor + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        grid + xLabels + costLine +
        '<circle cx="' + x(n - 1).toFixed(1) + '" cy="' + y(last).toFixed(1) +
          '" r="3.4" fill="' + lineColor + '"/>' +
      '</svg>' +
      '<div class="fin-hi-foot">' + data[0].d + ' ～ ' + data[n - 1].d + ' · ' + n + ' 个净值点 · 单位净值（非复权）' +
      (hasCost ? ' · 虚线为持仓成本折算单位净值' : '') + benchNote + '</div>'
  }

  /* 双序列对照：基金与基准按共同起点归一化到 1.000，基准按交易日前向填充对齐到基金日期。 */
  function drawOverlay (container, fundPts, benchPts, opts) {
    var range = opts.range || '1y'
    var fundStart = fundPts[0].d
    var benchStart = benchPts[0].d
    var startD = benchStart > fundStart ? benchStart : fundStart
    var fund = fundPts.filter(function (p) { return p.d >= startD })
    var bench = benchPts.filter(function (p) { return p.d >= startD })
    if (fund.length < 2 || bench.length < 2) {
      drawSingle(container, fundPts, opts, opts.benchName || '基准')
      return
    }

    var fundBase = fund[0].nav
    var benchBase = bench[0].nav
    var benchByDate = {}
    bench.forEach(function (p) { benchByDate[p.d] = p.nav })
    var benchDates = bench.map(function (p) { return p.d })
    function benchNavOn (d) {
      var best = null
      for (var i = 0; i < benchDates.length; i++) {
        if (benchDates[i] <= d) best = bench[i].nav; else break
      }
      return best
    }

    var fundIdx = fund.map(function (p) { return { d: p.d, v: p.nav / fundBase, pct: p.pct } })
    var benchAligned = fund.map(function (p) {
      var b = benchNavOn(p.d)
      return b == null ? null : { d: p.d, v: b / benchBase }
    }).filter(Boolean)
    if (benchAligned.length < 2) {
      drawSingle(container, fundPts, opts, opts.benchName || '基准')
      return
    }

    var n = fundIdx.length
    var allV = fundIdx.map(function (q) { return q.v }).concat(benchAligned.map(function (q) { return q.v }))
    var min = Math.min.apply(null, allV)
    var max = Math.max.apply(null, allV)
    if (max === min) max = min + 1e-6
    var span = max - min
    min -= span * 0.08
    max += span * 0.08

    var W = 640, H = 216, padL = 50, padR = 16, padT = 16, padB = 26
    var x = function (i) { return padL + (i / (n - 1)) * (W - padL - padR) }
    var y = function (v) { return padT + (1 - (v - min) / (max - min)) * (H - padT - padB) }

    var fundLine = fundIdx.map(function (p, i) {
      return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1)
    }).join(' ')
    var benchIdxByX = {}
    benchAligned.forEach(function (p) {
      var idx = fundIdx.findIndex(function (q) { return q.d === p.d })
      if (idx >= 0) benchIdxByX[idx] = p.v
    })
    var benchPtsOn = Object.keys(benchIdxByX).map(function (k) {
      var i = Number(k)
      return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(benchIdxByX[i]).toFixed(1)
    }).join(' ')

    var fundEnd = fundIdx[n - 1].v
    var benchEnd = benchAligned[benchAligned.length - 1].v
    var fundChg = (fundEnd - 1) * 100
    var benchChg = (benchEnd - 1) * 100
    var excess = fundChg - benchChg
    var fundUp = fundChg >= 0
    var fundColor = fundUp ? 'var(--fin-profit)' : 'var(--fin-loss)'
    var benchColor = 'var(--fin-fg-mute)'

    var grid = ''
    for (var g = 0; g <= 3; g++) {
      var gv = min + (max - min) * (g / 3)
      var gy = y(gv)
      grid += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) +
        '" y2="' + gy.toFixed(1) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4"/>'
      grid += '<text x="' + (padL - 6) + '" y="' + (gy + 3).toFixed(1) +
        '" text-anchor="end" font-size="10" fill="var(--fin-fg-mute)">' + gv.toFixed(3) + '</text>'
    }

    var xLabels =
      '<text x="' + padL + '" y="' + (H - 8) + '" font-size="10" fill="var(--fin-fg-mute)">' + fundIdx[0].d + '</text>' +
      '<text x="' + (W - padR) + '" y="' + (H - 8) + '" text-anchor="end" font-size="10" fill="var(--fin-fg-mute)">' + fundIdx[n - 1].d + '</text>'

    // 持仓成本折算到归一口径；落在区间外时夹取到图边并标注方向
    var costNav = Number(opts.costNav)
    var hasCost = Number.isFinite(costNav) && costNav > 0
    var costIdx = hasCost ? costNav / fundBase : null
    var costInside = hasCost && costIdx >= min && costIdx <= max
    var costY = !hasCost ? null : (costInside ? y(costIdx) : (costIdx > max ? padT : H - padB))
    var costLabel = !hasCost ? '' : (costInside ? '成本' : (costIdx > max ? '成本高于本区间' : '成本低于本区间'))
    var costLabelY = !hasCost ? 0 : (costIdx > max ? costY + 13 : costY - 5)
    var costLine = hasCost
      ? '<line x1="' + padL + '" y1="' + costY.toFixed(1) + '" x2="' + (W - padR) +
        '" y2="' + costY.toFixed(1) + '" stroke="var(--fin-fg-mute)" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.6"/>' +
        '<text x="' + (W - padR) + '" y="' + costLabelY.toFixed(1) + '" text-anchor="end" font-size="10" fill="var(--fin-fg-mute)">' +
        esc(costLabel) + '</text>'
      : ''

    var rangeLabel = range === '3m' ? '近 3 月' : range === '6m' ? '近 6 月' : '近 1 年'
    var legend =
      '<span class="fin-hi-legend"><span class="fin-hi-legend-dot" style="background:' + fundColor + '"></span>基金</span>' +
      '<span class="fin-hi-legend"><span class="fin-hi-legend-dot bench" style="background:' + benchColor + '"></span>' + esc(opts.benchName || '基准') + '</span>'

    container.innerHTML =
      '<div class="fin-history-meta">' +
        '<span class="fin-hi-legend-row">' + legend + '</span>' +
        '<span class="fin-hi-range">' + rangeLabel + ' 基金 <b class="' + (fundUp ? 'up' : 'down') + '">' +
          (fundUp ? '+' : '') + fundChg.toFixed(2) + '%</b> · 基准 <b class="' + (benchChg >= 0 ? 'up' : 'down') + '">' +
          (benchChg >= 0 ? '+' : '') + benchChg.toFixed(2) + '%</b> · 超额 <b class="' + (excess >= 0 ? 'up' : 'down') + '">' +
          (excess >= 0 ? '+' : '') + excess.toFixed(2) + 'pp</b></span>' +
      '</div>' +
      '<svg class="fin-history-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="基金与基准归一化对照折线">' +
        '<path d="' + fundLine + '" fill="none" stroke="' + fundColor + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="' + benchPtsOn + '" fill="none" stroke="' + benchColor + '" stroke-width="1.5" stroke-dasharray="5 4" stroke-linejoin="round"/>' +
        grid + xLabels + costLine +
        '<circle cx="' + x(n - 1).toFixed(1) + '" cy="' + y(fundEnd).toFixed(1) + '" r="3.4" fill="' + fundColor + '"/>' +
      '</svg>' +
      '<div class="fin-hi-foot">' + fundIdx[0].d + ' ～ ' + fundIdx[n - 1].d + ' · 双序列起点归一化 1.000' +
      ' · 基准为未复权点位，不含分红再投资' + (hasCost ? ' · 虚线为持仓成本折算' : '') + '</div>'
  }

  /* 组合净值：归一化指数单线；口径为当前份额 × 历史净值，不还原历史申赎现金流。 */
  function renderPortfolioHistory (container, result, opts) {
    if (!container) return
    opts = opts || {}
    var range = opts.range || '1y'
    var data = filterByRange(result.points, range)

    if (!data || data.length < 2) {
      container.innerHTML =
        '<div class="fin-empty"><i class="fa-solid fa-chart-line"></i>' +
        '<p>组合历史净值不足</p>' +
        '<p class="fin-hint">持仓历史尚未抓取或样本过短，可稍后点“刷新净值”重试</p></div>'
      return
    }

    var n = data.length
    var vals = data.map(function (p) { return p.nav })
    var min = Math.min.apply(null, vals)
    var max = Math.max.apply(null, vals)
    if (max === min) max = min + 1e-6
    var span = max - min
    min -= span * 0.08
    max += span * 0.08

    var W = 640, H = 216, padL = 50, padR = 16, padT = 16, padB = 26
    var x = function (i) { return padL + (i / (n - 1)) * (W - padL - padR) }
    var y = function (v) { return padT + (1 - (v - min) / (max - min)) * (H - padT - padB) }

    var line = data.map(function (p, i) {
      return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.nav).toFixed(1)
    }).join(' ')
    var area = line + ' L' + x(n - 1).toFixed(1) + ' ' + (H - padB) +
      ' L' + x(0).toFixed(1) + ' ' + (H - padB) + ' Z'

    var last = vals[n - 1]
    var chg = (last - 1) * 100
    var up = chg >= 0
    var lineColor = up ? 'var(--fin-profit)' : 'var(--fin-loss)'

    var grid = ''
    for (var g = 0; g <= 3; g++) {
      var gv = min + (max - min) * (g / 3)
      var gy = y(gv)
      grid += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) +
        '" y2="' + gy.toFixed(1) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4"/>'
      grid += '<text x="' + (padL - 6) + '" y="' + (gy + 3).toFixed(1) +
        '" text-anchor="end" font-size="10" fill="var(--fin-fg-mute)">' + gv.toFixed(3) + '</text>'
    }

    var xLabels =
      '<text x="' + padL + '" y="' + (H - 8) + '" font-size="10" fill="var(--fin-fg-mute)">' + data[0].d + '</text>' +
      '<text x="' + (W - padR) + '" y="' + (H - 8) + '" text-anchor="end" font-size="10" fill="var(--fin-fg-mute)">' + data[n - 1].d + '</text>'

    var rangeLabel = range === '3m' ? '近 3 月' : range === '6m' ? '近 6 月' : '近 1 年'

    container.innerHTML =
      '<div class="fin-history-meta">' +
        '<span class="fin-hi-latest">组合末点 '+esc(data[n - 1].d)+' <b>' + last.toFixed(4) + '</b></span>' +
        '<span class="fin-hi-range">' + rangeLabel + ' 涨跌 <b class="' + (up ? 'up' : 'down') + '">' +
          (up ? '+' : '') + chg.toFixed(2) + '%</b></span>' +
      '</div>' +
      '<svg class="fin-history-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="组合归一化净值折线">' +
        '<path d="' + area + '" fill="' + lineColor + '" opacity="0.10"/>' +
        '<path d="' + line + '" fill="none" stroke="' + lineColor + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        grid + xLabels +
        '<circle cx="' + x(n - 1).toFixed(1) + '" cy="' + y(last).toFixed(1) + '" r="3.4" fill="' + lineColor + '"/>' +
      '</svg>' +
      '<div class="fin-hi-foot">' + data[0].d + ' ～ ' + data[n - 1].d + ' · ' + n + ' 个净值点 · 起点归一化 1.000' +
      ' · 按当前份额 × 历史净值估算，未还原历史申赎现金流，不代表每日真实净值</div>'
  }

  global.FinanceCharts = { renderAllocation: renderAllocation, renderNavHistory: renderNavHistory, renderPortfolioHistory: renderPortfolioHistory }
})(window)
