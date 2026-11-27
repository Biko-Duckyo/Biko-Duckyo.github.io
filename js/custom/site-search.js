/* ============================================================
 * Biko · 聚合搜索面板（自建分区检索，替换主题 local_search）
 * ------------------------------------------------------------
 * 数据源：/data/search-index.json（构建期由 scripts/search-index.js 生成）
 *   - post：站内文章
 *   - resource：百宝箱资源（外链）
 * 预留（暂无数据时不渲染对应 tab）：番剧 / 相册 / 友链。
 *
 * 设计约束（对齐 docs/聚合搜索升级方案-20261110.md）：
 *   - 不引入 npm 依赖；检索打分全部在前端内存完成。
 *   - 自绘遮罩层 + role=dialog，不用 <dialog>.showModal()
 *     （与首页压图层同一原因：top layer 在部分嵌入环境下不参与合成）。
 *   - 焦点归还触发按钮；Esc / 遮罩 / × 关闭；pjax 完成后关闭面板。
 *   - 所有用户文本先 escapeHtml 再进 innerHTML，高亮 mark 由本脚本包裹。
 *
 * 对外接口：window.BikoSearch = { open, close, toggle }
 * ============================================================ */
(function () {
  'use strict'
  if (window.BikoSearch) return

  var INDEX_URL = '/data/search-index.json'
  var DEBOUNCE_MS = 150
  var PER_SOURCE_LIMIT = 12
  var ALL_LIMIT = 24
  var HISTORY_KEY = 'biko-search-history'
  var HISTORY_MAX = 8
  var RECENT_POSTS = 6

  /* ---------------- 工具 ---------------- */

  function $(sel, root) { return (root || document).querySelector(sel) }
  function el(tag, cls, html) {
    var n = document.createElement(tag)
    if (cls) n.className = cls
    if (html != null) n.innerHTML = html
    return n
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }
  function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

  /* ---------------- 搜索历史（localStorage） ---------------- */

  function loadHistory() {
    try {
      var raw = window.localStorage.getItem(HISTORY_KEY)
      var arr = raw ? JSON.parse(raw) : []
      return Array.isArray(arr) ? arr.filter(function (x) { return typeof x === 'string' && x.trim() }) : []
    } catch (e) {
      return []
    }
  }

  function saveHistory(arr) {
    try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, HISTORY_MAX))) } catch (e) {}
  }

  function recordHistory(q) {
    q = String(q || '').trim()
    if (!q) return
    var arr = loadHistory().filter(function (x) { return x !== q })
    arr.unshift(q)
    saveHistory(arr)
  }

  function removeHistory(q) {
    saveHistory(loadHistory().filter(function (x) { return x !== q }))
  }

  function clearHistory() {
    try { window.localStorage.removeItem(HISTORY_KEY) } catch (e) {}
  }

  /* 分词：英文/数字按词；中文 2-gram + 单字兜底；大小写不敏感 */
  function tokenize(text) {
    var s = String(text || '').toLowerCase().trim()
    if (!s) return []
    var set = new Set()
    var en = s.match(/[a-z0-9]+(?:[-'][a-z0-9]+)*/g)
    if (en) en.forEach(function (w) { set.add(w) })
    var cn = s.match(/[一-龥]+/g)
    if (cn) cn.forEach(function (seg) {
      var chars = seg.split('')
      chars.forEach(function (c) { set.add(c) })
      for (var i = 0; i < chars.length - 1; i++) set.add(chars[i] + chars[i + 1])
    })
    return Array.from(set)
  }

  /* 预计算每条索引的字段 token 集合（懒加载完成后一次性缓存） */
  function prepareItem(item) {
    item._titleTokens = new Set(tokenize(item.title))
    item._tagTokens = new Set(tokenize(
      (item.tags || []).concat(item.categories || []).join(' ')
    ))
    item._summaryTokens = new Set(tokenize(item.summary))
    item._bodyTokens = new Set(tokenize(item.body || ''))
    return item
  }

  function scoreItem(item, qts) {
    if (!qts.length) return 0
    var fields = [
      [item._titleTokens, 5],
      [item._tagTokens, 3],
      [item._summaryTokens, 2],
      [item._bodyTokens, 1]
    ]
    var s = 0
    var hit = 0
    for (var i = 0; i < qts.length; i++) {
      var q = qts[i]
      var fieldHit = false
      for (var f = 0; f < fields.length; f++) {
        if (fields[f][0].has(q)) { s += fields[f][1]; fieldHit = true }
      }
      if (fieldHit) hit++
    }
    if (hit === 0) return 0
    var titleLower = String(item.title || '').toLowerCase()
    for (var j = 0; j < qts.length; j++) {
      if (titleLower.indexOf(qts[j]) === 0) s += 2.5
    }
    // 全部命中排前；部分命中降权后排后
    return hit === qts.length ? s : s * 0.6
  }

  function compare(a, b) {
    if (b._score !== a._score) return b._score - a._score
    if (a.type === 'post' && b.type === 'post') {
      return String(b.date || '').localeCompare(String(a.date || ''))
    }
    return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hans-CN')
  }

  /* 高亮：长词优先，避免单字先切 */
  function highlight(text, qts) {
    var safe = esc(text)
    if (!qts.length) return safe
    var sorted = qts.slice().sort(function (x, y) { return y.length - x.length })
    var re = new RegExp('(' + sorted.map(escapeRe).join('|') + ')', 'gi')
    return safe.replace(re, '<mark>$1</mark>')
  }

  function snippet(text, qts, radius) {
    radius = radius || 40
    var t = String(text || '')
    var idx = -1
    for (var i = 0; i < qts.length; i++) {
      var p = t.toLowerCase().indexOf(qts[i])
      if (p >= 0) { idx = p; break }
    }
    if (idx < 0) return t.slice(0, radius * 2)
    var start = Math.max(0, idx - radius)
    var end = Math.min(t.length, idx + radius)
    return (start > 0 ? '…' : '') + t.slice(start, end) + (end < t.length ? '…' : '')
  }

  /* ---------------- 状态 ---------------- */

  var ui = null              // { layer, panel, input, tabs, list, status, closeBtn }
  var indexData = null       // { items }
  var loadPromise = null
  var loadError = null
  var currentTab = 'all'
  var results = []
  var activeIndex = -1
  var lastQuery = ''
  var triggerEl = null
  var background = [], uiLoadEpoch = 0, composing = false
  var searchTimer = null

  var TABS = [
    { key: 'all', label: '综合' },
    { key: 'post', label: '文章' },
    { key: 'resource', label: '资源' },
    { key: 'friend', label: '友链' }
  ]

  /* ---------------- 索引加载 ---------------- */

  function ensureIndex() {
    if (indexData) return Promise.resolve(indexData)
    if (loadPromise) return loadPromise
    var retrying = !!loadError
    loadError = null
    loadPromise = fetch(INDEX_URL, { cache: retrying ? 'reload' : 'no-cache' })
      .then(function (resp) {
        if (!resp.ok) throw new Error('索引加载失败：HTTP ' + resp.status)
        return resp.json()
      })
      .then(function (data) {
        var items = Array.isArray(data.items) ? data.items : []
        items.forEach(prepareItem)
        indexData = { items: items }
        loadPromise = null
        return indexData
      })
      .catch(function (err) {
        loadError = err
        loadPromise = null
        throw err
      })
    return loadPromise
  }

  /* ---------------- 检索 ---------------- */

  function search() {
    var q = ui.input.value.trim()
    lastQuery = q
    activeIndex = -1

    if (!indexData) {
      if (loadError) renderLoadError()
      else renderStatus('正在加载索引…')
      ui.list.textContent = ''
      return
    }

    if (!q) {
      results = []
      renderIdle()
      return
    }

    var qts = tokenize(q)
    if (!qts.length) {
      results = []
      renderList()
      renderStatus('没有可识别的关键词。')
      return
    }

    var pool = indexData.items
    if (currentTab !== 'all') {
      pool = pool.filter(function (it) { return it.type === currentTab })
    }

    var scored = []
    for (var i = 0; i < pool.length; i++) {
      var it = pool[i]
      var sc = scoreItem(it, qts)
      if (sc > 0) {
        it._score = sc
        scored.push(it)
      }
    }
    scored.sort(compare)

    var limit = currentTab === 'all' ? ALL_LIMIT : PER_SOURCE_LIMIT
    results = scored.slice(0, limit)
    renderList()
    renderStatus('命中 ' + scored.length + ' 条' + (scored.length > limit ? '，显示前 ' + limit + ' 条' : ''))
  }

  /* ---------------- 渲染 ---------------- */

  function itemIcon(it) {
    if (it.type === 'post') {
      return '<i class="fas fa-file-lines" aria-hidden="true"></i>'
    }
    // resource / friend 均为外链
    return '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>'
  }

  function sourceLabel(it) {
    if (it.type === 'post') {
      var cat = (it.categories || [])[0]
      return cat ? esc(cat) : '文章'
    }
    if (it.type === 'friend') return '友链'
    return esc(it.groupLabel || '资源')
  }

  function buildItemNode(it) {
    var qts = tokenize(lastQuery)
    var a = el('a', 'bks-item')
    a.href = it.url
    a.setAttribute('role', 'option')
    a.setAttribute('aria-selected', 'false')
    if (it.external) {
      a.target = '_blank'
      a.rel = 'noopener'
    }
    var meta = it.tags && it.tags.length ? esc(it.tags[0]) : sourceLabel(it)
    var summary = it.external ? snippet(it.summary, qts) : snippet(it.summary || it.body, qts)
    a.innerHTML =
      '<span class="bks-item__icon">' + itemIcon(it) + '</span>' +
      '<span class="bks-item__body">' +
        '<span class="bks-item__title">' + highlight(it.title, qts) + '</span>' +
        '<span class="bks-item__summary">' + highlight(summary, qts) + '</span>' +
      '</span>' +
      '<span class="bks-item__meta">' + meta + '</span>'
    return a
  }

  function renderList() {
    ui.list.textContent = ''
    if (!results.length) {
      var empty = el('div', 'bks-empty')
      empty.textContent = lastQuery
        ? '没有找到相关内容，换个关键词试试。'
        : '输入关键词开始搜索。'
      ui.list.appendChild(empty)
      return
    }
    results.forEach(function (it) {
      ui.list.appendChild(buildItemNode(it))
    })
  }

  function recentPosts() {
    var posts = indexData.items.filter(function (it) { return it.type === 'post' })
    posts.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')) })
    return posts.slice(0, RECENT_POSTS)
  }

  /* 空输入态：历史词 chips + 最近文章兜底 */
  function renderIdle() {
    ui.list.textContent = ''
    var history = loadHistory()

    if (history.length) {
      var box = el('div', 'bks-history')
      var label = el('span', 'bks-history__label')
      label.textContent = '最近搜索'
      box.appendChild(label)
      history.forEach(function (q) {
        var chip = el('button', 'bks-chip')
        chip.type = 'button'
        chip.dataset.q = q
        chip.innerHTML = '<span>' + esc(q) + '</span><i class="fas fa-xmark bks-chip__x" aria-hidden="true"></i>'
        box.appendChild(chip)
      })
      var clear = el('button', 'bks-history-clear')
      clear.type = 'button'
      clear.textContent = '清空'
      box.appendChild(clear)
      ui.list.appendChild(box)
    }

    var recent = recentPosts()
    if (recent.length) {
      var head = el('div', 'bks-idle-head')
      head.textContent = '最近文章'
      ui.list.appendChild(head)
      recent.forEach(function (it) { ui.list.appendChild(buildItemNode(it)) })
      renderStatus('输入关键词，检索站内文章、资源与友链。')
    } else {
      renderStatus('输入关键词开始搜索。')
    }
  }

  function renderStatus(text) {
    ui.status.textContent = text
  }
  function renderLoadError() {
    renderStatus('搜索暂时无法加载，输入内容已保留。')
    var retry = document.createElement('button')
    retry.type = 'button'; retry.className = 'ui-retry'; retry.dataset.bksRetry = '1'; retry.textContent = '重试'
    ui.status.appendChild(retry)
  }
  function loadForUi() {
    var epoch = ++uiLoadEpoch
    ui.panel.setAttribute('aria-busy', 'true')
    renderStatus('正在加载索引…')
    ensureIndex().then(function () {
      if (ui.layer.hidden || epoch !== uiLoadEpoch) return
      renderTabs(); search()
    }).catch(function () {
      if (!ui.layer.hidden && epoch === uiLoadEpoch) renderLoadError()
    }).finally(function () { if (epoch === uiLoadEpoch) ui.panel.removeAttribute('aria-busy') })
  }
  function guardBackground(on) {
    if (on && !background.length) {
      Array.prototype.forEach.call(document.body.children, function (node) {
        if (node === ui.layer || /^(SCRIPT|STYLE|LINK)$/.test(node.tagName)) return
        background.push([node, !!node.inert]); node.inert = true
      })
    } else if (!on) {
      background.forEach(function (entry) { entry[0].inert = entry[1] }); background = []
    }
  }

  function renderTabs() {
    var keys = TABS.map(function (t) { return t.key })
    Array.prototype.forEach.call(ui.tabs.children, function (btn) {
      var active = btn.dataset.tab === currentTab
      btn.classList.toggle('is-active', active)
      btn.setAttribute('aria-selected', active ? 'true' : 'false')
    })
    // 预留：某源无数据时隐藏对应按钮（当前三源均有数据）
    keys.forEach(function (key) {
      var btn = ui.tabs.querySelector('[data-tab="' + key + '"]')
      if (!btn || !indexData) return
      var has = indexData.items.some(function (it) {
        return key === 'all' || it.type === key
      })
      btn.style.display = has ? '' : 'none'
    })
  }

  /* ---------------- DOM 构建 ---------------- */

  function ensureUi() {
    if (ui) return ui

    var layer = el('div', 'bks-layer')
    layer.hidden = true

    var mask = el('div', 'bks-mask')
    mask.setAttribute('data-bks-close', '1')

    var panel = el('div', 'bks')
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-modal', 'true')
    panel.setAttribute('aria-labelledby', 'bks-title')
    panel.innerHTML =
      '<header class="bks-head">' +
        '<span class="bks-brand"><i class="fas fa-magnifying-glass" aria-hidden="true"></i>' +
        '<b id="bks-title">搜索</b></span>' +
        '<button type="button" class="bks-close" aria-label="关闭搜索"><i class="fas fa-xmark" aria-hidden="true"></i></button>' +
      '</header>' +
      '<div class="bks-input-row">' +
        '<i class="fas fa-magnifying-glass" aria-hidden="true"></i>' +
        '<input id="bks-input" type="search" placeholder="搜索文章、资源…" autocomplete="off" spellcheck="false">' +
      '</div>' +
      '<nav class="bks-tabs" role="tablist" aria-label="搜索来源"></nav>' +
      '<div class="bks-list" role="listbox"></div>' +
      '<footer class="bks-status" aria-live="polite"></footer>'

    layer.appendChild(mask)
    layer.appendChild(panel)
    document.body.appendChild(layer)

    TABS.forEach(function (t) {
      var btn = el('button', 'bks-tab')
      btn.type = 'button'
      btn.dataset.tab = t.key
      btn.setAttribute('role', 'tab')
      btn.textContent = t.label
      panel.querySelector('.bks-tabs').appendChild(btn)
    })

    ui = {
      layer: layer,
      panel: panel,
      mask: mask,
      input: panel.querySelector('#bks-input'),
      tabs: panel.querySelector('.bks-tabs'),
      list: panel.querySelector('.bks-list'),
      status: panel.querySelector('.bks-status'),
      closeBtn: panel.querySelector('.bks-close')
    }

    bindPanelEvents()
    return ui
  }

  /* ---------------- 面板事件 ---------------- */

  function bindPanelEvents() {
    ui.status.addEventListener('click', function (event) { if (event.target.closest('[data-bks-retry]')) loadForUi() })
    ui.closeBtn.addEventListener('click', close)
    ui.mask.addEventListener('click', function () { close() })

    ui.input.addEventListener('input', function () {
      if (composing) return
      clearTimeout(searchTimer)
      searchTimer = setTimeout(search, DEBOUNCE_MS)
    })
    ui.input.addEventListener('compositionstart', function () { composing = true; clearTimeout(searchTimer) })
    ui.input.addEventListener('compositionend', function () { composing = false; clearTimeout(searchTimer); searchTimer = setTimeout(search, DEBOUNCE_MS) })
    ui.input.addEventListener('keydown', onInputKey)

    ui.tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.bks-tab')
      if (!btn) return
      currentTab = btn.dataset.tab
      renderTabs()
      search()
    })

    ui.list.addEventListener('click', function (e) {
      var clearBtn = e.target.closest('.bks-history-clear')
      if (clearBtn) { clearHistory(); renderIdle(); return }
      var chip = e.target.closest('.bks-chip')
      if (chip) {
        if (e.target.closest('.bks-chip__x')) { removeHistory(chip.dataset.q); renderIdle(); return }
        ui.input.value = chip.dataset.q
        ui.input.focus()
        search()
        return
      }
      var item = e.target.closest('.bks-item')
      if (!item) return
      /* 外链交给浏览器默认行为（新窗口）；站内文章当前窗口跳转 */
      recordHistory(lastQuery)
      close(false)
    })

    document.addEventListener('keydown', function (e) {
      if (ui.layer.hidden) return
      if (!ui.panel.contains(document.activeElement)) return
      if (composing || e.isComposing || e.keyCode === 229) return
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key === 'Tab') trapTab(e)
    })
  }

  function onInputKey(e) {
    if (composing || e.isComposing || e.keyCode === 229) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveActive(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveActive(-1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      jumpActive()
    }
  }

  function moveActive(step) {
    var nodes = ui.list.querySelectorAll('.bks-item')
    if (!nodes.length) return
    activeIndex = activeIndex + step
    if (activeIndex < 0) activeIndex = nodes.length - 1
    if (activeIndex >= nodes.length) activeIndex = 0
    Array.prototype.forEach.call(nodes, function (n, i) {
      var on = i === activeIndex
      n.classList.toggle('is-active', on)
      n.setAttribute('aria-selected', on ? 'true' : 'false')
    })
    nodes[activeIndex].scrollIntoView({ block: 'nearest' })
  }

  function jumpActive() {
    var nodes = ui.list.querySelectorAll('.bks-item')
    if (!nodes.length) return
    var idx = activeIndex >= 0 ? activeIndex : 0
    nodes[idx].click()
  }

  function focusables() {
    return Array.prototype.filter.call(
      ui.panel.querySelectorAll('a[href],button,input,select,textarea,[tabindex]'),
      function (n) { return n.tabIndex >= 0 && !n.matches(':disabled') && !n.closest('[hidden],[inert]') && n.getClientRects().length > 0 }
    )
  }

  function trapTab(e) {
    var nodes = focusables()
    if (!nodes.length) return
    var first = nodes[0]
    var last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }

  /* ---------------- 开关 ---------------- */

  function open(trigger) {
    ensureUi()
    triggerEl = trigger || document.activeElement
    composing = false
    currentTab = 'all'
    ui.input.value = ''
    lastQuery = ''
    activeIndex = -1

    ui.layer.hidden = false
    document.documentElement.classList.add('is-search-open')
    guardBackground(true)
    renderTabs()
    renderStatus('正在加载索引…')
    ui.list.textContent = ''

    ui.input.focus({ preventScroll: true })
    loadForUi()
  }

  function close(restoreFocus) {
    if (!ui || ui.layer.hidden) return
    ui.layer.hidden = true
    composing = false
    uiLoadEpoch++
    ui.panel.removeAttribute('aria-busy')
    guardBackground(false)
    document.documentElement.classList.remove('is-search-open')
    clearTimeout(searchTimer)
    activeIndex = -1
    if (restoreFocus !== false && triggerEl && typeof triggerEl.focus === 'function' &&
        document.contains(triggerEl)) {
      triggerEl.focus()
    }
    triggerEl = null
  }

  /* ---------------- 入口委托 ---------------- */

  function bindGlobal() {
    /* 顶栏搜索按钮：主题 local_search 卸载后，结构由 scripts/biko-index.js 拼出，
       选择器保持 #search-button > .search；pjax 后节点重建，用 document 委托只绑一次。 */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#search-button > .search')
      if (!btn) return
      e.preventDefault()
      open(btn)
    })
    /* pjax 换页：关闭面板，避免旧结果挂在新页面上 */
    document.addEventListener('pjax:send', function () { close(false) })
    document.addEventListener('pjax:complete', function () { close(false) })
    window.addEventListener('pagehide', function () { close(false) })
  }

  /* ---------------- 启动 ---------------- */

  function init() {
    bindGlobal()
  }

  if (document.readyState !== 'loading') init()
  else document.addEventListener('DOMContentLoaded', init)

  window.BikoSearch = {
    open: function (trigger) { open(trigger) },
    close: function () { close() },
    toggle: function (trigger) {
      ensureUi()
      if (ui.layer.hidden) open(trigger)
      else close()
    }
  }
})()
