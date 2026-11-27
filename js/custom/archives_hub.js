/*
 * 文章合并页（/archives/）：时间轴 + 分类 + 标签
 *
 * 数据来自构建期产物 /json/post-index.json（见 scripts/biko-index.js），
 * 每行是 [路径, 标题, 描述, 发布时间, 更新, 缩略图, [分类], [标签], 展示元数据]。
 *
 * 交互设计：
 *   - 三个视图：时间轴 / 分类 / 标签，切视图只换渲染，不刷新
 *   - 时间轴上方是一排分类筛选条；卡片上的分类、标签按钮点一下就就地筛选
 *   - 筛选状态同步到地址栏（?view=&cat=&tag=），刷新、分享、后退都能还原
 *
 * ⚠️ pjax：本文件在 inject.bottom 里，pjax 换页时该脚本不会重新执行。
 *    所以这里自己监听 pjax:complete 重新 boot，并且在离开本页时
 *    把 document 级监听摘掉（与 nav.js 的写法一致），避免重复绑定。
 */
;(function () {
  'use strict'
  if (window.BikoArchives) { window.BikoArchives.refresh(); return }

  var ROOT_SEL = '#ar-root'
  var DATA_URL = '/json/post-index.json'
  var PAGE_SIZE = 20 // 一次渲染多少条，避免一口气插上百个卡片
  var DENSITIES = ['compact', 'standard', 'grid'] // 紧凑 / 标准 / 网格
  var DEFAULT_DENSITY = 'standard' // 默认展示封面与摘要，仍尊重已保存的密度选择。
  var LS_DENSITY = 'ar-density' // 记住上次选的密度

  // 用户的「密度」是否来自本次主动点击（点到默认值也要能进地址栏）
  var densityTouched = false
  // 已经点开「+N」的文章路径：重渲染（切密度/筛选）后保持展开状态
  var expandedTags = {}
  var indexTask
  function loadIndex () {
    if (!indexTask) {
      indexTask = fetch(DATA_URL, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status) })
        .then(function (data) {
          if (!data || !Array.isArray(data.posts)) throw new Error('文章索引格式无效')
          return data
        })
        .catch(function (error) { indexTask = null; throw error })
    }
    return indexTask
  }

  var state = {
    view: 'timeline',
    density: DEFAULT_DENSITY,
    cat: '',
    tag: '',
    year: '', // 月份链路点的年份，'' 表示不限
    month: '', // 月份链路点的月份（1~12 的字符串），'' 表示不限
    posts: [],
    topics: {},
    limit: PAGE_SIZE,
    root: null
  }

  var escapeHTML = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  // 与主题一致的「YYYY-MM-DD」展示
  var fmtDate = function (ms) {
    var d = new Date(ms)
    var p = function (n) { return n < 10 ? '0' + n : String(n) }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
  }

  /* ---------------- 地址栏同步 ---------------- */

  // 上次选的密度记在 localStorage，刷新后保持一致（查询串没写 density 时用它）
  function savedDensity () {
    try {
      var d = window.localStorage.getItem(LS_DENSITY)
      return DENSITIES.indexOf(d) === -1 ? DEFAULT_DENSITY : d
    } catch (e) {
      return DEFAULT_DENSITY // 隐私模式等禁用 localStorage 的情况
    }
  }

  function rememberDensity (d) {
    try { window.localStorage.setItem(LS_DENSITY, d) } catch (e) { /* 忽略 */ }
  }

  function readQuery () {
    var q = new URLSearchParams(location.search)
    var view = q.get('view')
    var density = q.get('density')
    state.view = view === 'categories' || view === 'tags' ? view : 'timeline'
    state.density = DENSITIES.indexOf(density) === -1 ? savedDensity() : density
    if (DENSITIES.indexOf(density) !== -1) densityTouched = true
    state.cat = q.get('cat') || ''
    state.tag = q.get('tag') || ''
    state.year = q.get('y') || ''
    state.month = q.get('m') || ''
    state.limit = PAGE_SIZE
  }

  // replaceState：不产生历史记录爆炸，但地址栏与分享链接仍然正确
  function writeQuery () {
    var q = new URLSearchParams()
    if (state.view !== 'timeline') q.set('view', state.view)
    // 密度只在「用户这次主动选过」或「非默认值」时才落进地址栏：
    // 前者让刚点的那一下就能被复制分享，后者保证分享链接能还原
    if (densityTouched || state.density !== DEFAULT_DENSITY) q.set('density', state.density)
    if (state.cat) q.set('cat', state.cat)
    if (state.tag) q.set('tag', state.tag)
    if (state.year) q.set('y', state.year)
    if (state.month) q.set('m', state.month)
    var qs = q.toString()
    var url = location.pathname + (qs ? '?' + qs : '')
    if (url !== location.pathname + location.search) {
      history.replaceState(null, '', url)
    }
  }

  // 解析 '?view=&cat=&tag=&density=&y=&m='，与 state 比较后返回是否有变化。
  // 外部（pjax / popstate）改了查询串时要靠它决定需不需要重画。
  // 注意 density 缺省时回落到 localStorage，而不是硬编码的默认值，
  // 否则用户记住了「网格」，每次 pjax 回来都会被签名比对判成「有变化」。
  function querySignature (search) {
    var q = new URLSearchParams(search)
    var view = q.get('view')
    var density = q.get('density')
    return [
      view === 'categories' || view === 'tags' ? view : 'timeline',
      DENSITIES.indexOf(density) === -1 ? savedDensity() : density,
      q.get('cat') || '',
      q.get('tag') || '',
      q.get('y') || '',
      q.get('m') || ''
    ].join('\u0000')
  }

  function signatureOf (s) {
    return [s.view, s.density, s.cat, s.tag, s.year, s.month].join('\u0000')
  }

  /* ---------------- 统计 ---------------- */

  function countBy (list, index) {
    var map = new Map()
    list.forEach(function (p) {
      (p[index] || []).forEach(function (name) {
        map.set(name, (map.get(name) || 0) + 1)
      })
    })
    return map
  }

  // 按出现次数降序，次数相同按名称排，避免每次刷新顺序乱跳
  function sortedEntries (map) {
    return Array.from(map.entries()).sort(function (a, b) {
      return b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hans-CN')
    })
  }

  // 文章的「YYYY」「M」两段，按本地时区取，和 fmtDate 的口径一致
  function yearOf (p) {
    return String(new Date(p[3]).getFullYear())
  }

  function monthOf (p) {
    return String(new Date(p[3]).getMonth() + 1)
  }

  function filtered () {
    return state.posts.filter(function (p) {
      if (state.cat && (p[6] || []).indexOf(state.cat) === -1) return false
      if (state.tag && (p[7] || []).indexOf(state.tag) === -1) return false
      if (state.year && yearOf(p) !== state.year) return false
      if (state.month && monthOf(p) !== state.month) return false
      return true
    })
  }


  /* ---------------- 渲染：时间轴 ---------------- */

  // 年份下那排月份胶囊：月份链路 = 中枢（年）→ 链路（月）→ 明细（文章）。
  // 只在「当前分类/标签筛选结果」范围内统计，这样点月份才不会点出空月份。
  function monthRailHTML (year, list) {
    var byMonth = new Map()
    list.forEach(function (p) {
      if (yearOf(p) !== year) return
      var m = monthOf(p)
      byMonth.set(m, (byMonth.get(m) || 0) + 1)
    })

    var mHTML = ''
    for (var m = 1; m <= 12; m++) {
      var key = String(m)
      var n = byMonth.get(key) || 0
      if (!n) continue // 没有文章的月份不出胶囊，免得链路空转
      var on = state.year === year && state.month === key
      mHTML += '<button type="button" class="ar-month" data-year="' + year + '" data-month="' + key +
        '" aria-pressed="' + on + '">' +
        (m < 10 ? '0' + m : m) + '月<span class="ar-month-n">' + n + '</span></button>'
    }

    return '<div class="ar-rail" role="group" aria-label="' + year + ' 年的月份">' + mHTML + '</div>'
  }

  function renderTimeline () {
    var list = filtered()
    var tl = state.root.querySelector('#ar-timeline')
    var more = state.root.querySelector('#ar-more')
    var html = ''
    var shown = 0
    var year = ''

    // 密度挂在时间轴容器上，CSS 用 .is-compact / .is-standard / .is-grid 分支
    tl.className = 'ar-timeline is-' + state.density

    for (var i = 0; i < list.length; i++) {
      var p = list[i]
      var y = yearOf(p)
      // 截断面落在「年」的边界上，避免一年被劈成两半（用户点「加载更多」
      // 通常是「这一年的还没看完」，而不是「再多 20 条」）
      if (shown >= state.limit && y === year) break
      if (y !== year) {
        if (year) html += '</ul>'
        year = y
        html += '<div class="ar-year"><span>' + y + '</span><i></i></div>' +
          '<ul class="ar-list">'
      }
      html += itemHTML(p)
      shown++
    }
    if (year) html += '</ul>'

    tl.innerHTML = html

    bindCoverFallback(tl)
    more.hidden = shown >= list.length
    more.textContent = '加载更多（还有 ' + (list.length - shown) + ' 篇）'
  }

  function bindCoverFallback (container) {
    // Preserve the cover slot on failure; reveal the topic icon instead of collapsing the row.
    Array.prototype.forEach.call(container.querySelectorAll('img'), function (img) {
      var retry = function () {
        img.removeEventListener('error', retry)
        var raw = img.getAttribute('data-raw')
        if (raw && img.getAttribute('src') !== raw && !img.dataset.coverRetried) {
          img.dataset.coverRetried = '1'
          img.src = raw
          img.addEventListener('error', retry, { once: true })
        } else {
          img.hidden = true
        }
      }
      img.addEventListener('error', retry)
      // 已在缓存里失败过的图不会再触发 error
      if (img.complete && img.naturalWidth === 0) retry()
    })

  }

  function topicFor (name) {
    return state.topics[name] || { title: name || '随笔', description: '沿着这个主题继续阅读', icon: 'fa-book-open', theme: 'build' }
  }

  function safeImage (src) {
    src = String(src || '')
    return /^(\/(?!\/)|https?:\/\/)/i.test(src) ? src : ''
  }

  function coverHTML (topic, src, kind) {
    var icon = /^fa-[a-z0-9-]+$/.test(topic.icon) ? topic.icon : 'fa-book-open'
    src = safeImage(src)
    return '<span class="ar-cover-symbol" aria-hidden="true"><i class="fas ' + icon + '"></i></span>' +
      (src ? '<img src="' + escapeHTML(src) + '" data-raw="' + escapeHTML(src.split('?')[0]) +
        '" alt="" width="640" height="360" loading="lazy" decoding="async" class="' + (kind === 'diagram' ? 'is-diagram' : '') + '">' : '')
  }

  function itemHTML (p) {
    var path = escapeHTML(p[0])
    var title = escapeHTML(p[1])
    var presentation = p[8] || {}
    var desc = escapeHTML(p[2] || presentation.excerpt || '')
    var cats = p[6] || []
    var tags = p[7] || []
    var topic = topicFor(cats[0])
    var legacy = String(p[5] || '')
    var thumb = presentation.cover || (legacy.split('?')[0] !== '/img/banner.jpg' ? legacy : '')
    var meta = ''

    cats.forEach(function (c) {
      meta += '<button type="button" class="ar-cat" data-cat="' + escapeHTML(c) + '">' +
        '<i class="fas fa-folder-open" aria-hidden="true"></i>' + escapeHTML(c) + '</button>'
    })

    // 标签只露前 1 个，其余收进「+N」：分类与标签保持紧凑，
    // 也不至于把整页拉长。点「+N」展开后就地显示全部（仍可点选筛选）。
    var VISIBLE_TAGS = 1
    var expanded = !!expandedTags[p[0]]
    tags.slice(0, VISIBLE_TAGS).forEach(function (t) {
      meta += '<button type="button" class="ar-tag" data-tag="' + escapeHTML(t) + '">' +
        escapeHTML(t) + '</button>'
    })
    if (tags.length > VISIBLE_TAGS) {
      meta += '<button type="button" class="ar-tag-more' + (expanded ? ' is-open' : '') +
        '" data-expand="1" aria-expanded="' + expanded + '" ' +
        'aria-label="展开其余 ' + (tags.length - VISIBLE_TAGS) + ' 个标签">' +
        '+' + (tags.length - VISIBLE_TAGS) + '</button>'
      meta += '<span class="ar-tags-rest"' + (expanded ? '' : ' hidden') + '>' +
        tags.slice(VISIBLE_TAGS).map(function (t) {
          return '<button type="button" class="ar-tag" data-tag="' + escapeHTML(t) + '">' +
            escapeHTML(t) + '</button>'
        }).join('') + '</span>'
    }

    var date = fmtDate(p[3])
    return '<li class="ar-item">' +
      '<article class="ar-card" data-path="' + path + '">' +
        '<a class="ar-thumb" href="' + path + '" tabindex="-1" aria-hidden="true" data-topic="' + escapeHTML(topic.theme || 'build') + '">' + coverHTML(topic, thumb, presentation.kind) + '</a>' +
        '<div class="ar-body">' +
          '<time class="ar-date" datetime="' + date + '">' + date + '</time>' +
          '<h2 class="ar-title"><a href="' + path + '">' + title + '</a></h2>' +
          (desc ? '<p class="ar-desc">' + desc + '</p>' : '') +
          (meta ? '<div class="ar-meta">' + meta + '</div>' : '') +
        '</div>' +
      '</article></li>'
  }

  /* ---------------- 渲染：分类磁贴 ---------------- */

  function renderCategories () {
    var map = countBy(state.posts, 6)
    var wall = state.root.querySelector('#ar-catwall')

    wall.innerHTML = sortedEntries(map).map(function (row) {
      var topic = topicFor(row[0])
      return '<button type="button" class="ar-tile" data-cat="' + escapeHTML(row[0]) + '" ' +
        'aria-label="查看' + escapeHTML(row[0]) + '，' + row[1] + '篇文章" ' +
        'aria-pressed="' + (state.cat === row[0]) + '">' +
        '<span class="ar-topic-cover" data-topic="' + escapeHTML(topic.theme || 'build') + '">' + coverHTML(topic, topic.cover, 'diagram') + '</span>' +
        '<span class="ar-tile-name">' + escapeHTML(topic.title) + '</span>' +
        '<span class="ar-tile-desc">' + escapeHTML(topic.description || '') + '</span>' +
        '<span class="ar-tile-n">' + row[1] + ' 篇文章 <i class="fas fa-arrow-right" aria-hidden="true"></i></span>' +
      '</button>'
    }).join('')
    bindCoverFallback(wall)
  }

  /* ---------------- 渲染：标签云 ---------------- */

  function renderTags () {
    var rows = sortedEntries(countBy(state.posts, 7))
    var cloud = state.root.querySelector('#ar-cloud')
    var max = rows.length ? rows[0][1] : 1
    var min = rows.length ? rows[rows.length - 1][1] : 1
    // 字号按出现次数线性映射：13px ~ 22px。全都只出现一次时统一 15px。
    var sizeOf = function (n) {
      return max === min ? 15 : 13 + (n - min) / (max - min) * 9
    }

    cloud.innerHTML = rows.map(function (row) {
      return '<button type="button" data-tag="' + escapeHTML(row[0]) + '" ' +
        'aria-pressed="' + (state.tag === row[0]) + '" ' +
        'style="font-size:' + sizeOf(row[1]).toFixed(1) + 'px">' +
        escapeHTML(row[0]) + '<span class="ar-cloud-n">' + row[1] + '</span></button>'
    }).join('')
  }

  /* ---------------- 渲染：筛选条 / 当前筛选 / 视图切换 ---------------- */

  function renderCatbar () {
    var bar = state.root.querySelector('#ar-catbar')
    var html = '<button type="button" class="ar-chip" data-cat="" aria-pressed="' +
      (state.cat === '') + '">全部<span class="ar-chip-n">' + state.posts.length + '</span></button>'

    sortedEntries(countBy(state.posts, 6)).forEach(function (row) {
      html += '<button type="button" class="ar-chip" data-cat="' + escapeHTML(row[0]) + '" ' +
        'aria-pressed="' + (state.cat === row[0]) + '">' +
        escapeHTML(row[0]) + '<span class="ar-chip-n">' + row[1] + '</span></button>'
    })
    bar.innerHTML = html
  }

  function renderDatebar () {
    var years = Array.from(new Set(state.posts.map(yearOf)))
    state.root.querySelector('#ar-datebar').innerHTML = years.map(function (year) {
      return '<p class="ar-date-year">' + year + ' 年</p>' + monthRailHTML(year, state.posts)
    }).join('')
    var count = [state.cat, state.tag, state.year].filter(Boolean).length
    state.root.querySelector('#ar-filter-count').textContent = count ? ' · ' + count + ' 项' : ''
  }

  function renderActive () {
    var box = state.root.querySelector('#ar-active')
    var parts = []

    if (state.cat) {
      parts.push('<span class="ar-active-tag">分类：' + escapeHTML(state.cat) +
        '<button type="button" data-clear="cat" aria-label="取消分类筛选">' +
        '<i class="fas fa-times"></i></button></span>')
    }
    if (state.tag) {
      parts.push('<span class="ar-active-tag">标签：#' + escapeHTML(state.tag) +
        '<button type="button" data-clear="tag" aria-label="取消标签筛选">' +
        '<i class="fas fa-times"></i></button></span>')
    }
    if (state.year) {
      parts.push('<span class="ar-active-tag">' +
        (state.month ? state.year + ' 年 ' + state.month + ' 月' : state.year + ' 年') +
        '<button type="button" data-clear="ym" aria-label="取消年月筛选">' +
        '<i class="fas fa-times"></i></button></span>')
    }
    if (parts.length) parts.push('<span>共 ' + filtered().length + ' 篇</span>')
    box.innerHTML = parts.join('')
    box.hidden = !parts.length
  }

  // 密度切换：紧凑（一屏看完一年）/ 标准（带摘要卡片）/ 网格（封面平铺）
  function renderDensity () {
    var box = state.root.querySelector('#ar-density')
    var labels = { compact: '紧凑', standard: '标准', grid: '网格' }
    var icons = { compact: 'fa-list', standard: 'fa-list-ul', grid: 'fa-table-cells-large' }
    box.innerHTML = DENSITIES.map(function (d) {
      return '<button type="button" data-density="' + d + '" ' +
        'aria-pressed="' + (state.density === d) + '" title="' + labels[d] + ' 视图">' +
        '<i class="fas ' + icons[d] + '" aria-hidden="true"></i>' +
        '<span>' + labels[d] + '</span></button>'
    }).join('')
  }

  function renderViews () {
    Array.prototype.forEach.call(state.root.querySelectorAll('.ar-view'), function (v) {
      v.hidden = v.getAttribute('data-view') !== state.view
    })
    Array.prototype.forEach.call(state.root.querySelectorAll('.ar-tabs button'), function (b) {
      b.setAttribute('aria-selected', b.getAttribute('data-view') === state.view ? 'true' : 'false')
    })
  }

  function render () {
    // 分类/标签视图是用来「选」筛选条件的，计数一律按全量算：
    // 否则选了分类之后标签云会越点越少，自己把自己筛没。
    state.root.querySelector('#ar-n-timeline').textContent = state.posts.length
    state.root.querySelector('#ar-n-categories').textContent = countBy(state.posts, 6).size
    state.root.querySelector('#ar-n-tags').textContent = countBy(state.posts, 7).size

    renderViews()
    renderDensity()
    renderCatbar()
    renderDatebar()
    renderActive()
    renderTimeline()
    renderCategories()
    renderTags()

    var hit = filtered().length
    var noHit = state.view === 'timeline' && hit === 0
    state.root.querySelector('#ar-empty').hidden = !noHit
    if (state.posts.length && !state.root.dataset.viewRestored) {
      state.root.dataset.viewRestored = '1'
      var saved = window.BikoView?.read('archives')
      if (saved?.query === location.search && !location.hash) window.BikoView?.restoreScroll(saved.y, state.root)
    }
    // Keep filters available even when no article matches, so users can recover in the same panel.
  }

  /* ---------------- 交互 ---------------- */

  function apply (patch) {
    Object.keys(patch).forEach(function (k) { state[k] = patch[k] })
    state.limit = PAGE_SIZE
    writeQuery()
    render()
  }

  function scrollToRoot () {
    // 只有筛选后视野已经跑远时才滚回去，免得每点一下都跳
    var top = state.root.getBoundingClientRect().top
    if (top < -120) state.root.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function onRootClick (e) {
    var target = e.target.closest ? e.target.closest('button') : null
    // 点在卡片空白处 / 锚点上时拿不到按钮，直接放过（不 preventDefault，链接照常跳转）
    if (!target || !state.root.contains(target)) return

    // 封面和标题使用独立链接；筛选按钮只更新当前列表，不触发文章跳转。
    e.preventDefault()
    e.stopPropagation()

    if (target.hasAttribute('data-close-filters')) {
      state.root.querySelector('#ar-filters').open = false
      state.root.querySelector('#ar-filters summary').focus()
      return
    }
    if (target.hasAttribute('data-reset-filters')) return apply({ cat: '', tag: '', year: '', month: '' })

    // 切换视图（三个 tab）
    var view = target.getAttribute('data-view')
    if (view) {
      apply({ view: view })
      return
    }

    // 切换密度：只换渲染，不动筛选条件；记住选择供下次访问
    var density = target.getAttribute('data-density')
    if (density) {
      rememberDensity(density)
      densityTouched = true
      apply({ density: density })
      return
    }

    // 月份链路：点一下把该月设为筛选，再点一次取消
    var month = target.getAttribute('data-month')
    if (month) {
      var year = target.getAttribute('data-year')
      var same = state.year === year && state.month === month
      apply({ year: same ? '' : year, month: same ? '' : month })
      scrollToRoot()
      return
    }

    // 卡片上的「+N」：就地展开剩余标签，不参与筛选
    if (target.hasAttribute('data-expand')) {
      var card = target.closest('.ar-card')
      var path = card ? card.getAttribute('data-path') : ''
      if (path) {
        // 记在路径上再重画：切密度、换筛选之后展开状态也不会丢
        if (expandedTags[path]) delete expandedTags[path]
        else expandedTags[path] = true
        renderTimeline()
      }
      return
    }

    // 卡片 / 磁贴 / 筛选条上的分类：同一个再点一次＝取消
    if (target.hasAttribute('data-cat')) {
      var cat = target.getAttribute('data-cat')
      apply({ cat: state.cat === cat ? '' : cat, view: 'timeline' })
      scrollToRoot()
      return
    }

    // 卡片 / 标签云上的标签
    if (target.hasAttribute('data-tag')) {
      var tag = target.getAttribute('data-tag')
      apply({ tag: state.tag === tag ? '' : tag, view: 'timeline' })
      scrollToRoot()
      return
    }

    // 取消某一条筛选
    var clear = target.getAttribute('data-clear')
    if (clear === 'cat') return apply({ cat: '' })
    if (clear === 'tag') return apply({ tag: '' })
    if (clear === 'ym') return apply({ year: '', month: '' })
  }

  /* ---------------- 顶栏高亮 ---------------- */

  var navItem = null

  function refreshNavHighlight () {
    // 顶栏由 scripts/biko-index.js 在构建期渲染好，并放在 pjax 不会替换的位置：
    // 进 /archives/ 时补点亮「文章」（例如从 /tags/xx/ 重定向进来）。
    var items = document.querySelectorAll('#menu-container .menu-item-main')
    if (!items.length) return
    if (!navItem) {
      navItem = Array.prototype.filter.call(items, function (li) {
        return !!li.querySelector('a[href="/archives/"]')
      })[0] || false
    }
    if (!navItem) return
    navItem.classList.add('is-active')
  }

  /* ---------------- 启动 / 卸载 ---------------- */

  // 本页每次「活着」期间只绑定一次监听（绑在 document/window 上，
  // pjax 换掉 #body-wrap 时不会跟着消失，所以需要自己管理生命周期）
  var listening = false
  function closeFilters (restoreFocus) {
    var panel = state.root && state.root.querySelector('#ar-filters')
    if (!panel || !panel.open) return
    panel.open = false
    if (restoreFocus) panel.querySelector('summary').focus()
  }
  function onFilterOutsideClick (event) {
    if (!event.target.closest('#ar-filters')) closeFilters(false)
  }
  function onFilterEscape (event) {
    if (event.key === 'Escape') closeFilters(true)
  }

  function attachOnce () {
    if (listening) return
    listening = true
    document.addEventListener('click', onFilterOutsideClick)
    document.addEventListener('keydown', onFilterEscape)
  }

  function detach () {
    state.root = null
    document.removeEventListener('click', onFilterOutsideClick)
    document.removeEventListener('keydown', onFilterEscape)
    listening = false
  }

  function boot () {
    var root = document.querySelector(ROOT_SEL)
    if (!root) { detach(); return }

    state.root = root
    if (!root._initialEmpty) root._initialEmpty = root.querySelector('#ar-empty').innerHTML
    var savedView = window.BikoView?.read('archives')
    if (root.dataset.arBound !== '1' && !location.search && savedView?.query) history.replaceState(history.state, '', location.pathname + savedView.query)
    window.BikoView?.register('archives', function () { return { query: location.search, limit: state.limit, y: window.scrollY } })
    // 先把「本页活着」这件事登记好，再处理查询串与数据；
    // 这样 pjax / popstate 改 ?view= 时能立刻被接到（见下面的签名比对）
    attachOnce()
    readQuery()
    if (savedView?.query === location.search && Number.isFinite(savedView.limit)) state.limit = Math.max(PAGE_SIZE, Math.min(savedView.limit, 500))
    refreshNavHighlight()

    // 同一份 DOM 上不要重复绑定
    if (root.dataset.arBound !== '1') {
      root.dataset.arBound = '1'

      root.addEventListener('click', onRootClick)
      root.querySelector('#ar-more').addEventListener('click', function () {
        state.limit += PAGE_SIZE
        renderTimeline()
      })
      root.querySelector('#ar-reset').addEventListener('click', function () {
        apply({ cat: '', tag: '', year: '', month: '' })
      })

      // ← → 在三个视图之间切换
      var tabs = root.querySelector('.ar-tabs')
      tabs.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        var btns = Array.prototype.slice.call(tabs.querySelectorAll('button'))
        var i = btns.indexOf(document.activeElement)
        if (i === -1) return
        e.preventDefault()
        var next = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length]
        next.focus()
        next.click()
      })
    }

    if (state.posts.length) {
      render()
      return
    }

    root.setAttribute('aria-busy', 'true')
    render()
    var loading = root.querySelector('#ar-loading')
    loading.hidden = false
    loading.setAttribute('role', 'status')
    loading.setAttribute('aria-live', 'polite')
    root.querySelector('#ar-empty').hidden = true
    loadIndex()
      .then(function (data) {
        if (state.root !== root || !root.isConnected) return // 数据回来前已经切走，别覆盖新页面
        state.posts = (data.posts || []).slice().sort(function (a, b) { return b[3] - a[3] })
        state.topics = data.topics || {}
        root.removeAttribute('aria-busy')
        loading.hidden = true
        root.querySelector('#ar-empty').innerHTML = root._initialEmpty
        render()
      })
      .catch(function () {
        if (state.root !== root || !root.isConnected) return
        root.removeAttribute('aria-busy')
        loading.hidden = true
        var box = root.querySelector('#ar-empty')
        box.hidden = false
        box.setAttribute('role', 'status')
        box.innerHTML = '<p>文章暂时加载失败，请检查网络后重试。</p><button class="ui-retry" type="button">重试</button>'
        box.querySelector('button').onclick = function () { boot() }
      })
  }

  /**
   * 地址栏里的查询串与当前 state 不一致时，重读并重画。
   *
   * 为什么需要这一步：
   *   - pjax 只比较「路径」，从 /tags/ 跳到 /archives/?view=tags 这种
   *     查询串变化不会触发换页（pjax 认为已经在目标路径上了），
   *     页面上还是旧视图；
   *   - 同理浏览器前进/后退改的也可能只是查询串。
   * 两个入口（pjax:complete / popstate）都走这里，行为一致。
   */
  function syncFromUrl () {
    var root = document.querySelector(ROOT_SEL)
    if (!root) { detach(); return }
    if (!state.root) { boot(); return }
    if (querySignature(location.search) === signatureOf(state)) return
    readQuery()
    render()
  }

  function onPjax () {
    // pjax 换页后 DOM 已换新，boot 内部会拿新的 #ar-root
    if (!document.querySelector(ROOT_SEL)) { detach(); navItem = null; return }
    boot()
    syncFromUrl()
  }

  function onPop () {
    syncFromUrl()
  }

  // Keep exactly one route listener alive; only page-specific handlers detach.
  // Pjax may evaluate this script again when returning to archives.
  window.BikoArchives = { refresh: onPjax }
  document.addEventListener('pjax:complete', onPjax)
  // Browser history events are dispatched on window, not document.
  window.addEventListener('popstate', onPop)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true })
  } else {
    boot()
  }
})()
