/* ============================================================
 * Biko · 工作计划历（/calendar/）
 * ------------------------------------------------------------
 * 交互约定：
 *   · 点【今天 / 过去】的格子  → 弹输入卡，默认「工作记录」（同日追加不覆盖）
 *   · 点【未来】的日期          → 弹输入卡，默认「待办」（可指派计划事项、勾选完成）
 *   · 待办条目                  → 弹窗清单 / 今日聚合清单勾选框切换完成态（done + doneAt）
 *   · 鼠标划过 / 键盘聚焦格子  → 圆角小卡片显示「日期 + 条目」（完成项划线）
 *
 * 数据模型 entry = { id, date, kind, tag, text, t, done, doneAt }：
 *   kind=log  工作记录（今天及过去；未来写 log 由后端拒绝）；
 *   kind=todo 待办（允许未来；勾选只切 done/doneAt，不改写原计划 date）；
 *   五类标签：实验 / 写作 / 组会 / 读论文 / 其他。
 *
 * 可访问性（三条硬约定，改动前先读懂）：
 *   1. 371 个格子不占用 Tab 序列（tabindex="-1"），否则要按 371 次 Tab
 *      才能穿过去。改用方向键在格子间「漫游」：← → 为一周，↑ ↓ 为一天，
 *      Home/End 跳到当前行两端，Tab 只停留在「今天」这一个入口上。
 *   2. 每次用键盘漫游都会把焦点和悬停卡片对齐，因此盲操作也能读到内容。
 *   3. 关闭输入卡后焦点归还到打开它的那个格子，不开天窗。
 *
 * 触屏约定：
 *   触屏没有 hover，所以 tap 格子 = 选中：今天 / 未来既选中又开面板，
 *   历史日期则把悬停卡片「钉住」在屏幕上（再次 tap 空白处收起）。
 *
 * 数据来源：同源 /api/worklog/*（Cloudflare Pages Functions）。
 *   GitHub Pages 不执行 Functions，探测到 404 后退化为只读快照，
 *   不会每次换页都打必然 404 的请求（与 weather.js 同一套思路）。
 *
 * Pjax 安全（本站硬约定）：
 *   单例挂 window.__BIKO_WORKLOG__，重建前成对卸载监听器/定时器。
 *
 * 加载方式（与 /music/ 的 music_page.js 同构）：
 *   本页已从 layout:false 独立页迁到主题渲染管线（source/calendar/index.md，
 *   type: calendar），脚本由 _config.butterfly.yml 的 bottom 注入并带 data-pjax。
 *   主题在 pjax:complete 时会重新执行所有 script[data-pjax]，本脚本因此重跑，
 *   开头那段单例逻辑负责先 destroy 掉上一轮实例，再重新 boot（见文件末尾）。
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
  var yearTitle = $('wl-year-title')
  var prevYearBtn = $('wl-prev-year')
  var nextYearBtn = $('wl-next-year')
  var todayBtn = $('wl-today-btn')
  var tipEl = $('wl-tip')
  var modal = $('wl-modal')
  // 把面板移到 body 下，避免被 article-container 的样式影响导致点击失效
  document.body.appendChild(modal)
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
  var forgetEl = $('wl-forget')
  var hintEl = $('wl-hint')
  var delHintEl = $('wl-del-hint')
  var delYesEl = $('wl-del-yes')
  var delNoEl = $('wl-del-no')
  var saveBtn = $('wl-save')
  var tagBtns = document.querySelectorAll('.wl-tag')
  var kindBtns = document.querySelectorAll('.wl-kind-btn')
  var agendaEl = $('wl-agenda')
  var todoGroupsEl = $('wl-todo-groups')
  var todoCountEl = $('wl-todo-count')
  var todayLogsEl = $('wl-today-logs')
  var viewYearBtn = $('wl-view-year')
  var viewWeekBtn = $('wl-view-week')
  var yearViewEl = $('wl-year-view')
  var weekViewEl = $('wl-week-view')
  var prevWeekBtn = $('wl-prev-week')
  var nextWeekBtn = $('wl-next-week')
  var weekTitleEl = $('wl-week-title')
  var weekDaysEl = $('wl-week-days')
  var weekOffset = 0  // 周偏移：0=本周，-1=上周，1=下周

  /* ---------- 标签系统 ---------- */
  var TAGS = ['实验', '写作', '组会', '读论文', '其他']
  var TAG_COLORS = {
    '实验': '#4a90d9',
    '写作': '#5cb85c',
    '组会': '#f0ad4e',
    '读论文': '#9b59b6',
    '其他': '#95a5a6'
  }
  var currentTag = '其他'  // 当前选中的标签
  var currentKind = 'log'  // log=普通工作记录（限过去/今天）；todo=待办（允许未来、可完成）

  /* 从记录文本中解析标签 */
  function parseTag(text) {
    var m = /^\[([^\]]+)\]\s*/.exec(text || '')
    if (m && TAGS.indexOf(m[1]) >= 0) return m[1]
    return '其他'
  }

  /* 去掉文本中的标签前缀 */
  function stripTag(text) {
    return (text || '').replace(/^\[[^\]]+\]\s*/, '')
  }

  /* 旧数据（仅 {t,text}、标签编码在 text 前缀里）与新数据（id/kind/tag/done/doneAt）统一归一化，
     渲染与筛选只认这一层；原始 records 数组保留下标，供 index 定位删除/勾选。 */
  function norm(it) {
    if (!it || typeof it !== 'object') it = { t: '', text: String(it || '') }
    var rawText = typeof it.text === 'string' ? it.text : ''
    return {
      id: it.id || '',
      date: it.date || '',
      kind: it.kind === 'todo' ? 'todo' : 'log',
      tag: it.tag || parseTag(rawText),
      text: stripTag(rawText),
      t: it.t || '',
      done: it.done === true,
      doneAt: it.doneAt || null
    }
  }

  function itemsOf(k) { return listOf(k).map(norm) }

  /* 跨全部日期收集归一化条目（未完成待办聚合清单用） */
  function allItems() {
    var out = []
    for (var k in records) {
      if (!Object.prototype.hasOwnProperty.call(records, k)) continue
      listOf(k).forEach(function (it, i) {
        out.push({ key: k, index: i, item: norm(it) })
      })
    }
    return out
  }

  /* 设置当前选中标签 */
  function setCurrentTag(tag) {
    currentTag = tag
    tagBtns.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.tag === tag)
    })
  }

  /* 绑定标签按钮点击 */
  tagBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setCurrentTag(btn.dataset.tag)
    })
  })

  /* 类型切换：log 工作记录（限今天及过去）/ todo 待办（允许未来、可完成） */
  function setCurrentKind(kind) {
    currentKind = kind === 'todo' ? 'todo' : 'log'
    kindBtns.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.kind === currentKind)
    })
    // 未来日期只允许建待办：禁用「工作记录」（后端 log 不允许写未来）
    var future = !!openKey && openKey > todayK
    kindBtns.forEach(function (btn) {
      var dis = btn.dataset.kind === 'log' && future
      btn.disabled = dis
      btn.classList.toggle('is-disabled', dis)
    })
  }

  kindBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return
      setCurrentKind(btn.dataset.kind)
    })
  })

  /* ---------- 状态 ---------- */
  var records = {}           // { 'YYYY-MM-DD': [ { t, text } ] }
  var cells = []             // { el, key }
  var backend = 'unknown'    // unknown | ok | unavailable
  var saving = false
  var openKey = null
  var todayK = ''
  var listeners = []         // 便于 destroy 时成对卸载
  var timers = []
  var pinned = false         // 触屏下卡片被「钉住」（tap 选中）的状态
  var tipKey = null          // 悬停卡片当前展示的日期键
  var lastFocus = null       // 打开面板前的焦点元素，关闭后归还
  var pendingDel = null      // 待确认删除的 { key, index }，null 表示无
  var hasToken = false       // 本机是否存过口令（决定是否显示「换口令」）
  var editIndex = -1         // 面板处于「修改第 N 条」模式；-1 表示追加模式
  var rafId = 0              // resize 重排月份轴的 rAF 句柄（destroy 时需取消）
  var cancelRaf = null       // 与 rafId 配套的取消函数，bind() 里按宿主能力赋值
  var roEl = null            // ResizeObserver 实例（destroy 时断开，否则 pjax 后仍在观察旧节点）
  var WEEKS_DEFAULT = 53     // 兜底列数；实际列数由 JS 按年份算好写入 --wl-cols
  var CELL_MIN = 7           // 格子下限（px）：再小就看不清，交回 .wl-scroll 横滚
  var CELL_MAX = 14          // 格子上限（px）：够宽后不再放大，避免稀疏年份格子过胖
  var lastCell = 0           // 上次写入的格子尺寸，用于 fitCells 抖动保护
  var lastCols = 0           // 上次写入的列数，同上
  var lastAxis = 0           // 上次写入的星期轴宽度，同上

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

  /* 两个日期键是否同一月（月份轴步长换算要用，见 buildGrid 里那段注释） */
  function monthsEqual(a, b) {
    return a.slice(0, 7) === b.slice(0, 7)
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

  /* 触屏 / 无 hover 设备：卡片要能「点住」，不能只靠划过。
     判定只用 media query，不看 'ontouchstart' —— 带触摸屏的 Windows 笔记本
     同样有 ontouchstart，但那类设备鼠标划过是正常工作的，
     误判成触屏会让 hover 整条路径失效（宁可少判，不要错判）。
     matchMedia 在极老浏览器/jsdom 里可能不存在，统一走 mm() 包一层。 */
  function mm(q) {
    return typeof window.matchMedia === 'function' ? window.matchMedia(q).matches : false
  }
  var TOUCH = mm('(hover: none)')

  /* ---------- 口令（读公开、写受控：本机只存一份，随时可清） ---------- */
  function readToken() {
    try { return localStorage.getItem(TOKEN_KEY) || '' } catch (e) { return '' }
  }

  function writeToken(v) {
    try {
      if (v) localStorage.setItem(TOKEN_KEY, v)
      else localStorage.removeItem(TOKEN_KEY)
    } catch (e) { /* 隐私模式忽略 */ }
  }

  /* 同步口令相关 UI：没存过就亮出口令框，存过则给「换口令」小按钮 */
  function syncTokenUI() {
    hasToken = !!readToken()
    tokenRow.hidden = hasToken
    if (!hasToken) tokenInput.value = ''
    if (forgetEl) forgetEl.hidden = !hasToken
  }

  /* ---------- 状态提示 ---------- */
  function note(msg, icon) {
    noteEl.setAttribute('role', 'status')
    noteEl.setAttribute('aria-live', 'polite')
    if (!msg) { noteEl.classList.remove('is-on'); return }
    noteTextEl.textContent = msg
    var i = noteEl.querySelector('i')
    if (i && icon) i.className = 'fas ' + icon
    noteEl.classList.add('is-on')
  }

  /* ============================================================
   * 渲染：格子墙
   * ============================================================ */

  /* 按可用宽度算格子尺寸，写入 .wl 上的 --wl-cell（A 方案：9~14px）。
   *
   * 为什么用 JS 而不是 CSS calc —— 两条纯 CSS 路线都实测失败：
   *   ① 100%：.wl-board 是 width:max-content，百分比在固有尺寸计算里解析为 0
   *      （诊断实测 grid 列全 0px、格子塌到 9px 下限），且存在循环依赖。
   *   ② 100vw：包含块不是视口（中间隔着 .layout 15px×2、.wl padding、滚动条），
   *      1280px 视口真实可用仅约 1195px，算出来偏大 → 撑破容器 → 出横向滚动条。
   * JS 直接量 .wl 的内容盒宽度，既没有循环依赖，也天然扣掉了滚动条。
   *
   * 内部开销 = 星期轴 30 + 列间距 8 + board padding×2 + board 边框 2。
   * 这些值从 DOM 实读，不写死 —— board 的 padding 是 clamp()，随视口变。 */
  /* 量出可用宽度，据此定格子尺寸。
   *
   * 布局不变量（改任一条都要重新验算）：
   *   .wl            满宽，无 zoom（文字放大改用 font-size，不影响布局宽度）
   *   .wl-board      width:100%（吃满 .wl 内容盒），padding 由 clamp() 决定
   *   .wl-scroll     overflow-x:auto，格子放不下时才横滚
   *   .wl-canvas     第 1 列 = --wl-axis（JS 写入），第 2 列 = max-content
   *   .wl-grid       列宽 = --wl-cell，列数 = --wl-cols
   *
   * ⚠️ 单位：早期 .wl 带过 zoom:1.4，zoom 会同时放大布局宽度与 getComputedStyle
   *   返回的 px 值，量测与布局的基准不一致，必须到处除以系数才对得上，
   *   而那一堆换算正是左右留白差 8px 的来源。zoom 已改为 font-size，
   *   此函数现在全程单一单位（CSS 布局像素），不做任何缩放换算。
   *
   * 三个纯 CSS 方案都实测失败（记录在此，避免再试）：
   *   ① 100%：在 max-content 容器的固有尺寸计算里解析为 0 → 格子塌到下限。
   *   ② 100vw：包含块不是视口（隔着 .layout 的 padding、滚动条），偏大 → 溢出。
   *   ③ max-width 压在格子上：格子固有尺寸变小，grid 判定放得下 → 既溢出也不滚动，
   *      但格子比列窄，视觉参差。 */
  function fitCells() {
    // 自动调整格子尺寸，让四个月刚好填满容器，不出现横向滚动条
    var board = document.querySelector('.wl-board')
    if (!board) return

    var boardStyle = getComputedStyle(board)
    var paddingX = parseFloat(boardStyle.paddingLeft) + parseFloat(boardStyle.paddingRight)
    var availableWidth = board.clientWidth - paddingX

    // 星期轴宽度
    var axis = document.querySelector('.wl-axis')
    var axisWidth = axis ? axis.offsetWidth : 20
    var gap = 8  // --wl-gap 月内列间距

    // 当前显示几个月（四个月约 17 周）
    // 总列数 = 四个月列数之和 + 3个月份间隙（每个间隙=1个格子宽）
    var cols = Math.ceil(cells.length / 7) || 17
    var monthGaps = 3  // 四个月之间3个间隙

    // 计算格子宽度：(可用宽度 - 轴宽 - 月内间距 - 月份间隙) / (总列数 + 月份间隙)
    // 留 20px 余量，防止月份标签和滚动条导致溢出
    var cellWidth = (availableWidth - axisWidth - (cols - 1) * gap - 20) / (cols + monthGaps)

    // 限制最小最大尺寸
    cellWidth = Math.max(12, Math.min(24, cellWidth))

    // 写入 CSS 变量
    board.style.setProperty('--wl-cell', cellWidth + 'px')
    board.style.setProperty('--wl-cols', String(cols))
  }

  /* 年份状态 */
  var viewYear = new Date().getFullYear()
  var quarter = Math.floor(new Date().getMonth() / 4)  // 默认跳到当前月份所在的4个月组
  var rememberedView = window.BikoView?.read('calendar')
  if (rememberedView) {
    if (Number.isInteger(rememberedView.year) && rememberedView.year >= 1900 && rememberedView.year <= 2200) viewYear = rememberedView.year
    if ([0, 1, 2].indexOf(rememberedView.quarter) !== -1) quarter = rememberedView.quarter
    if (Number.isInteger(rememberedView.week) && Math.abs(rememberedView.week) < 5200) weekOffset = rememberedView.week
  }
  window.BikoView?.register('calendar', function () { return { year: viewYear, quarter: quarter, week: weekOffset, view: yearViewEl.hidden ? 'week' : 'year', y: window.scrollY } })
  var MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  /* 渲染日历墙：只显示当前组的四个月 */
  function buildGrid() {
    todayK = today()
    cells = []

    grid.innerHTML = ''
    monthsEl.innerHTML = ''

    fitCells()

    // 当前组的四个月
    var startMonth = quarter * 4
    var endMonth = startMonth + 4

    // 先计算每个月的列数，用于按比例分配宽度
    var monthCols = []
    for (var m = startMonth; m < endMonth; m++) {
      var daysInMonth = new Date(viewYear, m + 1, 0).getDate()
      var firstDay = new Date(viewYear, m, 1)
      var dow = (firstDay.getDay() + 6) % 7
      // 这个月占多少列：前导空格 + 天数 + 尾空格，按周数算
      var totalCells = dow + daysInMonth
      var cols = Math.ceil(totalCells / 7)
      monthCols.push(cols)
    }

    // 外层容器：四个月按列数比例分配宽度
    var monthsRow = document.createElement('div')
    monthsRow.className = 'wl-months-row'
    monthsRow.style.gridTemplateColumns = monthCols.map(function(c) { return c + 'fr' }).join(' ')

    for (var i = 0; i < 4; i++) {
      var m = startMonth + i
      var daysInMonth = new Date(viewYear, m + 1, 0).getDate()
      var firstDay = new Date(viewYear, m, 1)
      var dow = (firstDay.getDay() + 6) % 7

      // 月份容器
      var monthEl = document.createElement('div')
      monthEl.className = 'wl-month'

      // 月份标签（放在每个月容器内部顶部居中）
      var monthLabel = document.createElement('div')
      monthLabel.className = 'wl-month-label'
      monthLabel.textContent = (m + 1) + ' 月'
      monthEl.appendChild(monthLabel)

      // 这个月的格子grid
      var monthGrid = document.createElement('div')
      monthGrid.className = 'wl-month-grid'
      monthGrid.style.gridTemplateColumns = 'repeat(' + monthCols[i] + ', max-content)'
      monthGrid.style.gridTemplateRows = 'repeat(7, var(--wl-cell))'
      monthGrid.style.gridAutoFlow = 'column'  // 按列排列，每列是一周

      // 前导空格
      for (var d = 0; d < dow; d++) {
        var empty = document.createElement('div')
        empty.className = 'wl-cell wl-cell-empty'
        empty.style.visibility = 'hidden'
        monthGrid.appendChild(empty)
      }

      // 这个月的每天
      for (var day = 1; day <= daysInMonth; day++) {
        var cur = new Date(viewYear, m, day)
        var k = keyOf(cur)

        var el = document.createElement('button')
        el.type = 'button'
        el.className = 'wl-cell'
        el.setAttribute('data-key', k)
        el.setAttribute('data-lv', '0')
        el.setAttribute('role', 'gridcell')
        el.tabIndex = (k === todayK) ? 0 : -1

        if (k > todayK) el.setAttribute('data-future', '1')
        if (k === todayK) el.setAttribute('data-today', '1')

        monthGrid.appendChild(el)
        cells.push({ el: el, key: k })
      }

      monthEl.appendChild(monthGrid)
      monthsRow.appendChild(monthEl)
    }

    // 把格子行放进grid容器（月份标签已在每个月容器里）
    grid.appendChild(monthsRow)

    // 更新月份轮播标题
    var quarterTitle = document.getElementById('wl-month-nav-title')
    if (quarterTitle) {
      quarterTitle.textContent = MONTH_NAMES[startMonth] + ' - ' + MONTH_NAMES[endMonth - 1]
    }

    yearTitle.textContent = viewYear + '年'
    paint()
  }

  /* 重算月份轴的横向位置。
     为什么要单独抽出来：--wl-cell 现在是 clamp() 自适应，格子尺寸会随窗口宽度变化，
     而月份轴是绝对定位、位置只在 buildGrid 时算过一次。
     窗口一缩放格子就变宽/变窄，标签却停在老位置 → 月份和格子对不上。
     所以 resize 时只重排这排标签，不重建 371 个格子（重建会丢焦点、也浪费）。
     步长同样用 offsetLeft 差值回读真实布局，与 buildGrid 里那套口径保持一致。 */
  function layoutMonths() {
    if (!monthsEl || !cells.length) return
    
    // 找到每列的第一个格子（周一），计算列宽
    var firstColCells = []
    for (var i = 0; i < cells.length; i++) {
      // 每列第 0 个格子（第 0 行 = 周一）
      if (i % 7 === 0) {
        firstColCells.push(cells[i])
      }
      if (firstColCells.length >= 2) break
    }
    
    var step = 0
    var firstColLeft = 0
    if (firstColCells.length >= 2) {
      firstColLeft = firstColCells[0].el.offsetLeft
      step = firstColCells[1].el.offsetLeft - firstColCells[0].el.offsetLeft
    }
    
    if (!step || step <= 0.5) {
      // 兜底：用 grid 宽度 / 列数
      var cols = Math.ceil(cells.length / 7)
      step = grid.offsetWidth / cols
    }
    
    // 摆放月份标签
    clampMonths(step, firstColLeft)
    
    // 摆放月份虚线
    var lines = grid.querySelectorAll('.wl-month-line')
    for (var i = 0; i < lines.length; i++) {
      var col = Number(lines[i].getAttribute('data-col'))
      if (!isFinite(col)) continue
      var left = firstColLeft + col * step
      lines[i].style.left = left + 'px'
    }
  }

  /* 按步长摆放月份标签，并把右端越界的标签收回网格内。
   *
   * 为什么必须收回：标签是 position:absolute，越界的文字不计入 .wl-canvas 的宽度，
   * 但会撑大 .wl-scroll 的 scrollWidth —— 格子明明装得下，却凭空多出一条横向滚动条
   * （实测 640px 档溢出 20px、768px 档 16px、940px 档 9px）。
   * CSS 侧另有 overflow:clip 兜底，这里做的是「让文字尽量完整可见」：
   * 越界的标签改为右缘贴齐网格右缘，而不是被裁掉。
   *
   * 每次重排都要重算 —— 窗口一缩放，格子尺寸和步长都变，越界与否也跟着变。 */
  function clampMonths(step, firstColLeft) {
    if (!monthsEl) return
    var gridW = grid.offsetWidth
    if (!(gridW > 0)) return
    firstColLeft = firstColLeft || 0
    var spans = monthsEl.children
    for (var i = 0; i < spans.length; i++) {
      var col = Number(spans[i].getAttribute('data-col'))
      if (!isFinite(col)) continue
      var left = firstColLeft + col * step
      /* offsetWidth 是当前文字宽度：在 max-content 里标签宽度只由字号决定，
         先设 left 再读宽度也不会变，直接用它做边界判断 */
      var tw = spans[i].offsetWidth
      if (left + tw > gridW) left = gridW - tw
      if (left < 0) left = 0
      spans[i].style.left = left + 'px'
    }
  }

  /* 获取当天最主要的标签（最多的那个） */
  function getDominantTag(k) {
    var list = itemsOf(k)
    if (!list.length) return '其他'
    var counts = {}
    list.forEach(function (item) {
      counts[item.tag] = (counts[item.tag] || 0) + 1
    })
    var maxTag = '其他'
    var maxCount = 0
    for (var tag in counts) {
      if (counts[tag] > maxCount) {
        maxCount = counts[tag]
        maxTag = tag
      }
    }
    return maxTag
  }

  /* 当天是否存在「未完成待办」：格子用琥珀色边提示，区别于普通记录强度色 */
  function hasOpenTodo(k) {
    return itemsOf(k).some(function (it) { return it.kind === 'todo' && !it.done })
  }

  /* 把 records 映射到格子颜色 */
  function paint() {
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i]
      var list = itemsOf(c.key)
      var n = list.length
      var openTodos = list.filter(function (it) { return it.kind === 'todo' && !it.done })
      c.el.setAttribute('data-lv', String(levelOf(n)))
      c.el.setAttribute('data-tag', n ? getDominantTag(c.key) : '')
      if (openTodos.length) c.el.setAttribute('data-open-todo', '1')
      else c.el.removeAttribute('data-open-todo')

      var base = tipDate(c.key).replace(/\s+/g, ' ')
      if (c.key === todayK) base += '（今天）'
      if (openTodos.length) base += '（未完成待办 ' + openTodos.length + ' 项）'
      else if (c.key > todayK) base += list.length ? '（有安排）' : '（还没到这天）'
      else base += n ? '（' + n + ' 条记录）' : '（这天没有记录）'
      c.el.setAttribute('aria-label', base)
    }
    renderStats()
    /* aria-label 会改变按钮的 min-content 宽度（格子列是 auto），
       在首帧放得下、渲染文案后放不下时会把 grid 撑宽。
       这里补算一次，保证「文案已就位的真实尺寸」也参与定宽。 */
    fitCells()
    layoutMonths()
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
    renderMonthlyChart()
    renderAgenda()
  }

  /* 两个日期键相差的天数（b - a），按本地日历日 */
  function dayDiff(a, b) {
    return Math.round((parseKey(b) - parseKey(a)) / 86400000)
  }

  /* A 方案今日聚合面板：上 = 未完成待办（逾期 / 今天 / 后续，可原地勾选）；
     下 = 今日工作记录（仅 log，只读列表 + 记一条入口）。 */
  function renderAgenda() {
    if (!agendaEl) return
    var writable = backend === 'ok'

    var buckets = { overdue: [], today: [], future: [] }
    allItems().forEach(function (row) {
      if (row.item.kind !== 'todo' || row.item.done) return
      if (row.key < todayK) buckets.overdue.push(row)
      else if (row.key === todayK) buckets.today.push(row)
      else buckets.future.push(row)
    })
    var totalTodo = buckets.overdue.length + buckets.today.length + buckets.future.length
    if (todoCountEl) todoCountEl.textContent = String(totalTodo)

    function groupBlock(title, rows, cls) {
      if (!rows.length) return ''
      var head = '<div class="wl-todo-group-head ' + cls + '"><span>' + title + '</span><b>' + rows.length + '</b></div>'
      var body = rows.map(function (row) {
        var it = row.item
        var meta
        if (row.key < todayK) meta = '逾期 ' + dayDiff(row.key, todayK) + ' 天 · ' + row.key.slice(5)
        else if (row.key === todayK) meta = '今天' + (it.t ? ' · ' + it.t : '')
        else meta = row.key.slice(5) + ' ' + WEEK[parseKey(row.key).getDay()]
        var dotColor = TAG_COLORS[it.tag] || TAG_COLORS['其他']
        return '<div class="wl-todo-row' + (row.key < todayK ? ' is-overdue' : '') + '" data-key="' + row.key + '">' +
          '<label class="wl-todo-check"><input type="checkbox" data-op="toggle" data-key="' + row.key +
            '" data-idx="' + row.index + '" data-id="' + esc(it.id) + '"' + (writable ? '' : ' disabled') + '></label>' +
          '<span class="wl-todo-dot" style="background:' + dotColor + '"></span>' +
          '<span class="wl-todo-text" data-goto-date="' + row.key + '">' + esc(it.text) + '</span>' +
          '<span class="wl-todo-meta">' + esc(meta) + '</span>' +
        '</div>'
      }).join('')
      return head + '<div class="wl-todo-group-body">' + body + '</div>'
    }

    var todoHtml = ''
    if (totalTodo === 0) {
      todoHtml = '<p class="wl-agenda-empty">暂无未完成待办，享受当下。</p>'
    } else {
      todoHtml += groupBlock('已逾期', buckets.overdue, 'is-overdue')
      todoHtml += groupBlock('今天', buckets.today, 'is-today')
      todoHtml += groupBlock('后续计划', buckets.future, 'is-future')
    }
    if (todoGroupsEl) todoGroupsEl.innerHTML = todoHtml

    /* 今日工作记录（仅 log；当天待办已在上区，避免重复） */
    var todayLogs = itemsOf(todayK).filter(function (it) { return it.kind === 'log' })
    if (todayLogsEl) {
      if (!todayLogs.length) {
        todayLogsEl.innerHTML = '<li class="wl-agenda-empty">今天还没有记录。</li>'
      } else {
        todayLogsEl.innerHTML = todayLogs.map(function (it) {
          var dot = TAG_COLORS[it.tag] || TAG_COLORS['其他']
          return '<li><time>' + esc(it.t || '') + '</time>' +
            '<span class="wl-todo-dot" style="background:' + dot + '"></span>' +
            '<p>' + esc(it.text) + '</p></li>'
        }).join('')
      }
    }

    var addBtn = $('wl-today-add')
    if (addBtn) addBtn.onclick = function () { openPanel(todayK, -1, 'log') }
  }

  /* ============================================================
   * 周视图
   * ============================================================ */

  /* 获取某周的周一日期 */
  function getMonday(offset) {
    var d = new Date()
    var day = d.getDay() || 7  // 周日=0转成7
    var diff = 1 - day + offset * 7
    d.setDate(d.getDate() + diff)
    return d
  }

  /* 渲染周视图 */
  function renderWeekView() {
    if (!weekDaysEl) return

    var monday = getMonday(weekOffset)
    var weekStart = monday.getMonth() + 1 + '月' + monday.getDate() + '日'

    // 算周日
    var sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    var weekEnd = (monday.getMonth() === sunday.getMonth())
      ? sunday.getDate() + '日'
      : (sunday.getMonth() + 1) + '月' + sunday.getDate() + '日'

    weekTitleEl.textContent = weekStart + ' - ' + weekEnd

    // 渲染7天
    var html = ''
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday)
      d.setDate(d.getDate() + i)
      var k = keyOf(d)
      var list = itemsOf(k)
      var isToday = k === todayK
      var dayNames = ['一', '二', '三', '四', '五', '六', '日']

      html += '<div class="wl-week-day' + (isToday ? ' is-today' : '') + '">'
      html += '<div class="wl-week-day-head">'
      html += '<span class="wl-week-day-name">' + dayNames[i] + '</span>'
      html += '<span class="wl-week-day-num">' + (d.getMonth() + 1) + '/' + d.getDate() + '</span>'
      html += '</div>'
      html += '<div class="wl-week-day-records">'

      if (list.length === 0) {
        html += '<div class="wl-week-day-empty">无记录</div>'
      } else {
        list.forEach(function (it) {
          var color = TAG_COLORS[it.tag] || TAG_COLORS['其他']
          html += '<div class="wl-week-record' + (it.done ? ' is-done' : '') + '">'
          html += '<span class="wl-week-record-dot" style="background:' + color + '"></span>'
          html += '<span class="wl-week-record-text">' +
            (it.kind === 'todo'
              ? '<i class="fas ' + (it.done ? 'fa-circle-check' : 'fa-circle') + ' wl-todo-ico" aria-hidden="true"></i>'
              : '') +
            esc(it.text) + '</span>'
          html += '</div>'
        })
      }

      html += '</div>'
      html += '<button class="wl-week-day-add" data-date="' + k + '" type="button" title="记录这一天">'
      html += '<i class="fas fa-plus"></i>'
      html += '</button>'
      html += '</div>'
    }

    weekDaysEl.innerHTML = html

    // 绑定添加按钮
    weekDaysEl.querySelectorAll('.wl-week-day-add').forEach(function (btn) {
      btn.onclick = function () {
        openPanel(btn.dataset.date)
      }
    })
  }

  /* 切换视图 */
  function switchView(view) {
    if (view === 'year') {
      yearViewEl.hidden = false
      weekViewEl.hidden = true
      viewYearBtn.classList.add('is-active')
      viewWeekBtn.classList.remove('is-active')
    } else {
      yearViewEl.hidden = true
      weekViewEl.hidden = false
      viewYearBtn.classList.remove('is-active')
      viewWeekBtn.classList.add('is-active')
      renderWeekView()
    }
  }

  /* ============================================================
   * 导出月报
   * ============================================================ */

  function exportMonthlyReport() {
    var now = new Date()
    var yyyy = now.getFullYear()
    var mm = now.getMonth() + 1
    var prefix = yyyy + '-' + String(mm).padStart(2, '0')

    // 收集本月所有记录，按日期分组
    var monthRecords = {}
    for (var k in records) {
      if (!Object.prototype.hasOwnProperty.call(records, k)) continue
      if (k.indexOf(prefix) !== 0) continue
      monthRecords[k] = itemsOf(k)
    }

    // 生成 Markdown
    var md = '# ' + yyyy + '年' + mm + '月工作记录\n\n'
    md += '## 统计概览\n\n'
    var total = 0
    var days = 0
    var tagCounts = { '实验': 0, '写作': 0, '组会': 0, '读论文': 0, '其他': 0 }

    for (var k in monthRecords) {
      var list = monthRecords[k]
      if (list.length > 0) {
        days++
        total += list.length
        list.forEach(function (it) {
          var tag = it.tag
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    }

    md += '- 总记录数：' + total + ' 条\n'
    md += '- 活跃天数：' + days + ' 天\n'
    md += '- 记录分类：\n'
    TAGS.forEach(function (tag) {
      md += '  - ' + tag + '：' + (tagCounts[tag] || 0) + ' 条\n'
    })
    md += '\n---\n\n'

    // 按日期倒序排列
    var sortedKeys = Object.keys(monthRecords).sort().reverse()
    sortedKeys.forEach(function (k) {
      var list = monthRecords[k]
      if (list.length === 0) return
      md += '## ' + k + '\n\n'
      list.forEach(function (it) {
        md += '- [' + (it.kind === 'todo' ? '待办 · ' : '') + it.tag + '] ' + it.text
        if (it.done) md += '（已完成' + (it.doneAt ? ' ' + it.doneAt : '') + '）'
        md += '\n'
      })
      md += '\n'
    })

    // 下载文件
    var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url
    a.download = 'worklog-' + prefix + '.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /* 渲染月度标签分布图表 */
  function renderMonthlyChart() {
    var now = new Date()
    var yyyy = now.getFullYear()
    var mm = now.getMonth() + 1
    var prefix = yyyy + '-' + String(mm).padStart(2, '0')

    // 统计本月各标签的记录数
    var tagCounts = { '实验': 0, '写作': 0, '组会': 0, '读论文': 0, '其他': 0 }
    var monthTotal = 0
    for (var k in records) {
      if (!Object.prototype.hasOwnProperty.call(records, k)) continue
      if (k.indexOf(prefix) !== 0) continue
      var list = itemsOf(k)
      list.forEach(function (it) {
        if (it.kind !== 'log') return
        var tag = it.tag
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
        monthTotal++
      })
    }

    // 渲染图表
    var barsEl = $('wl-chart-bars')
    var titleEl = $('wl-chart-title')
    if (!barsEl || !titleEl) return

    titleEl.textContent = mm + '月记录分布（共 ' + monthTotal + ' 条）'

    if (monthTotal === 0) {
      barsEl.innerHTML = '<div class="wl-chart-empty">本月还没有记录</div>'
      return
    }

    var html = ''
    TAGS.forEach(function (tag) {
      var count = tagCounts[tag] || 0
      var pct = monthTotal > 0 ? Math.round(count / monthTotal * 100) : 0
      var color = TAG_COLORS[tag] || TAG_COLORS['其他']
      html += '<div class="wl-chart-row">' +
                '<span class="wl-chart-label">' + tag + '</span>' +
                '<div class="wl-chart-bar-bg">' +
                  '<div class="wl-chart-bar" style="width:' + pct + '%;background:' + color + '"></div>' +
                '</div>' +
                '<span class="wl-chart-num">' + count + '条</span>' +
              '</div>'
    })
    barsEl.innerHTML = html
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
    var list = itemsOf(k)
    var writable = backend === 'ok'

    if (!list.length) {
      var empty = '<p class="wl-tip-empty">' +
        (k > todayK ? '未来日期，可新建待办' : '这天没有记录 · 也许在休息') + '</p>'
      if (writable) {
        empty += '<span class="wl-tip-sum">点格子可以添加' + (k > todayK ? '待办' : '一条') + '</span>'
      }
      return out + empty
    }

    var openCount = list.filter(function (it) { return it.kind === 'todo' && !it.done }).length
    out += '<ul>'
    for (var i = 0; i < list.length; i++) {
      var it = list[i]
      out += '<li' + (writable ? ' data-idx="' + i + '"' : '') + (it.done ? ' class="is-done"' : '') + '>'
        + '<time>' + esc(it.t || '') + '</time>'
        + (it.kind === 'todo' ? '<i class="fas fa-circle-dot wl-todo-ico" aria-hidden="true"></i>' : '')
        + '<p>' + esc(it.text) + '</p>'
      if (writable) {
        out += '<button class="wl-tip-del" type="button" data-idx="' + i +
          '" title="删除这一条" aria-label="删除第 ' + (i + 1) + ' 条记录">' +
          '<i class="fas fa-trash-can" aria-hidden="true"></i></button>'
      }
      out += '</li>'
    }
    out += '</ul><span class="wl-tip-sum">共 ' + list.length + ' 条'
    if (openCount) out += ' · 未完成待办 ' + openCount
    out += '</span>'
    return out
  }

  function showTip(el) {
    var k = el.getAttribute('data-key')
    if (!k) return
    tipKey = k
    tipEl.innerHTML = tipHTML(k)
    tipEl.classList.add('is-on')
    tipEl.setAttribute('aria-hidden', 'false')
    /* 可写的日子必须能点到删除按钮，否则 pointer-events:none 会把点击吃掉 */
    tipEl.classList.toggle('has-actions', backend === 'ok' && itemsOf(k).length > 0)
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
    var below = false

    /* 上方放不下就翻到下方；below 同时用于 ::after 安全区（鼠标滑向卡片时
       不会经过空隙而触发 mouseout 把卡片关掉，导致点不到删除按钮） */
    if (top < 8) { top = r.bottom + gap; below = true }
    if (left < 8) left = 8
    if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8

    tipEl.classList.toggle('below', below)
    tipEl.style.left = Math.round(left) + 'px'
    tipEl.style.top = Math.round(top) + 'px'
  }

  function hideTip(force) {
    /* 触屏下卡片一旦被 tap「钉住」，划过/滚动都不应把它带走，
       否则手指刚点开就没得点了。只有 force（点空白、换页）才收起。 */
    if (pinned && !force) return
    pinned = false
    tipKey = null
    tipEl.classList.remove('is-on')
    tipEl.classList.remove('has-actions')
    tipEl.setAttribute('aria-hidden', 'true')
  }

  /* ============================================================
   * 输入卡（追加 / 修改；点历史日期也能补记，不再只有今天能写）
   * ============================================================ */
  function openPanel(k, editIndex_, forceKind) {
    openKey = k
    editIndex = Number.isInteger(editIndex_) ? editIndex_ : -1
    errEl.textContent = ''
    cancelDelete()
    /* 记住是谁打开的面板，关闭时把焦点还回去（否则焦点掉到 body，键盘用户懵） */
    lastFocus = document.activeElement

    var list = itemsOf(k)
    var editing = Number.isInteger(editIndex) && editIndex >= 0 && editIndex < list.length

    titleEl.textContent = humanDate(k)

    if (editing) {
      var ed = list[editIndex]
      inputEl.value = ed.text
      setCurrentTag(ed.tag)
      setCurrentKind(ed.kind)
      inputEl.placeholder = ed.kind === 'todo'
        ? '修改这条待办…（Ctrl / ⌘ + Enter 保存）'
        : '修改这条记录…（Ctrl / ⌘ + Enter 保存）'
    } else {
      var kind = (forceKind === 'log' || forceKind === 'todo')
        ? forceKind
        : (k > todayK ? 'todo' : 'log')
      setCurrentKind(kind)
      setCurrentTag('其他')
      inputEl.value = ''
      inputEl.placeholder = kind === 'todo'
        ? '要办什么事？（Ctrl / ⌘ + Enter 保存；可指派到未来日期）'
        : '今天做了什么…（Ctrl / ⌘ + Enter 保存）'
    }
    updateCount()

    // 已有记录作为上下文列出（追加模式，不覆盖）
    existingTitle.textContent = list.length
      ? (editing ? '改完保存会覆盖第 ' + (editIndex + 1) + ' 条' : '已有记录 · 继续追加')
      : ''
    existingEl.innerHTML = ''
    for (var i = 0; i < list.length; i++) {
      var it = list[i]
      var li = document.createElement('li')
      li.className = 'wl-exist-item'
      if (editing && i === editIndex) li.className += ' is-editing'
      if (it.done) li.className += ' is-done'
      if (it.kind === 'todo') li.className += ' is-todo'

      // 待办前置完成勾选（普通日志条目不显示勾选框）
      var checkHtml = ''
      if (it.kind === 'todo' && backend === 'ok') {
        checkHtml = '<label class="wl-exist-check"><input type="checkbox" data-op="toggle" data-idx="' + i +
          '" data-id="' + esc(it.id) + '"' + (it.done ? ' checked' : '') +
          ' title="标记完成 / 取消完成"></label>'
      }
      li.innerHTML = checkHtml +
        '<time>' + esc(it.t || '') + '</time>' +
        '<span class="wl-tag-dot" style="background:' + (TAG_COLORS[it.tag] || TAG_COLORS['其他']) + '"></span>' +
        '<p>' + esc(it.text || '') +
        (it.doneAt ? '<em class="wl-done-at">' + esc(it.doneAt) + '</em>' : '') + '</p>'
      if (backend === 'ok') {
        var act = document.createElement('span')
        act.className = 'wl-existing-ops'
        act.innerHTML =
          '<button type="button" class="wl-op" data-op="edit" data-idx="' + i +
            '" title="修改这一条" aria-label="修改第 ' + (i + 1) + ' 条记录">' +
            '<i class="fas fa-pen" aria-hidden="true"></i></button>' +
          '<button type="button" class="wl-op wl-op-del" data-op="del" data-idx="' + i +
            '" title="删除这一条" aria-label="删除第 ' + (i + 1) + ' 条记录">' +
            '<i class="fas fa-trash-can" aria-hidden="true"></i></button>'
        li.appendChild(act)
      }
      existingEl.appendChild(li)
    }

    // 没存过口令就亮出口令框（读公开、写受控）；存过则给「换口令」
    syncTokenUI()

    // 后端可用即可保存；具体类型是否允许未来日期由后端按 kind 校验
    var canWrite = backend === 'ok'
    saveBtn.disabled = !canWrite
    saveBtn.title = canWrite
      ? (k > todayK && currentKind === 'log' ? '未来日期只能建待办' : '')
      : '当前不可写入'

    modal.hidden = false

    /* 无障碍：给背景加 inert，防止背景元素被聚焦 */
    var mainEl = document.getElementById('body-wrap') || document.body
    if (mainEl && 'inert' in mainEl) mainEl.inert = true

    later(function () {
      if (!canWrite) return
      (readToken() ? inputEl : tokenInput).focus()
    }, 40)
  }

  function closePanel() {
    modal.hidden = true
    cancelDelete()
    openKey = null
    inputEl.value = ''
    errEl.textContent = ''

    /* 无障碍：移除背景 inert */
    var mainEl = document.getElementById('body-wrap') || document.body
    if (mainEl && 'inert' in mainEl) mainEl.inert = false

    /* 焦点归还：谁打开的就还给谁 */
    if (lastFocus && typeof lastFocus.focus === 'function' && document.contains(lastFocus)) {
      try { lastFocus.focus({ preventScroll: true }) } catch (e) { lastFocus.focus() }
    }
    lastFocus = null
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
    footEl.hidden = false

    probe().then(function (r) {
      if (r.ok) {
        backend = 'ok'
        records = r.data || {}
        note('')
        footEl.textContent = ''
        footEl.hidden = true
      } else {
        backend = 'unavailable'
        note(Object.keys(records).length ? '连接失败，已保留加载过的记录，暂不支持修改。' : '当前页面仅可查看，暂不支持新增或修改记录。', 'fa-triangle-exclamation')
        footEl.textContent = '只读模式 · 点格子可查看，暂不支持写入'
        if (r.message) footEl.textContent += '（' + r.message + '）'
        footEl.hidden = false
        var retry = document.createElement('button')
        retry.type = 'button'; retry.className = 'ui-retry'; retry.textContent = '重试加载'
        retry.onclick = load
        $('wl-note-text').appendChild(retry)
      }
      paint()
      if (rememberedView && !location.hash) { window.BikoView?.restoreScroll(rememberedView.y, grid.closest('.wl')); rememberedView = null }
      var url = new URL(location.href)
      if (url.searchParams.get('compose') === '1' && agendaEl && agendaEl.isConnected) {
        url.searchParams.delete('compose')
        history.replaceState(history.state, '', url)
        $('wl-today-add').click()
      }
    })
  }

  function authHeaders(token) {
    return { 'content-type': 'application/json', 'authorization': 'Bearer ' + token }
  }

  function save() {
    if (saving || !openKey) return

    var text = inputEl.value.trim()
    if (!text) { errEl.textContent = '写点什么再保存吧'; inputEl.focus(); return }
    if (text.length > MAX_TEXT) { errEl.textContent = '超出 ' + MAX_TEXT + ' 字上限'; return }

    var token = tokenInput.value.trim() || readToken()
    if (!token) { errEl.textContent = '请填写记录口令'; tokenInput.focus(); return }

    var list = itemsOf(openKey)
    var editing = Number.isInteger(editIndex) && editIndex >= 0 && editIndex < list.length
    var payloadCommon = { date: openKey, kind: currentKind, tag: currentTag, text: text }

    var steps = []
    if (editing) {
      var old = list[editIndex]
      if (old.id) {
        /* 新数据：原地 update，保住 id / done / doneAt，不会因编辑丢失完成态 */
        steps.push(function () {
          return request('/update', {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify(Object.assign({ id: old.id }, payloadCommon))
          })
        })
      } else {
        /* 旧数据（无 id）：删旧条 + 追加新条的兼容路径 */
        var rawOld = listOf(openKey)[editIndex]
        steps.push(function () {
          return request('/remove', {
            method: 'DELETE',
            headers: authHeaders(token),
            body: JSON.stringify({ date: openKey, index: editIndex, text: rawOld && rawOld.text })
          })
        })
        steps.push(function () {
          return request('/add', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payloadCommon) })
        })
      }
    } else {
      steps.push(function () {
        return request('/add', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payloadCommon) })
      })
    }

    saving = true
    errEl.textContent = ''
    saveBtn.disabled = true
    saveBtn.textContent = '保存中…'

    var chain = Promise.resolve()
    steps.forEach(function (step) { chain = chain.then(step) })

    chain.then(function (r) {
      if (r.status === 401) throw new Error('口令不正确')
      if (r.status >= 400 || !r.body || !r.body.ok) {
        throw new Error((r.body && r.body.message) || '保存失败（HTTP ' + r.status + '）')
      }

      // 成功：口令存本机，减少重复输入
      writeToken(token)
      syncTokenUI()

      var savedKey = openKey
      var savedEditing = editing
      reload().then(function () { dropAnim(savedKey) })
      closePanel()
      window.BikoFeedback?.show(savedEditing ? '记录已更新' : '记录已保存', { kind: 'success' })
      if (footEl) {
        footEl.hidden = false
        footEl.textContent = savedEditing
          ? '已更新 · 点格子可继续追加'
          : '已保存 · 待办可在上方清单勾选完成'
      }
    }).catch(function (e) {
      errEl.textContent = e && e.message ? e.message : '网络异常，请稍后重试'
      window.BikoFeedback?.show('保存失败，输入内容已保留。请检查网络后再次保存。', { kind: 'error' })
    }).then(function () {
      saving = false
      saveBtn.disabled = false
      saveBtn.textContent = '保存'
    })
  }

  /* 切换待办完成态：优先 id 定位，回退 index。弹窗清单与今日聚合清单共用。 */
  function toggleDone(key, id, index) {
    if (saving || backend !== 'ok') return
    var token = tokenInput.value.trim() || readToken()
    if (!token) { errEl.textContent = '请先填写记录口令'; tokenInput.focus(); return }

    saving = true
    var body = { date: key }
    if (id) body.id = id
    else if (Number.isInteger(index)) body.index = index

    request('/toggle', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(body) })
      .then(function (r) {
        if (r.status === 401) throw new Error('口令不正确')
        if (r.status >= 400 || !r.body || !r.body.ok) {
          throw new Error((r.body && r.body.message) || '操作失败（HTTP ' + r.status + '）')
        }
        writeToken(token)
        var finished = r.body.entry && r.body.entry.done
        reload().then(function () {
          note(finished ? '已标记完成' : '已取消完成', finished ? 'fa-circle-check' : 'fa-rotate-left')
          later(function () { note('') }, 1800)
        })
      }).catch(function (e) {
        errEl.textContent = e && e.message ? e.message : '网络异常，请稍后重试'
      }).then(function () { saving = false })
  }

  /* 「落子」动画：同一天连点也要能重复播放 */
  function dropAnim(key) {
    var cell = grid.querySelector('.wl-cell[data-key="' + key + '"]')
    if (!cell) return
    cell.classList.remove('is-drop')
    void cell.offsetWidth          // 强制重排，让动画可重复播放
    cell.classList.add('is-drop')
  }

  /* ============================================================
   * 删除（带二次确认：删数据不可逆，不能一点就没）
   * ============================================================ */
  function askDelete(key, index) {
    pendingDel = { key: key, index: index }
    var item = itemsOf(key)[index]
    if (delHintEl) {
      delHintEl.textContent = item
        ? '确定删除「' + item.text + '」？删掉就找不回来了。'
        : '确定删除这条记录？'
    }
    if (delHintEl) delHintEl.hidden = false
    if (delYesEl) delYesEl.hidden = false
    if (delNoEl) delNoEl.hidden = false
    if (saveBtn) saveBtn.disabled = true
    if (delYesEl) delYesEl.focus()
  }

  function cancelDelete() {
    pendingDel = null
    if (delHintEl) { delHintEl.hidden = true; delHintEl.textContent = '' }
    if (delYesEl) delYesEl.hidden = true
    if (delNoEl) delNoEl.hidden = true
    if (saveBtn) saveBtn.disabled = backend !== 'ok'
  }

  function doDelete() {
    if (!pendingDel || saving) return
    var key = pendingDel.key
    var index = pendingDel.index
    var item = itemsOf(key)[index]
    if (!item) { cancelDelete(); return }

    var token = tokenInput.value.trim() || readToken()
    if (!token) {
      cancelDelete()
      errEl.textContent = '请先填写记录口令'
      if (tokenRow) tokenRow.hidden = false
      return
    }

    saving = true
    errEl.textContent = ''
    var btn = delYesEl
    if (btn) { btn.disabled = true; btn.textContent = '删除中…' }

    /* 新数据优先按 id 删除（不受下标漂移影响）；旧数据回退 index + text 校验 */
    var removeBody = item.id
      ? { date: key, id: item.id }
      : { date: key, index: index, text: item.text }

    request('/remove', {
      method: 'DELETE',
      headers: authHeaders(token),
      body: JSON.stringify(removeBody)
    }).then(function (r) {
      if (r.status === 401) throw new Error('口令不正确')
      if (r.status === 409) throw new Error('记录已变化，请关掉重开后再试')
      if (r.status >= 400 || !r.body || !r.body.ok) {
        throw new Error((r.body && r.body.message) || '删除失败（HTTP ' + r.status + '）')
      }
      writeToken(token)
      cancelDelete()
      closePanel()
      reload().then(function () {
        if (footEl) { footEl.textContent = '已删除 1 条记录'; footEl.hidden = false }
      })
    }).catch(function (e) {
      cancelDelete()
      errEl.textContent = e && e.message ? e.message : '网络异常，请稍后重试'
    }).then(function () {
      saving = false
      if (btn) { btn.disabled = false; btn.textContent = '删除' }
    })
  }

  /* 局部重拉：删除 / 编辑后重新对账，避免本地状态和后端漂移 */
  function reload() {
    return probe().then(function (r) {
      if (r.ok) { backend = 'ok'; records = r.data || {} }
      paint()
    })
  }

  /* ============================================================
   * 事件绑定
   * ============================================================ */
  function bind() {
    /* --- 年份切换按钮 --- */
    if (prevYearBtn) {
      on(prevYearBtn, 'click', function () {
        viewYear--
        buildGrid()
        reload()
      })
    }
    if (nextYearBtn) {
      on(nextYearBtn, 'click', function () {
        viewYear++
        buildGrid()
        reload()
      })
    }
    if (todayBtn) {
      on(todayBtn, 'click', function () {
        viewYear = new Date().getFullYear()
        var now = new Date()
        quarter = Math.floor(now.getMonth() / 4)
        buildGrid()
        reload()
      })
    }

    /* --- 视图切换按钮 --- */
    if (viewYearBtn) {
      on(viewYearBtn, 'click', function () { switchView('year') })
    }
    if (viewWeekBtn) {
      on(viewWeekBtn, 'click', function () { switchView('week') })
    }

    /* --- 周视图导航按钮 --- */
    if (prevWeekBtn) {
      on(prevWeekBtn, 'click', function () {
        weekOffset--
        renderWeekView()
      })
    }
    if (nextWeekBtn) {
      on(nextWeekBtn, 'click', function () {
        weekOffset++
        renderWeekView()
      })
    }

    /* --- 导出月报按钮 --- */
    var exportBtn = $('wl-export')
    if (exportBtn) {
      on(exportBtn, 'click', function () {
        if (backend !== 'ok') {
          alert('当前环境不支持导出（未启用后端）')
          return
        }
        exportMonthlyReport()
      })
    }

    /* --- 月份轮播按钮 --- */
    var prevQuarterBtn = $('wl-prev-quarter')
    var nextQuarterBtn = $('wl-next-quarter')
    if (prevQuarterBtn) {
      on(prevQuarterBtn, 'click', function () {
        quarter--
        if (quarter < 0) {
          quarter = 2
          viewYear--
        }
        buildGrid()
        reload()
      })
    }
    if (nextQuarterBtn) {
      on(nextQuarterBtn, 'click', function () {
        quarter++
        if (quarter > 2) {
          quarter = 0
          viewYear++
        }
        buildGrid()
        reload()
      })
    }

    /* --- 格子：悬停出卡片；点击决定可写/只读 --- */
    on(grid, 'mouseover', function (e) {
      if (TOUCH) return
      var el = e.target.closest ? e.target.closest('.wl-cell') : null
      if (el && grid.contains(el)) showTip(el)
    })
    on(grid, 'mouseout', function (e) {
      if (TOUCH) return
      var el = e.target.closest ? e.target.closest('.wl-cell') : null
      if (el && grid.contains(el) && !tipEl.contains(e.relatedTarget)) hideTip()
    })
    on(grid, 'focusin', function (e) {
      var el = e.target.closest ? e.target.closest('.wl-cell') : null
      if (el && grid.contains(el)) showTip(el)
    })
    on(grid, 'focusout', function () { if (!TOUCH) hideTip() })

    /* --- 卡片里的删除按钮：mouseenter 不能把卡片收掉，否则点不到 --- */
    on(tipEl, 'mouseenter', function () { /* 保持打开 */ })
    on(tipEl, 'mouseleave', function () { hideTip() })
    on(tipEl, 'click', function (e) {
      var del = e.target.closest ? e.target.closest('.wl-tip-del') : null
      if (!del) return
      e.stopPropagation()
      var cell = grid.querySelector('.wl-cell[data-key="' + tipKey + '"]')
      if (cell) openPanel(tipKey)
      askDelete(tipKey, Number(del.getAttribute('data-idx')) || 0)
    })

    on(grid, 'click', function (e) {
      var el = e.target.closest ? e.target.closest('.wl-cell') : null
      if (!el) return
      var k = el.getAttribute('data-key')
      if (!k) return

      // 触屏：tap = 选中并钉住卡片（没有 hover 可依赖）
      if (TOUCH) {
        hideTip(true)
        showTip(el)
        pinned = true
        // 仅可写环境打开输入卡：今天与未来（待办）直接打开；只读降级只钉住查看
        if (backend === 'ok' && k >= todayK) openPanel(k)
        return
      }

      // 鼠标：可写时今天 / 历史补记 / 未来待办都打开面板；条目类型由面板按日期默认。
      // 只读降级（GitHub Pages 无 Functions）只展示悬停卡片，不弹出保存被禁用的空输入卡。
      if (backend !== 'ok') { showTip(el); return }
      openPanel(k)
    })

    /* 触屏：点卡片/格子之外的空白处收起钉住的卡片 */
    on(document, 'click', function (e) {
      if (!pinned) return
      if (tipEl.contains(e.target)) return
      var cell = e.target.closest ? e.target.closest('.wl-cell') : null
      if (cell) return
      hideTip(true)
    })

    /* --- 卡片在滚动/缩放时收起，避免卡片与格子错位 --- */
    on(window, 'scroll', function () {
      /* 钉住的卡片（触屏）不跟着收，否则手指刚点开就被滚动带走 */
      if (tipEl.classList.contains('is-on') && !pinned) hideTip()
    }, true)

    /* 窗口尺寸变化有两件事要做：
       ① 收起悬停卡片（它按旧坐标绝对定位，留着会飘在错位置）
       ② 重排月份轴 —— 格子是 clamp() 自适应的，宽度变了标签就得跟着走。
          用 rAF 节流：拖拽窗口时 resize 会连续触发几十次，每次都量 offsetLeft
          会强制同步布局，导致卡顿。 */
    var rafId = 0
    /* rAF 兼容：jsdom 的旧版本和极老浏览器没有 requestAnimationFrame，
       缺失时退化成直接执行（宁可多算一次，也不要抛错打断绑定）。 */
    var raf = window.requestAnimationFrame
      ? function (fn) { return window.requestAnimationFrame(fn) }
      : function (fn) { return setTimeout(fn, 16) }
    var caf = window.cancelAnimationFrame
      ? function (id) { window.cancelAnimationFrame(id) }
      : function (id) { clearTimeout(id) }
    /* 存到模块级，destroy() 里要取消挂起的重排，
       否则 Pjax 换页后这个回调还会跑在已经卸掉的 DOM 上。 */
    cancelRaf = caf

    on(window, 'resize', function () {
      hideTip(true)
      if (rafId) return
      rafId = raf(function () {
        rafId = 0
        fitCells()
        layoutMonths()
      })
    })

    /* 比 window.resize 更可靠：主题切「关侧栏 / 开侧栏」、pjax 换页、
       滚动条出现/消失都会改变可用宽度，但不一定触发 window.resize。
       fitCells 会改 --wl-cell，进而改变 board 布局 —— 这正是 ResizeObserver 的观察对象，
       所以要观察 .wl 的【内容盒】而不是格子本身，避免自己触发自己形成死循环。 */
    if (typeof ResizeObserver === 'function') {
      var ro = new ResizeObserver(function () {
        if (rafId) return
        rafId = raf(function () {
          rafId = 0
          fitCells()
          layoutMonths()
        })
      })
      roEl = ro
      var host = grid.closest('.wl')
      if (host) ro.observe(host)
    }

    /* --- 输入卡 --- */
    /* 「日历与历史记录」已改为常开区块（不再是 details）：格子从首帧起就可见，
       初始的 fitCells / layoutMonths 本来就会跑，不必再监听 open 事件。 */
    on($('wl-close'), 'click', closePanel)
    on($('wl-cancel'), 'click', closePanel)
    on(saveBtn, 'click', save)
    on(inputEl, 'input', updateCount)

    /* 「换口令」：清掉本机口令并亮出口令框，公共设备上终于能登出 */
    if (forgetEl) {
      on(forgetEl, 'click', function () {
        writeToken('')
        syncTokenUI()
        errEl.textContent = ''
        tokenInput.focus()
      })
    }

    /* 口令框：输入后若与已存的不同，顺手更新本机记录 */
    on(tokenInput, 'change', function () {
      var v = tokenInput.value.trim()
      if (v) writeToken(v)
      syncTokenUI()
    })

    /* 已有记录里的「改 / 删」按钮（事件委托，列表重绘也不用重绑） */
    on(existingEl, 'click', function (e) {
      var btn = e.target.closest ? e.target.closest('.wl-op') : null
      if (!btn) return
      var i = Number(btn.getAttribute('data-idx'))
      if (btn.getAttribute('data-op') === 'edit') openPanel(openKey, i)
      else askDelete(openKey, i)
    })

    /* 待办完成勾选：弹窗已有记录 + 今日聚合清单共用 change 委托 */
    function handleToggleChange(e) {
      var box = e.target && e.target.closest ? e.target.closest('input[data-op="toggle"]') : null
      if (!box) return
      toggleDone(box.getAttribute('data-key') || openKey,
        box.getAttribute('data-id') || '',
        Number(box.getAttribute('data-idx')))
    }
    on(existingEl, 'change', handleToggleChange)
    if (agendaEl) {
      on(agendaEl, 'change', handleToggleChange)
      on(agendaEl, 'click', function (e) {
        var goto = e.target && e.target.closest ? e.target.closest('[data-goto-date]') : null
        if (!goto) return
        openPanel(goto.getAttribute('data-goto-date'))
      })
    }

    /* 删除二次确认 */
    if (delYesEl) on(delYesEl, 'click', doDelete)
    if (delNoEl) on(delNoEl, 'click', cancelDelete)

    // Ctrl / ⌘ + Enter 快捷保存
    on(inputEl, 'keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        save()
      }
    })

    // 点遮罩关闭；Esc 关闭（先撤掉删除确认，再关面板）
    on(modal, 'click', function (e) { if (e.target === modal) closePanel() })

    // 无障碍：焦点循环（Tab 在弹层内循环）
    on(modal, 'keydown', function (e) {
      if (e.key !== 'Tab' || modal.hidden) return
      var focusables = modal.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return
      var first = focusables[0]
      var last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    })

    on(document, 'keydown', function (e) {
      if (e.key !== 'Escape') return
      if (pendingDel) { cancelDelete(); return }
      if (!modal.hidden) closePanel()
      else hideTip(true)
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
    /* 取消尚未执行的 resize 重排：Pjax 换页后 cells 指向的是已被替换掉的旧 DOM，
       这个回调再跑一次只会白算，还可能碰到已卸载节点。 */
    if (rafId && cancelRaf) { cancelRaf(rafId); rafId = 0 }
    /* 断开尺寸观察：不断开的话它会继续持有旧的 .wl 节点，
       Pjax 反复进出本页会累积一堆观察器，越用越卡。 */
    if (roEl) { roEl.disconnect(); roEl = null }
    hideTip()
    /* 卡片是 portal（挂在 body），Pjax 只换 #page，它不会随旧 DOM 一起消失。
       这里若还开着，必须显式收起，否则换页后会在新页面上留一个「幽灵卡片」。 */
    if (modal && !modal.hidden) closePanel()
    window.__BIKO_WORKLOG__ = null
  }

  /* ---------- 启动 ---------- */
  function boot() {
    buildGrid()
    bind()
    if (rememberedView?.view === 'week') switchView('week')
    load()
  }

  window.__BIKO_WORKLOG__ = { destroy: destroy, reload: boot, getRecords: function () { return records } }
  boot()
})()
