/* ============================================================
 * Biko · 工作计划历（/calendar/）
 * ------------------------------------------------------------
 * 交互约定：
 *   · 点【今天】的格子        → 弹输入卡，追加一条（同日不覆盖）
 *   · 点【过去】的日期        → 只读，不弹输入框，只展示悬停卡
 *   · 点【未来】的日期        → 禁用
 *   · 鼠标划过任意格子        → 圆角小卡片显示「日期 + 工作内容」
 *
 * 数据来源：同源 /api/worklog/*（Cloudflare Pages Functions）。
 *   GitHub Pages 不执行 Functions，探测到 404 后退化为只读快照，
 *   不会每次换页都打必然 404 的请求（与 weather.js 同一套思路）。
 *
 * Pjax 安全（本站硬约定）：
 *   单例挂 window.__BIKO_WORKLOG__，重建前成对卸载监听器/定时器。
 * ============================================================ */
(function () {
  'use strict'

  var API = '/api/worklog'
  var TOKEN_KEY = 'worklog-token'
  var MAX_TEXT = 200

  /* 单例：Pjax 或重复引入时不重复初始化 */
  if (window.__BIKO_WORKLOG__) {
    try { window.__BIKO_WORKLOG__.destroy() } catch (e) { /* 忽略 */ }
  }

  var $ = function (id) { return document.getElementById(id) }

  var grid = $('wl-grid')
  if (!grid) return   // 不在本页，直接退出

  var monthsEl = $('wl-months')
  var tipEl = $('wl-tip')
  var modal = $('wl-modal')
  var inputEl = $('wl-input')
  var countEl = $('wl-count')
  var errEl = $('wl-err')
  var existingEl = $('wl-existing')
  var existingTitle = $('wl-existing-title')
  var tokenRow = $('wl-token-row')
  var tokenInput = $('wl-token')
  var footEl = $('wl-foot')
  var noteEl = $('wl-note')
  var noteTextEl = $('wl-note-text')
  var titleEl = $('wl-panel-title')

  /* ---------- 状态 ---------- */
  var records = {}           // { 'YYYY-MM-DD': [ { t, text } ] }
  var cells = []             // { el, key }
  var backend = 'unknown'    // unknown | ok | unavailable
  var saving = false
  var openKey = null
  var todayK = ''
  var listeners = []         // 便于 destroy 时成对卸载
  var timers = []

  /* ---------- 工具 ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n }

  function keyOf(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
  }

  /* 本地时区「今天」，与后端 todayKey() 保持同一套算法 */
  function today() { return keyOf(new Date()) }

  function parseKey(k) {
    var p = k.split('-')
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]))
  }

  var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  function tipDate(k) {
    var d = parseKey(k)
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日  ' + WEEK[d.getDay()]
  }

  /* 输入卡标题用的可读日期（比 tipDate 略简洁） */
  function humanDate(k) {
    var d = parseKey(k)
    return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · ' + WEEK[d.getDay()]
  }

  function listOf(k) {
    return Array.isArray(records[k]) ? records[k] : []
  }

  /* 五档：0 无记录（默认色），1-2 / 3-4 / 5-7 / >=8 */
  function levelOf(n) {
    if (n <= 0) return 0
    if (n <= 2) return 1
    if (n <= 4) return 2
    if (n <= 7) return 3
    return 4
  }

  function on(el, ev, fn, opts) {
    el.addEventListener(ev, fn, opts)
    listeners.push([el, ev, fn, opts])
  }

  function later(fn, ms) {
    var t = setTimeout(fn, ms)
    timers.push(t)
    return t
  }

  /* ---------- 状态提示 ---------- */
  function note(msg, icon) {
    if (!msg) { noteEl.classList.remove('is-on'); return }
    noteTextEl.textContent = msg
    var i = noteEl.querySelector('i')
    if (i && icon) i.className = 'fas ' + icon
    noteEl.classList.add('is-on')
  }

  /* ============================================================
   * 渲染：格子墙
   * ============================================================ */

  /* 以「本周」为最后一列，向前铺满 53 周（对齐 GitHub 的观感） */
  function buildGrid() {
    var t = new Date()
    todayK = today()

    // 本周周一（格子第 0 行是周一）
    var dow = (t.getDay() + 6) % 7          // 周一=0 … 周日=6
    var weekStart = new Date(t.getFullYear(), t.getMonth(), t.getDate() - dow)

    var WEEKS = 53
    var start = new Date(weekStart.getFullYear(), weekStart.getMonth(),
      weekStart.getDate() - (WEEKS - 1) * 7)

    grid.innerHTML = ''
    monthsEl.innerHTML = ''
    cells = []

    var frag = document.createDocumentFragment()
    var lastMonth = -1
    var monthMarks = []

    for (var w = 0; w < WEEKS; w++) {
      for (var d = 0; d < 7; d++) {
        var cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d)
        var k = keyOf(cur)

        var el = document.createElement('button')
        el.type = 'button'
        el.className = 'wl-cell'
        el.setAttribute('data-key', k)
        el.setAttribute('data-lv', '0')
        el.setAttribute('role', 'gridcell')

        if (k > todayK) el.setAttribute('data-future', '1')
        if (k === todayK) el.setAttribute('data-today', '1')

        frag.appendChild(el)
        cells.push({ el: el, key: k })

        // 月份轴：每列第 1 天所在月份变化时打点
        if (d === 0) {
          var m = cur.getMonth()
          if (m !== lastMonth) {
            lastMonth = m
            monthMarks.push({ col: w, month: m + 1 })
          }
        }
      }
    }
    grid.appendChild(frag)

    // 月份轴定位：按实际格子步长换算像素，避免文字互相压住
    var css = getComputedStyle(document.documentElement)
    var cs = parseFloat(css.getPropertyValue('--wl-cell')) || 12
    var gp = parseFloat(css.getPropertyValue('--wl-gap')) || 3
    var step = cs + gp

    monthMarks.forEach(function (mk) {
      var s = document.createElement('span')
      s.textContent = mk.month + ' 月'
      s.style.left = (mk.col * step) + 'px'
      monthsEl.appendChild(s)
    })

    paint()
  }

  /* 把 records 映射到格子颜色 */
  function paint() {
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i]
      var n = listOf(c.key).length
      c.el.setAttribute('data-lv', String(levelOf(n)))

      var base = tipDate(c.key).replace(/\s+/g, ' ')
      if (c.key === todayK) base += '（今天）'
      else if (c.key > todayK) base += '（还没到这天）'
      else base += n ? '（' + n + ' 条记录）' : '（这天没有记录）'
      c.el.setAttribute('aria-label', base)
    }
    renderStats()
  }

  function renderStats() {
    var total = 0
    var days = 0
    for (var k in records) {
      if (!Object.prototype.hasOwnProperty.call(records, k)) continue
      var n = listOf(k).length
      if (n > 0) { total += n; days++ }
    }
    $('wl-total').textContent = total
    $('wl-days').textContent = days
    $('wl-streak').textContent = streak()
  }

  /* 从今天往回数连续有记录的天数（今天还没记不算断连） */
  function streak() {
    var n = 0
    var d = new Date()
    if (listOf(keyOf(d)).length === 0) d.setDate(d.getDate() - 1)
    while (listOf(keyOf(d)).length > 0) {
      n++
      d.setDate(d.getDate() - 1)
      if (n > 3650) break
    }
    return n
  }

  /* ============================================================
   * 悬停卡片
   * ============================================================ */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  function tipHTML(k) {
    var out = '<span class="wl-tip-date">' + tipDate(k) + '</span>'
    var list = listOf(k)

    if (k > todayK) return out + '<p class="wl-tip-empty">还没到这天</p>'
    if (!list.length) return out + '<p class="wl-tip-empty">这天没有记录 · 也许在休息</p>'

    out += '<ul>'
    for (var i = 0; i < list.length; i++) {
      out += '<li><time>' + esc(list[i].t || '') + '</time><p>' +
             esc(list[i].text || '') + '</p></li>'
    }
    out += '</ul><span class="wl-tip-sum">共 ' + list.length + ' 条记录</span>'
    return out
  }

  function showTip(el) {
    var k = el.getAttribute('data-key')
    if (!k) return
    tipEl.innerHTML = tipHTML(k)
    tipEl.classList.add('is-on')
    tipEl.setAttribute('aria-hidden', 'false')
    placeTip(el)
  }

  /* 跟随格子，并在视口边缘自动翻面/夹紧 */
  function placeTip(el) {
    var r = el.getBoundingClientRect()
    var tw = tipEl.offsetWidth
    var th = tipEl.offsetHeight
    var gap = 10

    var left = r.left + r.width / 2 - tw / 2
    var top = r.top - th - gap

    if (top < 8) top = r.bottom + gap
    if (left < 8) left = 8
    if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8

    tipEl.style.left = Math.round(left) + 'px'
    tipEl.style.top = Math.round(top) + 'px'
  }

  function hideTip() {
    tipEl.classList.remove('is-on')
    tipEl.setAttribute('aria-hidden', 'true')
  }

  /* ============================================================
   * 输入卡（仅今天可写；历史/未来一律只读）
   * ============================================================ */
  function openPanel(k) {
    openKey = k
    errEl.textContent = ''

    titleEl.textContent = humanDate(k)
    inputEl.value = ''
    updateCount()

    // 已有记录作为上下文列出（追加模式，不覆盖）
    var list = listOf(k)
    existingTitle.textContent = list.length ? '已有记录 · 继续追加' : ''
    existingEl.innerHTML = ''
    for (var i = 0; i < list.length; i++) {
      var li = document.createElement('li')
      li.innerHTML = '<time>' + esc(list[i].t || '') + '</time><p>' +
                     esc(list[i].text || '') + '</p>'
      existingEl.appendChild(li)
    }

    // 没存过口令就先亮出口令框（读公开、写受控）
    var saved = ''
    try { saved = localStorage.getItem(TOKEN_KEY) || '' } catch (e) { saved = '' }
    tokenRow.hidden = !!saved
    tokenInput.value = saved

    modal.hidden = false
    later(function () {
      (saved ? inputEl : tokenInput).focus()
    }, 40)
  }

  function closePanel() {
    modal.hidden = true
    openKey = null
    inputEl.value = ''
    errEl.textContent = ''
  }

  function updateCount() {
    var n = inputEl.value.length
    countEl.textContent = n + '/' + MAX_TEXT
    countEl.classList.toggle('is-over', n > MAX_TEXT)
  }

  /* ============================================================
   * 数据层：探测 → 拉取 → 追加
   * ============================================================ */
  function request(path, opts) {
    return fetch(API + path, opts).then(function (res) {
      return res.json().catch(function () { return {} }).then(function (body) {
        return { status: res.status, body: body }
      })
    })
  }

  /* 首次进入先探测后端：404/501 判定为「无 Functions 环境」，
     之后整页进入只读模式，不再重复发必然失败的请求。 */
  function probe() {
    return request('/list', { method: 'GET', headers: { accept: 'application/json' } })
      .then(function (r) {
        if (r.status === 404 || r.status === 501) return { ok: false, data: {} }
        if (r.status === 200 && r.body && r.body.ok) return { ok: true, data: r.body.data || {} }
        // 500（缺 KV 绑定/环境变量）等：按只读处理并给出提示
        return { ok: false, data: {}, message: (r.body && r.body.message) || '' }
      })
      .catch(function () { return { ok: false, data: {} } })
  }

  function load() {
    note('正在载入记录…', 'fa-circle-notch')
    footEl.textContent = '正在载入记录…'

    probe().then(function (r) {
      if (r.ok) {
        backend = 'ok'
        records = r.data || {}
        note('')
        footEl.textContent = '点今天的格子记一条 · 历史日期只读回顾'
      } else {
        backend = 'unavailable'
        records = {}
        note('当前部署不支持在线记录（未启用 /api/worklog）。' +
             '页面可正常浏览，记录功能请在启用了 Cloudflare Functions 的环境使用。', 'fa-triangle-exclamation')
        footEl.textContent = '只读模式 · 点格子可查看，暂不支持写入'
        if (r.message) footEl.textContent += '（' + r.message + '）'
      }
      paint()
    })
  }

  function save() {
    if (saving || !openKey) return

    var text = inputEl.value.trim()
    if (!text) { errEl.textContent = '写点什么再保存吧'; inputEl.focus(); return }
    if (text.length > MAX_TEXT) { errEl.textContent = '超出 ' + MAX_TEXT + ' 字上限'; return }

    var token = tokenInput.value.trim()
    if (!token) { errEl.textContent = '请填写记录口令'; tokenInput.focus(); return }

    saving = true
    errEl.textContent = ''
    var btn = $('wl-save')
    btn.disabled = true
    btn.textContent = '保存中…'

    request('/add', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ date: openKey, text: text })
    }).then(function (r) {
      if (r.status === 401) throw new Error('口令不正确')
      if (r.status >= 400 || !r.body || !r.body.ok) {
        throw new Error((r.body && r.body.message) || '保存失败（HTTP ' + r.status + '）')
      }

      // 成功：口令存本机，减少重复输入
      try { localStorage.setItem(TOKEN_KEY, token) } catch (e) { /* 隐私模式忽略 */ }
      tokenRow.hidden = true

      if (!Array.isArray(records[openKey])) records[openKey] = []
      records[openKey].push(r.body.entry || { t: '', text: text })

      var savedKey = openKey
      paint()
      var cell = grid.querySelector('.wl-cell[data-key="' + savedKey + '"]')
      if (cell) {
        cell.classList.remove('is-drop')
        void cell.offsetWidth          // 强制重排，让动画可重复播放
        cell.classList.add('is-drop')
      }
      closePanel()
      if (footEl) footEl.textContent = '已记录 · 点今天的格子可继续追加'
    }).catch(function (e) {
      errEl.textContent = e && e.message ? e.message : '网络异常，请稍后重试'
    }).then(function () {
      saving = false
      btn.disabled = false
      btn.textContent = '保存'
    })
  }

  /* ============================================================
   * 事件绑定
   * ============================================================ */
  function bind() {
    /* --- 格子：悬停出卡片；点击决定可写/只读 --- */
    on(grid, 'mouseover', function (e) {
      var el = e.target.closest ? e.target.closest('.wl-cell') : null
      if (el && grid.contains(el)) showTip(el)
    })
    on(grid, 'mouseout', function (e) {
      var el = e.target.closest ? e.target.closest('.wl-cell') : null
      if (el && grid.contains(el)) hideTip()
    })
    on(grid, 'focusin', function (e) {
      var el = e.target.closest ? e.target.closest('.wl-cell') : null
      if (el && grid.contains(el)) showTip(el)
    })
    on(grid, 'focusout', function () { hideTip() })

    on(grid, 'click', function (e) {
      var el = e.target.closest ? e.target.closest('.wl-cell') : null
      if (!el) return
      var k = el.getAttribute('data-key')
      if (!k) return

      // 未来：不响应
      if (k > todayK) {
        note('这还没到呢 —— 到那天再回来记吧', 'fa-hourglass-half')
        later(function () {
          if (backend === 'ok') note('')
        }, 2600)
        return
      }

      // 历史：只读，鼠标已有卡片，给出明确反馈
      if (k < todayK) {
        hideTip()
        showTip(el)
        return
      }

      // 今天：可写
      if (backend !== 'ok') {
        note('当前部署未启用在线记录（/api/worklog 不可用）。', 'fa-triangle-exclamation')
        return
      }
      openPanel(k)
    })

    /* --- 卡片在滚动/缩放时收起，避免卡片与格子错位 --- */
    on(window, 'scroll', function () {
      if (tipEl.classList.contains('is-on')) hideTip()
    }, true)

    on(window, 'resize', function () { hideTip() })

    /* --- 输入卡 --- */
    on($('wl-close'), 'click', closePanel)
    on($('wl-cancel'), 'click', closePanel)
    on($('wl-save'), 'click', save)
    on(inputEl, 'input', updateCount)

    // Ctrl / ⌘ + Enter 快捷保存
    on(inputEl, 'keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        save()
      }
    })

    // 点遮罩关闭；Esc 关闭
    on(modal, 'click', function (e) { if (e.target === modal) closePanel() })
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closePanel()
    })

    /* --- 主站明暗切换后（另一个标签页/主站同页）同步重绘 --- */
    // 颜色全部来自 CSS 令牌，无需重绘，这里只在跨标签同步时保持令牌一致
    on(document, 'visibilitychange', function () {
      if (document.visibilityState !== 'visible') return
      try {
        var v = localStorage.getItem('theme')
        if ((v === 'dark' || v === 'light') &&
            document.documentElement.getAttribute('data-theme') !== v) {
          document.documentElement.setAttribute('data-theme', v)
        }
      } catch (e) { /* 忽略 */ }
    })
  }

  /* ---------- 成对卸载（Pjax 换页 / 重复初始化） ---------- */
  function destroy() {
    /* listeners 里可能有两个监听器共用同一个 fn（例如 resize 走同一处理函数），
       先按 [元素][事件][函数] 去重，再逐个卸载，避免同一对重复 remove。 */
    var seen = []
    listeners.forEach(function (l) {
      for (var i = 0; i < seen.length; i++) {
        if (seen[i][0] === l[0] && seen[i][1] === l[1] && seen[i][2] === l[2]) return
      }
      seen.push(l)
    })
    seen.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]) })
    listeners = []
    timers.forEach(clearTimeout)
    timers = []
    hideTip()
    window.__BIKO_WORKLOG__ = null
  }

  /* ---------- 启动 ---------- */
  function boot() {
    buildGrid()
    bind()
    load()
  }

  window.__BIKO_WORKLOG__ = { destroy: destroy, reload: boot, getRecords: function () { return records } }
  boot()
})()
