/* ============================================================
 * Biko · 首页四行 Dashboard
 * ------------------------------------------------------------
 * 设计原则：
 *   1. 不改主题源码、不改 layout（改 layout 会影响所有页面）。
 *   2. 数据来源唯一：侧边栏 #aside-content 里已有头像/名字/签名/
 *      三个数字/社交图标，JS 直接搬过来，不在 YAML 里重复配置。
 *      这样以后改 _config.butterfly.yml，dashboard 自动跟着变。
 *   3. swiper 由主题插件注入到 #recent-posts，本脚本只把整个
 *      #recent-posts 挪进 ③ 号槽位，不重建、不干扰它的初始化。
 *   4. 任何异常都静默跳过，绝不让首页白屏。
 *
 * 生命周期：兼容 pjax，用全局标记防止重复执行。
 * ============================================================ */
(function () {
  'use strict'

  var MOUNT_ID = 'biko-dashboard'
  var HISTORY_LABEL = '历史上的今天'

  /* ---------------- 工具 ---------------- */

  function $(sel, root) {
    return (root || document).querySelector(sel)
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag)
    if (cls) n.className = cls
    if (html != null) n.innerHTML = html
    return n
  }

  /* 是否首页。Hexo 首页没有 page-xxx 类，所以先排除明确的内页类。 */
  function isIndexPage() {
    var body = document.body
    if (!body) return false
    if (/page-post-detail|page-archive|page-tag|page-category|page-about/.test(body.className)) {
      return false
    }
    var p = location.pathname.replace(/index\.html$/, '')
    return p === '/' || /^\/page\/\d+\/?$/.test(p)
  }

  /* ---------------- ① 身份带 ---------------- */

  /* 公告里的「炫彩跑马灯」签名。
     文案与 HTML 仍然是侧栏公告卡的唯一来源（_config.butterfly.yml →
     aside.card_announcement.content），这里只负责把它搬一份到身份带里 ——
     因为首页会把整个 #aside-content 隐藏掉，公告卡在首页根本不存在，
     而 custom.css 里 .biko-marquee 的样式/动画都写在 #aside-content 作用域内，
     搬到别处会静默失效。所以首页另给一套 body.home-dashboard 作用域的皮肤。

     返回 null 表示公告里没有这段标记（用户改回纯文本），此时不占位。 */
  function buildSignature() {
    var src = $('#aside-content .card-announcement .biko-marquee')
    if (!src) return null

    var wrap = el('div', 'dash-sign')
    // 直接克隆公告卡里的节点：两处各写一份 HTML 迟早会分叉
    var clone = src.cloneNode(true)
    clone.classList.add('dash-sign__view')
    // 读屏文案照抄原件，后面的视觉整理不影响它
    clone.setAttribute('aria-label', src.getAttribute('aria-label') || '')

    /* 视觉整理：原文为了「宽字距」逐字插了空格（双 手 合 十…），
       正式排版里这种空格会让句子读起来一顿一顿的。这里把空白收成正常
       空格，字距交给 CSS 的 letter-spacing；关键词包一层 .is-em 做强调
       （颜色仍由渐变提供，不在 JS 里硬编码）。 */
    var SP = /[\s\u00a0\u3000]+/g
    Array.prototype.forEach.call(
      clone.querySelectorAll('.biko-marquee__item'),
      function (item) {
        // 逐字空格 → 单空格；再交给下面的「只有汉字之间才留空」规则
        var text = (item.textContent || '').replace(SP, ' ').trim()
        var m = /^(双\s*手\s*合\s*十)\s*/.exec(text)
        if (!m) {
          item.textContent = text
          return
        }
        var head = m[1].replace(SP, '')
        // 剩下的部分：汉字之间的空格去掉，标点前后也收干净，只在原文有逗号处保留
        var rest = text.slice(m[0].length)
          .replace(/([\u4e00-\u9fa5])\s+(?=[\u4e00-\u9fa5])/g, '$1')
          .replace(/\s*([,，])\s*/g, '$1')
          .trim()
        item.textContent = ''
        item.appendChild(el('span', 'is-em', head))
        if (rest) item.appendChild(document.createTextNode(' ' + rest))
      }
    )

    wrap.appendChild(clone)

    /* ★ 把「一份文案的宽度」量出来交给 CSS：
       · --dash-sign-w   色带每份的宽度（第二份要左移这么多才接得上）
       · --dash-sign-2w  色带总长（= 两份），background-size 用它
       · --dash-sign-dur 滚完一份所需的秒数，按「匀速 15px/s」反算
       以前是写死 397/794/16s：换字号、换文案、手机断点都会失配，
       表现为接缝跳色 + 有时快有时慢（「不流畅」的另一半原因）。 */
    measureSignature(wrap)
    return wrap
  }

  /* 量宽度必须在【挂进文档之后】做：元素不在文档里时宽度是 0。
     字体加载完成后还要再量一次（webfont 会让文字变宽/变窄）。
     ⚠️ 必须先把数值清空再量：background-size 依赖 --dash-sign-2w，
        不清空的话新值会被旧值算进布局，量出来是戴着旧答案的循环引用。 */
  function measureSignature(wrap) {
    var items = wrap.querySelectorAll('.biko-marquee__item')
    if (!items.length) return
    var item = items[0]
    wrap.style.removeProperty('--dash-sign-w')
    wrap.style.removeProperty('--dash-sign-2w')
    wrap.style.removeProperty('--dash-sign-dur')

    /* ★ 动态撑开字间距：让一份文案刚好撑满可视区宽度。
       初始状态「双」在左、「仰」在右，滚动时第二份从右边无缝进来。 */
    var viewport = wrap.querySelector('.biko-marquee')
    if (viewport) {
      // 先重置字间距，量原始宽度
      items.forEach(function(it) { it.style.letterSpacing = '0px' })
      var rawW = item.getBoundingClientRect().width
      var viewW = viewport.getBoundingClientRect().width
      if (rawW > 0 && viewW > rawW) {
        var gap = viewW - rawW
        var text = item.textContent.replace(/\s+/g, '')
        var chars = text.length
        if (chars > 0) {
          var ls = (gap / chars) + 'px'
          items.forEach(function(it) { it.style.letterSpacing = ls })
        }
      }
    }

    var w = Math.round(item.getBoundingClientRect().width)
    if (!(w > 0)) return
    wrap.style.setProperty('--dash-sign-w', w + 'px')
    wrap.style.setProperty('--dash-sign-2w', w * 2 + 'px')
    wrap.style.setProperty('--dash-sign-dur', Math.max(10, Math.round(w / 15)) + 's')
  }

  function refreshSignatures() {
    Array.prototype.forEach.call(
      document.querySelectorAll('.dash-sign'),
      measureSignature
    )
  }

  /* 联系方式弹框（微信/QQ 点击后弹出） */
  function showContactModal(title, label, value, desc) {
    // 移除已有弹框
    var old = document.querySelector('.dash-contact-modal')
    if (old) old.remove()

    var mask = el('div', 'dash-contact-modal')
    mask.innerHTML =
      '<div class="dash-contact-modal__box">' +
        '<div class="dash-contact-modal__title">' + title + '</div>' +
        '<div class="dash-contact-modal__label">' + label + '</div>' +
        '<div class="dash-contact-modal__value">' + value + '</div>' +
        '<div class="dash-contact-modal__desc">' + desc + '</div>' +
        '<button class="dash-contact-modal__close">关闭</button>' +
      '</div>'
    document.body.appendChild(mask)

    mask.addEventListener('click', function(e) {
      if (e.target === mask || e.target.classList.contains('dash-contact-modal__close')) {
        mask.remove()
      }
    })
  }

  function buildIdentity() {
    var src = $('#aside-content .card-info')
    if (!src) return null

    var wrap = el('section', 'dash-card dash-identity')

    /* --- 上排：头像 + 名字 + 签名 --- */
    var top = el('div', 'dash-identity__top')

    var img = $('img', src)
    var avatar = el('img', 'dash-identity__avatar')
    avatar.src = (img && img.getAttribute('src')) || '/img/avatar.jpg'
    avatar.alt = 'avatar'
    avatar.loading = 'lazy'
    avatar.onerror = function () {
      this.onerror = null
      this.src = '/img/avatar.jpg'
    }
    top.appendChild(avatar)

    var meta = el('div', 'dash-identity__meta')
    var nameEl = $('.author-info-name', src)
    var descEl = $('.author-info-description', src)
    meta.appendChild(el('div', 'dash-identity__name',
      nameEl ? nameEl.textContent.trim() : 'Biko'))
    meta.appendChild(el('div', 'dash-identity__sign',
      descEl ? descEl.textContent.trim() : ''))
    top.appendChild(meta)
    wrap.appendChild(top)

    /* --- 炫彩滚动签名 --- */
    var sign = buildSignature()
    if (sign) wrap.appendChild(sign)

    /* --- 底部一行：统计数字 + 社交图标（参照站同一行布局） --- */
    var bottom = el('div', 'dash-identity__bottom')

    var stats = el('div', 'dash-identity__stats')
    var count = 0
    Array.prototype.forEach.call(src.querySelectorAll('.site-data a'), function (a) {
      var labelEl = $('.headline', a)
      var numEl = $('.length-num', a)
      if (!labelEl || !numEl) return
      var stat = el('a', 'dash-stat')
      stat.href = a.getAttribute('href') || '#'
      stat.appendChild(el('span', 'dash-stat__num', numEl.textContent.trim()))
      stat.appendChild(el('span', 'dash-stat__label', labelEl.textContent.trim()))
      stats.appendChild(stat)
      count++
    })
    bottom.appendChild(stats)

    /* --- 下排：社交图标（GitHub/邮箱/微信/QQ/B站/知乎） --- */
    var social = el('div', 'dash-identity__social')
    var socialLinks = [
      { icon: 'fab fa-github', label: 'GitHub', href: 'https://github.com/Biko-Duckyo', color: '#333' },
      { icon: 'fas fa-envelope', label: '邮箱', href: 'mailto:10788578679@qq.com', color: '#ea4335' },
      { icon: 'fab fa-weixin', label: '微信', href: '#', color: '#07c160', action: 'wechat' },
      { icon: 'fab fa-qq', label: 'QQ', href: '#', color: '#12b7f5', action: 'qq' },
      { icon: 'fab fa-bilibili', label: 'B站', href: 'https://space.bilibili.com/397427648', color: '#00a1d6' },
      { icon: 'fab fa-zhihu', label: '知乎', href: 'https://www.zhihu.com/', color: '#0084ff' }
    ]
    socialLinks.forEach(function(s) {
      var box = el('a', 'dash-soc')
      box.href = s.href
      box.target = s.action ? '' : '_blank'
      box.rel = 'noopener'
      box.title = s.label
      box.style.setProperty('--soc-color', s.color)
      box.innerHTML = '<i class="' + s.icon + '"></i>'
      if (s.action === 'wechat') {
        box.onclick = function(e) {
          e.preventDefault()
          showContactModal('微信', '微信号', '15651005256', '扫码或搜索添加好友，备注来意~')
        }
      } else if (s.action === 'qq') {
        box.onclick = function(e) {
          e.preventDefault()
          showContactModal('QQ', 'QQ号', '1078857679', '点击加好友，交流科研/技术/生活~')
        }
      }
      social.appendChild(box)
    })
    bottom.appendChild(social)
    wrap.appendChild(bottom)

    return wrap
  }

  /* ---------------- ② 历史上的今天 ---------------- */

  /* 数据在 source/data/history-today.json，按 "MM-DD" 索引。
     支持两种顶层结构：{ "10-19": [...] } 或 { "events": { "10-19": [...] } } */
  var historyState = { pages: [], index: 0, perPage: 5, all: [] }

  /* 每页条数：由身份卡高度决定，但每次最多 +1，并给一个硬上限。
     ★ 为什么不能直接按余量算：历史卡和身份卡在同一行里，行高取两者较高的
       那张。只要历史卡比身份卡高一次，行就被撑开、身份卡被 stretch 拉高，
       下一轮又会算出更多条 —— 这是自增循环的根源（实测直接算余量会得到 6 条，
       而身份卡只装得下 3 条）。
       逐条试算时必须用「历史卡当前高度是否仍不超过身份卡」当条件，
       每次只往上加一条，就能保证有界且收敛。 */
  var HISTORY_MAX = 8
  function historyPerPage(prev) {
    var list = $('#dash-history-list')
    if (!list) return 3
    var card = list.closest('.dash-history')
    if (!card) return 3

    var identity = $('.dash-identity')
    /* 身份卡的自然高度：克隆一份到屏幕外、以 align-self:start 排版后量，
       量完立刻移除。offsetHeight / scrollHeight 都不行 —— 它们带着
       「历史卡把行撑高后」的拉伸结果。 */
    var natural = 0
    if (identity) {
      var probe = identity.cloneNode(true)
      probe.style.cssText = 'position:absolute;left:-9999px;top:0;width:' +
        identity.offsetWidth + 'px;min-height:0;align-self:start;visibility:hidden;pointer-events:none'
      probe.setAttribute('aria-hidden', 'true')
      identity.parentElement.appendChild(probe)
      natural = probe.offsetHeight
      probe.parentElement.removeChild(probe)
    }
    if (!natural) return 3

    var head = $('.dash-card__head', card)
    var nav = $('#dash-history-nav')
    var chrome = (head ? head.offsetHeight : 50) +
      (nav && nav.style.display !== 'none' ? nav.offsetHeight : 0) +
      12
    var items = list.querySelectorAll('.dash-history__item')
    var sample = items.length > 1 ? items[1] : items[0]
    /* ★ 骨架屏的判断：第 1 次分页时列表里还是骨架屏（一行占位，32px 左右），
       拿它量条目高度会偏小。骨架屏没有 .dash-history__year 子元素，可据此识别，
       识别到就用实测值兜底（桌面 54 / 手机 52）。 */
    var skel = !sample || !$('.dash-history__year', sample)
    var itemH = skel || !sample.offsetHeight ? 54 : sample.offsetHeight

    var fit = Math.floor((natural - chrome) / itemH)
    var next = (prev || 0) ? Math.min(prev + 1, fit) : fit
    /* 下限 1：原先夹 3 是写死行高时代的值，现在行高由身份卡决定，
       矮屏上 3 条会把行撑开（比身份卡还高），所以允许只放 1 条。 */
    return Math.max(1, Math.min(HISTORY_MAX, next))
  }
  function buildHistoryShell() {
    var card = el('section', 'dash-card dash-history')

    var head = el('div', 'dash-card__head')
    head.appendChild(el('span', null, '<i class="fas fa-hourglass-half"></i>' + HISTORY_LABEL))
    var rightWrap = el('div', 'dash-card__head-right')
    var dateTag = el('span', 'dash-card__extra')
    dateTag.id = 'dash-history-date'
    rightWrap.appendChild(dateTag)
    var allBtn = el('button', 'dash-history__all-btn')
    allBtn.type = 'button'
    allBtn.innerHTML = '<i class="fas fa-list"></i> 全部'
    allBtn.setAttribute('aria-label', '查看全部历史事件')
    allBtn.addEventListener('click', openHistoryModal)
    rightWrap.appendChild(allBtn)
    head.appendChild(rightWrap)
    card.appendChild(head)

    var list = el('ol', 'dash-history__list')
    list.id = 'dash-history-list'
    list.innerHTML = '<li class="dash-history__item">' +
      '<span class="dash-history__text" style="opacity:.4">正在加载…</span></li>'
    card.appendChild(list)

    var nav = el('div', 'dash-history__nav')
    nav.id = 'dash-history-nav'
    nav.style.display = 'none'
    card.appendChild(nav)

    return card
  }

  function renderHistoryPage() {
    var list = $('#dash-history-list')
    var nav = $('#dash-history-nav')
    if (!list) return

    var page = historyState.pages[historyState.index]
    if (!page || !page.length) {
      list.innerHTML = '<li class="dash-history__item">' +
        '<span class="dash-history__text" style="opacity:.4">暂无今日数据</span></li>'
      if (nav) nav.style.display = 'none'
      return
    }

    list.innerHTML = ''
    page.forEach(function (it) {
      var li = el('li', 'dash-history__item')
      if (it.year) li.appendChild(el('span', 'dash-history__year', String(it.year)))
      /* 数据繁简混合：统一转成简体，让 Butterfly 的繁简切换功能正常工作 */
      var rawText = it.text || ''
      var normText = (window.translateFn && typeof window.translateFn.Simplized === 'function')
        ? window.translateFn.Simplized(rawText)
        : rawText
      var text = el('span', 'dash-history__text', normText)
      text.setAttribute('data-tip', normText)
      bindHistoryTooltip(text)
      li.appendChild(text)
      list.appendChild(li)
    })

    if (!nav) return
    if (historyState.pages.length <= 1) {
      nav.style.display = 'none'
      return
    }

    nav.style.display = ''
    nav.innerHTML = ''

    var prev = el('button', null, '<i class="fas fa-chevron-left"></i>')
    prev.setAttribute('aria-label', '上一页')
    prev.onclick = function () {
      historyState.index =
        (historyState.index - 1 + historyState.pages.length) % historyState.pages.length
      renderHistoryPage()
    }
    nav.appendChild(prev)

    var dots = el('div', 'dash-history__dots')
    historyState.pages.forEach(function (_, i) {
      var dot = el('span', 'dash-history__dot' + (i === historyState.index ? ' active' : ''))
      dot.onclick = function () {
        historyState.index = i
        renderHistoryPage()
      }
      dots.appendChild(dot)
    })
    nav.appendChild(dots)

    var next = el('button', null, '<i class="fas fa-chevron-right"></i>')
    next.setAttribute('aria-label', '下一页')
    next.onclick = function () {
      historyState.index = (historyState.index + 1) % historyState.pages.length
      renderHistoryPage()
    }
    nav.appendChild(next)
  }

  function loadHistory() {
    var d = new Date()
    var md = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

    var dateTag = $('#dash-history-date')
    if (dateTag) dateTag.textContent = (d.getMonth() + 1) + '月' + d.getDate() + '日'

    function fail(reason) {
      historyState.all = []
      historyState.pages = []
      historyState.index = 0
      var list = $('#dash-history-list')
      var nav = $('#dash-history-nav')
      if (list) {
        list.innerHTML =
          '<li class="dash-history__item"><span class="dash-history__text" style="opacity:.4">' +
          '暂无今日数据</span></li>'
      }
      if (nav) nav.style.display = 'none'
      if (window.console && console.warn) console.warn('[dashboard] history:', reason)
    }

    if (!window.ZhHistory) { fail('ZhHistory not loaded'); return }

    ZhHistory.fetch(8)
      .then(function (events) {
        if (!events || !events.length) { fail('no events for ' + md); return }
        historyState.all = events
        repaginate()
      })
      .catch(function (e) { fail((e && e.message) || e) })
  }

  /* 按当前容器高度重新分页，并尽量停在同一位置。
     resize 时重算：宽屏能放下更多条，不该还按窄屏的条数分页。
     ★ 收敛策略：算出条数 → 渲染 → 下一帧量「历史卡是否已经比身份卡高」，
       高了就回退一条。历史卡在行里是 stretch 的，它自己不涨行也就不会涨；
       一旦它比身份卡高，行被撑开，就必须回收 —— 否则会越算越多（实测 6 条）。 */
  function repaginate() {
    var all = historyState.all
    if (!all || !all.length) {
      renderHistoryPage()
      return
    }
    var per = historyPerPage(historyState.perPage)
    if (per === historyState.perPage && historyState.pages.length) {
      settleHistory(per)
      return
    }

    // 记住当前看到的是第几条，重新分页后回到相近位置
    var anchor = historyState.index * historyState.perPage
    historyState.perPage = per

    var pages = []
    for (var i = 0; i < all.length; i += per) {
      pages.push(all.slice(i, i + per))
    }
    historyState.pages = pages
    historyState.index = Math.min(pages.length - 1, Math.floor(anchor / per))
    if (historyState.index < 0) historyState.index = 0
    renderHistoryPage()
    settleHistory(per)
  }

  /* 渲染后核对一次：历史卡若被撑得比身份卡高，就少放一条再渲染。
     最多回退到 1 条，保证一定有界、不会和「AI 日报展开」之类的布局变化打架。 */
  function settleHistory(per) {
    if (per <= 1) return
    var raf = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16) }
    raf(function () {
      var card = $('.dash-history')
      var identity = $('.dash-identity')
      if (!card || !identity) return
      // 历史卡比身份卡高出 4px 以上 → 说明行被它撑开了
      if (card.offsetHeight > identity.offsetHeight + 4) {
        var all = historyState.all
        if (!all || !all.length) return
        var next = per - 1
        historyState.perPage = next
        var pages = []
        for (var i = 0; i < all.length; i += next) {
          pages.push(all.slice(i, i + next))
        }
        historyState.pages = pages
        historyState.index = Math.min(pages.length - 1, historyState.index)
        if (historyState.index < 0) historyState.index = 0
        renderHistoryPage()
        if (next > 1) settleHistory(next)
      }
    })
  }

  /* ---------------- 历史事件自定义 tooltip ---------------- */
  function bindHistoryTooltip(elNode) {
    var tip = null
    elNode.addEventListener('mouseenter', function () {
      var text = elNode.getAttribute('data-tip')
      if (!text) return
      tip = document.createElement('div')
      tip.className = 'dash-history__tip'
      tip.textContent = text
      document.body.appendChild(tip)
      var rect = elNode.getBoundingClientRect()
      tip.style.left = rect.left + 'px'
      tip.style.top = (rect.bottom + 8) + 'px'
    })
    elNode.addEventListener('mouseleave', function () {
      if (tip) { tip.remove(); tip = null }
    })
  }

  /* ---------------- 全部事件弹窗 ---------------- */
  /* 旧分类用英文关键词（china / war / trade…）去切中文条目，中文正文几乎一个都命中不了，
     所以 13 个筛选格全塌进同一个桶，点哪个都没变化。改成两层可验证的维度：
       年代：按年份硬判定（<1500 / 1500–1944 / ≥1945），永远非空；
       主题：中文关键词打分，五类 + 其他，每格显示真实条数，0 条的直接禁用。
     这样「全部」之后不再是摆设，能真正缩小范围；条数与空态也会如实反馈。 */
  var ERA_KEYS = ['古代', '近现代', '现代']
  var DOMAIN_BUCKETS = [
    { key: '战争与冲突', kw: ['战', '军', '攻占', '占领', '入侵', '投降', '起义', '革命', '独立', '政变', '刺杀', '围困', '舰队', '空袭'] },
    { key: '科技与探索', kw: ['科学', '技术', '发明', '发现', '航天', '卫星', '医学', '物理', '化学', '计算', '互联网', '飞行', '航海', '探测', '实验'] },
    { key: '文化与艺术', kw: ['文学', '艺术', '音乐', '电影', '诗', '小说', '绘画', '建筑', '宗教', '哲学', '教育', '出版', '戏剧', '雕塑'] },
    { key: '政治与制度', kw: ['政治', '政府', '总统', '议会', '皇帝', '王朝', '宪法', '选举', '改革', '立法', '法院', '政党', '外交', '联合国', '首相'] },
    { key: '经济与社会', kw: ['经济', '贸易', '金融', '银行', '货币', '工业', '公司', '农业', '人口', '饥荒', '铁路', '市场', '股', '税', '罢工'] }
  ]

  /* 年份来自 Wikimedia 的 year 字段，可能是 "-500"（公元前）或字符串，统一成数字。 */
  function yearOf(ev) {
    var y = Number(String(ev.year == null ? '' : ev.year).replace(/[^\d-]/g, ''))
    return isFinite(y) ? y : 0
  }

  function eraOf(ev) {
    var y = yearOf(ev)
    if (y < 1500) return '古代'
    if (y < 1945) return '近现代'
    return '现代'
  }

  function domainOf(ev) {
    var text = ev.description || ''
    var best = '其他'
    var score = 0
    DOMAIN_BUCKETS.forEach(function (bucket) {
      var hits = 0
      bucket.kw.forEach(function (k) { if (text.indexOf(k) >= 0) hits++ })
      if (hits > score) { score = hits; best = bucket.key }
    })
    return best
  }

  function openHistoryModal() {
    /* 拉当天全部事件（byabbe.se 一次返回全部，不需要分页） */
    var d = new Date()
    var mm = String(d.getMonth() + 1).padStart(2, '0')
    var dd = String(d.getDate()).padStart(2, '0')
    var opener = document.activeElement

    /* 遮罩 */
    var overlay = el('div', 'history-modal-overlay')

    var dialog = el('div', 'history-modal')
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')
    dialog.setAttribute('aria-label', '历史上的今天全部事件')

    function closeModal() {
      document.removeEventListener('keydown', onKey)
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      if (opener && opener.isConnected && typeof opener.focus === 'function') {
        try { opener.focus({ preventScroll: true }) } catch (e) { opener.focus() }
      }
    }
    function onKey(e) { if (e.key === 'Escape') closeModal() }

    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal() })

    var head = el('div', 'history-modal__head')
    head.appendChild(el('h3', null, '历史上的今天 · ' + (d.getMonth() + 1) + '月' + dd + '日'))
    var closeBtn = el('button', 'history-modal__close')
    closeBtn.type = 'button'
    closeBtn.setAttribute('aria-label', '关闭全部事件')
    closeBtn.innerHTML = '<i class="fas fa-times"></i>'
    closeBtn.addEventListener('click', closeModal)
    head.appendChild(closeBtn)
    dialog.appendChild(head)

    var chips = el('div', 'history-modal__chips')
    var summary = el('p', 'history-modal__summary', '')
    var list = el('div', 'history-modal__list')
    list.innerHTML = '<div class="history-modal__loading">加载中…</div>'
    dialog.appendChild(chips)
    dialog.appendChild(summary)
    dialog.appendChild(list)

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)
    document.addEventListener('keydown', onKey)
    closeBtn.focus({ preventScroll: true })

    var all = []
    var state = { era: '全部', domain: '全部主题' }

    function eraItems() {
      return state.era === '全部' ? all : all.filter(function (ev) { return eraOf(ev) === state.era })
    }

    function makeChip(label, count, active, onClick) {
      var btn = el('button', 'history-modal__chip' + (active ? ' active' : ''))
      btn.type = 'button'
      btn.innerHTML = label + '<small>' + count + '</small>'
      if (active) btn.setAttribute('aria-pressed', 'true')
      if (count === 0) {
        btn.disabled = true
        btn.setAttribute('aria-disabled', 'true')
      }
      btn.addEventListener('click', onClick)
      return btn
    }

    function buildChips() {
      chips.innerHTML = ''
      var eraRow = el('div', 'history-modal__chip-row')
      eraRow.appendChild(el('span', 'history-modal__chip-label', '年代'))
      eraRow.appendChild(makeChip('全部', all.length, state.era === '全部', function () {
        state.era = '全部'; state.domain = '全部主题'; buildChips(); render()
      }))
      ERA_KEYS.forEach(function (key) {
        var n = all.filter(function (ev) { return eraOf(ev) === key }).length
        eraRow.appendChild(makeChip(key, n, state.era === key, function () {
          state.era = key; state.domain = '全部主题'; buildChips(); render()
        }))
      })
      chips.appendChild(eraRow)

      /* 主题条数跟着当前年代实时重算：选了「现代」之后，古代里才有的主题会变灰禁用 */
      var base = eraItems()
      var domRow = el('div', 'history-modal__chip-row')
      domRow.appendChild(el('span', 'history-modal__chip-label', '主题'))
      domRow.appendChild(makeChip('全部主题', base.length, state.domain === '全部主题', function () {
        state.domain = '全部主题'; buildChips(); render()
      }))
      DOMAIN_BUCKETS.concat([{ key: '其他' }]).forEach(function (b) {
        var n = base.filter(function (ev) { return domainOf(ev) === b.key }).length
        domRow.appendChild(makeChip(b.key, n, state.domain === b.key, function () {
          state.domain = b.key; buildChips(); render()
        }))
      })
      chips.appendChild(domRow)
    }

    function render() {
      var items = eraItems()
      if (state.domain !== '全部主题') {
        items = items.filter(function (ev) { return domainOf(ev) === state.domain })
      }
      items.sort(function (a, b) { return yearOf(b) - yearOf(a) })
      summary.textContent = '共 ' + all.length + ' 条 · 当前显示 ' + items.length + ' 条'
      list.innerHTML = ''
      if (!items.length) {
        list.innerHTML = '<div class="history-modal__empty">这个筛选下没有事件，换个年代或主题看看</div>'
        return
      }
      items.forEach(function (ev) {
        var row = el('div', 'history-modal__row')
        row.innerHTML = '<span class="history-modal__year">' + ev.year + '</span>' +
          '<span class="history-modal__desc">' + (ev.description || '') + '</span>' +
          '<span class="history-modal__cat">' + domainOf(ev) + '</span>'
        list.appendChild(row)
      })
      list.scrollTop = 0
    }

    fetch('https://api.wikimedia.org/feed/v1/wikipedia/zh/onthisday/all/' + mm + '/' + dd, {
      headers: { 'Api-User-Agent': 'BikoBlog/1.0' }
    })
      .then(function (r) { return r.json() })
      .then(function (json) {
        var events = (json && json.events) || []
        all = events.map(function (ev) {
          return { year: ev.year, description: window.ZhHistory ? window.ZhHistory.t2s(ev.text || '') : (ev.text || '') }
        })
        if (!all.length) {
          list.innerHTML = '<div class="history-modal__empty">今日暂无数据</div>'
          summary.textContent = ''
          return
        }
        buildChips()
        render()
      })
      .catch(function (err) {
        if (window.console && console.warn) console.warn('[dashboard] history-modal:', err && err.message ? err.message : err)
        list.innerHTML = '<div class="history-modal__empty">加载失败</div>'
        summary.textContent = ''
      })
  }

  /* ---------------- ③.5 天气卡片 ---------------- */

  function buildWeatherShell() {
    var card = el('section', 'dash-card dash-weather')
    card.innerHTML =
      '<div class="dash-weather__head">' +
      '  <span class="dash-weather__city"><i class="fas fa-map-marker-alt"></i><span class="dash-weather__city-name">定位中…</span></span>' +
      '  <span class="dash-weather__tools">' +
      '    <button type="button" class="dash-weather__btn" data-wx="search" title="搜索城市"><i class="fas fa-magnifying-glass"></i></button>' +
      '    <button type="button" class="dash-weather__btn" data-wx="locate" title="重新定位"><i class="fas fa-location-crosshairs"></i></button>' +
      '  </span>' +
      '</div>' +
      '<div class="dash-weather__search">' +
      '  <input class="dash-weather__search-input" type="text" placeholder="搜索城市名，如：南京" autocomplete="off">' +
      '  <ul class="dash-weather__results"></ul>' +
      '</div>' +
      '<div class="dash-weather__notice" hidden></div>' +
      '<div class="dash-weather__alert" hidden></div>' +
      '<div class="dash-weather__main">' +
      '  <div class="dash-weather__temp">--°</div>' +
      '  <div class="dash-weather__icon"><i class="qi-999"></i></div>' +
      '</div>' +
      '<div class="dash-weather__desc">定位中...</div>' +
      '<div class="dash-weather__range">最高--° · 最低--°</div>' +
      '<div class="dash-weather__hourly">' +
      '  <div class="dash-weather__hour"><div class="dash-weather__hour-label">现在</div><div class="dash-weather__hour-icon"><i class="qi-999"></i></div><div class="dash-weather__hour-temp">--°</div></div>' +
      '  <div class="dash-weather__hour"><div class="dash-weather__hour-label">1h</div><div class="dash-weather__hour-icon"><i class="qi-999"></i></div><div class="dash-weather__hour-temp">--°</div></div>' +
      '  <div class="dash-weather__hour"><div class="dash-weather__hour-label">2h</div><div class="dash-weather__hour-icon"><i class="qi-999"></i></div><div class="dash-weather__hour-temp">--°</div></div>' +
      '  <div class="dash-weather__hour"><div class="dash-weather__hour-label">3h</div><div class="dash-weather__hour-icon"><i class="qi-999"></i></div><div class="dash-weather__hour-temp">--°</div></div>' +
      '</div>' +
      '<div class="dash-weather__daily" hidden></div>' +
      '<div class="dash-weather__aqi" hidden></div>' +
      '<div class="dash-weather__stats">' +
      '  <div class="dash-weather__stat"><i class="fas fa-temperature-half"></i>体感 <span>--°</span></div>' +
      '  <div class="dash-weather__stat"><i class="fas fa-droplet"></i>湿度 <span>--%</span></div>' +
      '  <div class="dash-weather__stat"><i class="fas fa-wind"></i>风力 <span>--级</span></div>' +
      '</div>'
    return card
  }

  /* ---------------- ③.6 工作日历卡 ---------------- */

  function buildCalendarShell() {
    var card = el('section', 'dash-card dash-calendar')
    card.innerHTML =
      '<div class="dash-calendar__head">' +
      '  <button class="dash-calendar__btn dash-calendar__btn--prev"><i class="fas fa-chevron-left"></i></button>' +
      '  <a class="dash-calendar__title" href="/calendar/">工作迹寻</a>' +
      '  <select class="dash-calendar__year"></select>' +
      '  <select class="dash-calendar__month"></select>' +
      '  <button class="dash-calendar__btn dash-calendar__btn--next"><i class="fas fa-chevron-right"></i></button>' +
      '</div>' +
      '<div class="dash-calendar__grid"></div>'

    // 初始化日历逻辑
    initCalendar(card)

    return card
  }

  /* 日历卡渲染逻辑 */
  function initCalendar(card) {
    var now = new Date()
    var viewYear = now.getFullYear()
    var viewMonth = now.getMonth()

    var yearSelect = card.querySelector('.dash-calendar__year')
    var monthSelect = card.querySelector('.dash-calendar__month')
    var grid = card.querySelector('.dash-calendar__grid')
    var prevBtn = card.querySelector('.dash-calendar__btn--prev')
    var nextBtn = card.querySelector('.dash-calendar__btn--next')

    // 文章日期数据（从 JSON 文件加载，构建期生成的发文点数据源）
    var postDates = {}

    // 工作迹寻数据（只读着色叠加；本卡不弹窗、不发任何写请求）。
    // 本地 hexo server 不执行 Pages Functions，404/失败时静默退化为空，
    // 发文点（postDates）不受影响。
    var worklogDates = {}
    fetch('/api/worklog/list')
      .then(function (r) { return r.ok ? r.json() : null })
      .then(function (body) {
        if (!body || !body.ok || !body.data) return
        Object.keys(body.data).forEach(function (k) {
          var list = body.data[k] || []
          var openTodo = list.some(function (it) { return it && it.kind === 'todo' && !it.done })
          var first = list.find(function (it) { return it && it.tag })
          worklogDates[k] = {
            items: list.slice(),
            count: list.length,
            openTodo: openTodo,
            tag: first ? first.tag : ''
          }
        })
        render()
      })
      .catch(function () { /* 无后端环境：保持空，不影响发文点渲染 */ })

    /* 日期任务弹层（只读）：PC 悬停、手机点按当天日期弹出。
       弹层挂 body 用 fixed 定位，避免被卡片 overflow 裁掉；点外部 / 滚动 / 换月关闭。 */
    var tip = null
    var openDay = null

    function ensureTip() {
      if (tip) return tip
      tip = el('div', 'dash-calendar__tip')
      tip.style.display = 'none'
      document.body.appendChild(tip)
      return tip
    }

    function hideTip() {
      if (tip) tip.style.display = 'none'
      openDay = null
    }

    function fmtDate(y, m, d) {
      return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0')
    }

    function showTip(dayEl, dateKey, looseKey) {
      var wl = worklogDates[dateKey]
      var hasPost = !!postDates[dateKey] || !!postDates[looseKey]
      if (!wl && !hasPost) return

      var box = ensureTip()
      box.innerHTML = ''

      var head = el('div', 'dash-calendar__tip-head', dateKey)
      box.appendChild(head)

      var ul = el('ul', 'dash-calendar__tip-list')
      var rows = (wl && wl.items) || []
      rows.forEach(function (it) {
        if (!it) return
        var li = el('li', 'dash-calendar__tip-item' + (it.done === true ? ' is-done' : ''))
        var tag = el('span', 'dash-calendar__tip-tag')
        tag.textContent = it.tag || '其他'
        var txt = el('span', 'dash-calendar__tip-text')
        txt.textContent = it.text || ''
        var time = el('span', 'dash-calendar__tip-time')
        time.textContent = it.t || ''
        li.appendChild(tag)
        li.appendChild(txt)
        li.appendChild(time)
        ul.appendChild(li)
      })
      if (hasPost) {
        ul.appendChild(el('li', 'dash-calendar__tip-post', '当日有文章发布'))
      }
      if (!rows.length && !hasPost) {
        ul.appendChild(el('li', 'dash-calendar__tip-empty', '当天无安排'))
      }
      box.appendChild(ul)

      box.style.display = 'block'
      var r = dayEl.getBoundingClientRect()
      var tw = box.offsetWidth
      var th = box.offsetHeight
      var x = r.left + r.width / 2 - tw / 2
      x = Math.max(8, Math.min(x, window.innerWidth - tw - 8))
      var y = r.top - th - 8
      if (y < 8) y = r.bottom + 8
      box.style.left = x + 'px'
      box.style.top = y + 'px'
      openDay = dayEl
    }

    // 触屏没有 hover：点按只走 click 开关；桌面端 hover 显示、离开隐藏，click 仅作冗余开关。
    var HOVER_OK = typeof matchMedia === 'function' && matchMedia('(hover: hover)').matches

    function bindDay(dayEl, dateKey, looseKey) {
      dayEl.addEventListener('mouseenter', function () { if (HOVER_OK) showTip(dayEl, dateKey, looseKey) })
      dayEl.addEventListener('mouseleave', function () { if (HOVER_OK) hideTip() })
      dayEl.addEventListener('click', function (e) {
        e.stopPropagation()
        if (openDay === dayEl) { hideTip(); return }
        showTip(dayEl, dateKey, looseKey)
      })
    }

    document.addEventListener('click', function (e) {
      if (tip && tip.style.display === 'block' && !tip.contains(e.target)) hideTip()
    })
    window.addEventListener('scroll', hideTip, { passive: true })
    window.addEventListener('resize', hideTip)

    // 初始化年份下拉（前后各5年）
    for (var y = viewYear - 5; y <= viewYear + 5; y++) {
      var opt = document.createElement('option')
      opt.value = y
      opt.textContent = y + '年'
      yearSelect.appendChild(opt)
    }
    yearSelect.value = viewYear

    // 初始化月份下拉
    var monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    for (var m = 0; m < 12; m++) {
      var opt2 = document.createElement('option')
      opt2.value = m
      opt2.textContent = monthNames[m]
      monthSelect.appendChild(opt2)
    }
    monthSelect.value = viewMonth

    // 加载真实的文章日期数据
    fetch('/data/post-dates.json')
      .then(function(r) { return r.json() })
      .then(function(data) {
        postDates = data
        render() // 加载完成后重新渲染
      })
      .catch(function(e) {
        // 加载失败时用空数据
        console.warn('[dashboard] 加载文章日期失败', e)
      })

    // 渲染日历
    function render() {
      yearSelect.value = viewYear
      monthSelect.value = viewMonth

      grid.innerHTML = ''

      // 星期表头
      var weekDays = ['日', '一', '二', '三', '四', '五', '六']
      for (var i = 0; i < 7; i++) {
        var header = document.createElement('div')
        header.className = 'header'
        header.textContent = weekDays[i]
        grid.appendChild(header)
      }

      // 当月第一天是星期几
      var firstDay = new Date(viewYear, viewMonth, 1).getDay()
      // 当月有多少天
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

      // 前面的空格
      for (var s = 0; s < firstDay; s++) {
        var empty = document.createElement('div')
        empty.className = 'day empty'
        grid.appendChild(empty)
      }

      // 日期格子
      for (var d = 1; d <= daysInMonth; d++) {
        var dayEl = document.createElement('div')
        dayEl.className = 'day'
        dayEl.textContent = d

        // 今天高亮
        if (viewYear === now.getFullYear() && viewMonth === now.getMonth() && d === now.getDate()) {
          dayEl.classList.add('today')
        }

        // 日期键统一补零（后端 KV 键为 YYYY-MM-DD；post-dates.json 可能不补零，双格式兼容）
        var dateKey = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0')
        var looseKey = viewYear + '-' + (viewMonth + 1) + '-' + d

        // 有文章的日期加发文小点（保留，不被工作记录着色覆盖）
        if (postDates[dateKey] || postDates[looseKey]) {
          dayEl.classList.add('has-post')
        }

        // 工作迹寻只读着色：有待办日用琥珀底，纯记录日用主题淡底
        var wl = worklogDates[dateKey]
        if (wl && wl.openTodo) dayEl.classList.add('has-open-todo')
        else if (wl && wl.count) dayEl.classList.add('has-worklog')

        bindDay(dayEl, dateKey, looseKey)
        grid.appendChild(dayEl)
      }
    }

    // 左右箭头切换
    prevBtn.addEventListener('click', function() {
      viewMonth--
      if (viewMonth < 0) {
        viewMonth = 11
        viewYear--
      }
      hideTip()
      render()
    })

    nextBtn.addEventListener('click', function() {
      viewMonth++
      if (viewMonth > 11) {
        viewMonth = 0
        viewYear++
      }
      hideTip()
      render()
    })

    // 年月下拉切换
    yearSelect.addEventListener('change', function() {
      viewYear = parseInt(this.value)
      hideTip()
      render()
    })

    monthSelect.addEventListener('change', function() {
      viewMonth = parseInt(this.value)
      hideTip()
      render()
    })

    // 初始渲染
    render()
  }

  /* ------------------- 压图工具：纯本地 canvas 压缩，图片不出浏览器 ------------------- */

  var COMPRESS_PREF_KEY = 'biko-compress-prefs'
  var compressPrefs = null
  var compressQueue = []
  var compressSeed = 0
  var compressRunning = false
  var COMPRESS_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
  var COMPRESS_MAX_EDGE = 8000

  function compressClamp(n, min, max) {
    return Math.min(max, Math.max(min, n))
  }

  function compressGetPrefs() {
    if (compressPrefs) return compressPrefs
    var def = { level: 6, format: 'original', fit: 'ratio', width: '', height: '' }
    try {
      var raw = window.localStorage.getItem(COMPRESS_PREF_KEY)
      if (raw) {
        var o = JSON.parse(raw)
        if (o && typeof o === 'object') {
          var lv = parseInt(o.level, 10)
          if (lv >= 1 && lv <= 10) def.level = lv
          if (o.format === 'webp' || o.format === 'png' || o.format === 'jpg') def.format = o.format
          if (o.fit === 'stretch' || o.fit === 'crop') def.fit = o.fit
          var w = parseInt(o.width, 10)
          var h = parseInt(o.height, 10)
          if (w > 0) def.width = String(Math.min(COMPRESS_MAX_EDGE, w))
          if (h > 0) def.height = String(Math.min(COMPRESS_MAX_EDGE, h))
        }
      }
    } catch (e) { /* 隐私模式 / file:// 读不到就退回默认值 */ }
    compressPrefs = def
    return def
  }

  function compressSetPrefs(patch) {
    var prefs = compressGetPrefs()
    for (var k in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, k)) prefs[k] = patch[k]
    }
    try {
      window.localStorage.setItem(COMPRESS_PREF_KEY, JSON.stringify(prefs))
    } catch (e) {}
  }

  /* 强度 1–10 → 质量 .96–.38，与洪绘压图同一条曲线，档位观感可直接对照 */
  function compressQuality(level) {
    var lv = compressClamp(level, 1, 10)
    return (96 - (lv - 1) * 58 / 9) / 100
  }

  function compressInputType(file) {
    var t = String((file && file.type) || '').toLowerCase()
    if (t === 'image/jpeg' || t === 'image/jpg' || t === 'image/pjpeg') return 'image/jpeg'
    if (t === 'image/png') return 'image/png'
    if (t === 'image/webp') return 'image/webp'
    return ''
  }

  function compressOutType(choice, inputType) {
    if (choice === 'webp') return 'image/webp'
    if (choice === 'png') return 'image/png'
    if (choice === 'jpg') return 'image/jpeg'
    return inputType || 'image/webp'
  }

  function compressBytes(n) {
    if (!isFinite(n) || n <= 0) return '0 B'
    if (n < 1024) return n + ' B'
    if (n < 1048576) return Math.round(n / 1024) + ' KB'
    return (n / 1048576).toFixed(1) + ' MB'
  }

  function compressSaveName(name, type) {
    var ext = COMPRESS_EXT[type] || 'img'
    var base = String(name || 'image').replace(/\.([a-z0-9]+)$/i, '')
    if (!base) base = 'image'
    return base + '.' + ext
  }

  function compressEscape(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  function compressStateText(s) {
    var map = { waiting: '等待', processing: '处理中', done: '完成', skipped: '已最优', error: '失败' }
    return map[s] || s
  }

  function compressPendingCount() {
    var n = 0
    for (var i = 0; i < compressQueue.length; i++) {
      if (compressQueue[i].status === 'waiting' || compressQueue[i].status === 'processing') n++
    }
    return n
  }

  function compressToBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
        canvas.convertToBlob({ type: type, quality: quality }).then(resolve, reject)
        return
      }
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob)
        else reject(new Error('浏览器不支持导出该格式'))
      }, type, quality)
    })
  }

  /* 单张处理：解图（带 EXIF 方向）→ 按设置算尺寸/裁剪 → 画布重绘 → 编码。
     重编码反而更大时保留原图，标「已最优」而不是给一个更大的文件。 */
  async function compressOne(item) {
    var prefs = compressGetPrefs()
    if (typeof createImageBitmap !== 'function') throw new Error('浏览器不支持本地解图')

    var bmp
    try {
      bmp = await createImageBitmap(item.file, { imageOrientation: 'from-image' })
    } catch (e) {
      throw new Error('浏览器无法解码该格式')
    }

    var srcW = bmp.width
    var srcH = bmp.height
    if (!srcW || !srcH) throw new Error('图片尺寸异常')

    var wantW = parseInt(prefs.width, 10) || 0
    var wantH = parseInt(prefs.height, 10) || 0
    var tw = srcW
    var th = srcH
    var cropX = 0
    var cropY = 0
    var cropW = srcW
    var cropH = srcH

    if (wantW && wantH) {
      if (prefs.fit === 'crop') {
        var cover = Math.max(wantW / srcW, wantH / srcH)
        cropW = Math.min(srcW, Math.round(wantW / cover))
        cropH = Math.min(srcH, Math.round(wantH / cover))
        cropX = Math.round((srcW - cropW) / 2)
        cropY = Math.round((srcH - cropH) / 2)
        tw = wantW
        th = wantH
      } else if (prefs.fit === 'ratio') {
        var fitK = Math.min(wantW / srcW, wantH / srcH)
        tw = Math.max(1, Math.round(srcW * fitK))
        th = Math.max(1, Math.round(srcH * fitK))
      } else {
        tw = wantW
        th = wantH
      }
    } else if (wantW) {
      tw = wantW
      th = Math.max(1, Math.round(srcH * wantW / srcW))
    } else if (wantH) {
      th = wantH
      tw = Math.max(1, Math.round(srcW * wantH / srcH))
    }

    if (tw > COMPRESS_MAX_EDGE || th > COMPRESS_MAX_EDGE) {
      throw new Error('输出尺寸超过 ' + COMPRESS_MAX_EDGE + 'px 上限')
    }

    var outType = compressOutType(prefs.format, item.inputType)
    var canvas = document.createElement('canvas')
    canvas.width = tw
    canvas.height = th
    var ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建画布')
    /* JPEG 没有 alpha：先铺白底，否则原图透明像素会变黑 */
    if (outType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, tw, th)
    }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bmp, cropX, cropY, cropW, cropH, 0, 0, tw, th)
    if (typeof bmp.close === 'function') bmp.close()

    var quality = compressQuality(prefs.level)
    /* PNG 没有质量参数，浏览器又是无损重编码，常常变大；不达标就退回原图 */
    var blob = outType === 'image/png'
      ? await compressToBlob(canvas, 'image/png', undefined)
      : await compressToBlob(canvas, outType, quality)

    if (blob.size >= item.before) {
      item.status = 'skipped'
      item.note = '重编码后更大，已保留原图'
      item.blob = item.file
      item.after = item.before
      item.outType = item.inputType
      return
    }

    item.blob = blob
    item.after = blob.size
    item.outType = outType
    item.status = 'done'
    item.note = tw + ' × ' + th
  }

  /* 串行处理：逐张跑，避免几十张大图同时进画布把内存打爆 */
  async function compressRun(dlg) {
    if (compressRunning) return
    compressRunning = true
    try {
      while (true) {
        var next = null
        for (var i = 0; i < compressQueue.length; i++) {
          if (compressQueue[i].status === 'waiting') { next = compressQueue[i]; break }
        }
        if (!next) break
        next.status = 'processing'
        compressRender(dlg)
        try {
          await compressOne(next)
        } catch (e) {
          next.status = 'error'
          next.note = (e && e.message) || '处理失败'
        }
        compressRender(dlg)
      }
    } finally {
      compressRunning = false
      compressRender(dlg)
    }
  }

  function compressRender(dlg) {
    if (!dlg) return
    var queueEl = $('.dash-compress__queue', dlg)
    var dropEl = $('.dash-compress__drop', dlg)
    var sumEl = $('.dash-compress__sum', dlg)
    var saveEl = $('.dash-compress__save', dlg)
    if (!queueEl) return

    var has = compressQueue.length > 0
    queueEl.hidden = !has
    if (dropEl) dropEl.hidden = has

    if (has) {
      var html = ''
      for (var i = 0; i < compressQueue.length; i++) {
        var it = compressQueue[i]
        var size = '<s>' + compressBytes(it.before) + '</s>'
        if (it.status === 'done') {
          var cut = it.before > 0 ? Math.round((1 - it.after / it.before) * 100) : 0
          size += ' → <b>' + compressBytes(it.after) + '</b> <em>−' + cut + '%</em>'
        } else if (it.status === 'skipped') {
          size += ' → 保持原图'
        } else if (it.status === 'processing') {
          size += ' → 处理中'
        } else if (it.status === 'error') {
          size += ' → ' + compressEscape(it.note || '失败')
        }
        html += '<div class="dash-compress__row" data-status="' + it.status + '">' +
          '<span class="dash-compress__state">' + compressStateText(it.status) + '</span>' +
          '<span class="dash-compress__name" title="' + compressEscape(it.name) + '">' + compressEscape(it.name) + '</span>' +
          '<span class="dash-compress__size">' + size + '</span>' +
          (it.status === 'done' || it.status === 'skipped'
            ? '<button type="button" class="dash-compress__get" data-get="' + it.id + '">下载</button>'
            : '<span class="dash-compress__get is-idle"></span>') +
          '</div>'
      }
      queueEl.innerHTML = html
    }

    var totalBefore = 0
    var totalAfter = 0
    var okCount = 0
    var running = 0
    for (var j = 0; j < compressQueue.length; j++) {
      var q = compressQueue[j]
      totalBefore += q.before || 0
      if (q.status === 'done' || q.status === 'skipped') { totalAfter += q.after || 0; okCount++ }
      if (q.status === 'waiting' || q.status === 'processing') running++
    }
    if (sumEl) {
      sumEl.textContent = has
        ? compressQueue.length + ' 张 · ' + compressBytes(totalBefore) + ' → ' + compressBytes(totalAfter) + (running ? ' · 处理中 ' + running : '')
        : '等待添加'
    }
    if (saveEl) saveEl.hidden = okCount === 0
    var retryEl = $('.dash-compress__retry', dlg)
    if (retryEl) retryEl.hidden = !has || running > 0
  }

  function compressAdd(dlg, files) {
    if (!files || !files.length) return
    var accepted = 0
    for (var i = 0; i < files.length; i++) {
      var f = files[i]
      var type = compressInputType(f)
      compressSeed++
      if (!type) {
        /* 浏览器解不了的格式也进队列，让用户看到失败原因，而不是静默吞掉 */
        compressQueue.push({
          id: 'c' + compressSeed,
          file: f,
          name: f.name || ('file-' + compressSeed),
          before: f.size || 0,
          after: 0,
          status: 'error',
          note: '浏览器不支持该格式（HEIC/AVIF/GIF 需客户端）',
          inputType: '',
          blob: null,
          outType: ''
        })
        continue
      }
      compressQueue.push({
        id: 'c' + compressSeed,
        file: f,
        name: f.name || ('image-' + compressSeed),
        before: f.size || 0,
        after: 0,
        status: 'waiting',
        note: '',
        inputType: type,
        blob: null,
        outType: type
      })
      accepted++
    }
    compressRender(dlg)
    if (accepted) compressRun(dlg)
  }

  function compressDownload(item) {
    if (!item || !item.blob) return
    var name = compressSaveName(item.name, item.outType || item.inputType)
    var url = URL.createObjectURL(item.blob)
    var a = document.createElement('a')
    a.href = url
    a.download = name
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(function () {
      URL.revokeObjectURL(url)
      if (a.parentNode) a.parentNode.removeChild(a)
    }, 1500)
  }

  function compressDownloadAll() {
    var ready = []
    for (var i = 0; i < compressQueue.length; i++) {
      if (compressQueue[i].blob) ready.push(compressQueue[i])
    }
    ready.forEach(function (it, idx) {
      setTimeout(function () { compressDownload(it) }, idx * 180)
    })
  }

  function compressClear(dlg) {
    compressQueue.length = 0
    compressRender(dlg)
    var input = $('.dash-compress input[type="file"]', dlg)
    if (input) input.value = ''
  }

  /* 改完设置后重跑已有队列：原站的「再次压缩」就是这一步 */
  function compressRequeue(dlg) {
    for (var i = 0; i < compressQueue.length; i++) {
      var it = compressQueue[i]
      if (!it.inputType) continue
      it.status = 'waiting'
      it.blob = null
      it.after = 0
      it.note = ''
    }
    compressRender(dlg)
    compressRun(dlg)
  }

  /* 关闭前拦一下正在跑的任务：队列在内存里，关了不会丢，但用户要知道还在跑 */
  function compressGuardClose(dlg) {
    var n = compressPendingCount()
    if (!n) return true
    return window.confirm('还有 ' + n + ' 张在压缩，现在关闭会中断。确定关闭？')
  }

  /* ---------- 压图层挂载与开关 ----------
     不用 <dialog>.showModal()：top layer 在部分浏览器/嵌入环境下不参与合成，
     会出现「DOM 在位、rect 正确、勾选命中，但屏幕上空白」的情况。
     改成挂在 body 上的自绘遮罩层，走普通渲染路径，视觉与命中都能被验证。 */
  var compressUi = null

  function compressTrapTab(e) {
    if (!compressUi) return
    var nodes = Array.prototype.filter.call(
      compressUi.panel.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (n) { return !n.disabled && n.offsetParent !== null }
    )
    if (!nodes.length) return
    var first = nodes[0]
    var last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function compressEnsureUi() {
    if (compressUi) return compressUi
    compressUi = buildCompressDialog()
    addToolExpand(compressUi.panel, $('.dash-compress__head', compressUi.panel))
    document.body.appendChild(compressUi.layer)
    /* Esc 与 Tab 只绑一次，靠 layer 的 hidden 判断是否在开 */
    document.addEventListener('keydown', function (e) {
      if (!compressUi || compressUi.layer.hidden) return
      if (e.key === 'Escape') {
        if (compressGuardClose(compressUi.panel)) compressClose()
        return
      }
      if (e.key === 'Tab') compressTrapTab(e)
    })
    return compressUi
  }

  function compressClose() {
    if (!compressUi || compressUi.layer.hidden) return
    compressUi.layer.hidden = true
    window.BikoToolElectric?.hide(compressUi.layer)
    document.documentElement.classList.remove('is-compress-open')
    window.BikoToolBackground('compress', false)
    var trigger = compressUi.trigger
    if (trigger && typeof trigger.focus === 'function' && document.contains(trigger)) trigger.focus({ preventScroll: true })
  }

  function compressOpen(trigger) {
    var ui = compressEnsureUi()
    compressRender(ui.panel)
    ui.trigger = trigger || null
    ui.layer.hidden = false
    document.documentElement.classList.add('is-compress-open')
    window.BikoToolElectric?.show(ui.layer, ui.panel)
    window.BikoToolBackground('compress', true)
    /* 焦点落在第一个可下载的行，没有队列就落在拖拽区 */
    var getBtn = $('.dash-compress__get:not(.is-idle)', ui.panel)
    var dropEl = $('.dash-compress__drop', ui.panel)
    if (getBtn) getBtn.focus()
    else if (dropEl && !dropEl.hidden) dropEl.focus()
  }

  function buildCompressDialog() {
    var layer = el('div', 'dash-compress-layer')
    layer.hidden = true
    var dlg = el('div', 'dash-compress')
    dlg.setAttribute('role', 'dialog')
    dlg.setAttribute('aria-modal', 'true')
    dlg.setAttribute('aria-labelledby', 'dash-compress-title')
    dlg.innerHTML =
      '<header class="dash-compress__head">' +
      '  <span class="dash-compress__brand"><i class="fas fa-compress" aria-hidden="true"></i><b id="dash-compress-title">图片压缩</b></span>' +
      '  <span class="dash-compress__hint">纯本地运算，不上传</span>' +
      '  <button type="button" class="dash-compress__close" aria-label="关闭压图">×</button>' +
      '</header>' +
      '<div class="dash-compress__body">' +
      '  <div class="dash-compress__drop" role="button" tabindex="0" aria-label="选择或拖入图片">' +
      '    <i class="fas fa-cloud-arrow-up" aria-hidden="true"></i>' +
      '    <strong>拖入图片开始压缩</strong>' +
      '    <small>JPG · PNG · WebP，也支持 Ctrl+V 粘贴</small>' +
      '    <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden>' +
      '  </div>' +
      '  <div class="dash-compress__queue" hidden></div>' +
      '  <details class="dash-compress__opts">' +
      '    <summary>更多设置</summary>' +
      '    <div class="dash-compress__grid">' +
      '      <label>宽度<input type="number" min="1" max="8000" step="1" data-pref="width" placeholder="自动"></label>' +
      '      <label>高度<input type="number" min="1" max="8000" step="1" data-pref="height" placeholder="自动"></label>' +
      '      <label>缩放方式<select data-pref="fit">' +
      '        <option value="ratio">保持原始宽高比</option>' +
      '        <option value="stretch">拉伸到指定宽高</option>' +
      '        <option value="crop">按指定宽高裁剪</option>' +
      '      </select></label>' +
      '      <label>目标格式<select data-pref="format">' +
      '        <option value="original">原格式</option>' +
      '        <option value="webp">WebP</option>' +
      '        <option value="png">PNG</option>' +
      '        <option value="jpg">JPG</option>' +
      '      </select></label>' +
      '      <label class="dash-compress__level">压缩强度 <b class="dash-compress__levelval">6</b>' +
      '        <input type="range" min="1" max="10" step="1" data-pref="level">' +
      '      </label>' +
      '    </div>' +
      '  </details>' +
      '</div>' +
      '<footer class="dash-compress__foot">' +
      '  <button type="button" class="dash-compress__add">＋ 添加图片</button>' +
      '  <span class="dash-compress__sum">等待添加</span>' +
      '  <button type="button" class="dash-compress__retry" hidden>重新压缩</button>' +
      '  <button type="button" class="dash-compress__save" hidden>保存全部</button>' +
      '  <button type="button" class="dash-compress__clear">清空</button>' +
      '</footer>'

    var dropEl = $('.dash-compress__drop', dlg)
    var inputEl = $('.dash-compress input[type="file"]', dlg)
    var queueEl = $('.dash-compress__queue', dlg)
    var levelEl = $('.dash-compress__levelval', dlg)

    /* 设置项回填 + 变更即存（下次打开还是上次的档位） */
    var prefs = compressGetPrefs()
    Array.prototype.forEach.call(dlg.querySelectorAll('[data-pref]'), function (f) {
      var key = f.getAttribute('data-pref')
      if (key === 'level') f.value = prefs.level
      else if (prefs[key] !== undefined) f.value = prefs[key]

      f.addEventListener('change', function () {
        var patch = {}
        if (key === 'width' || key === 'height') {
          var n = parseInt(this.value, 10)
          patch[key] = n > 0 ? String(Math.min(COMPRESS_MAX_EDGE, n)) : ''
          this.value = patch[key]
        } else if (key === 'level') {
          patch.level = compressClamp(parseInt(this.value, 10) || 6, 1, 10)
        } else {
          patch[key] = this.value
        }
        compressSetPrefs(patch)
      })
    })
    if (levelEl) {
      var levelInput = $('.dash-compress input[type="range"]', dlg)
      if (levelInput) {
        levelInput.addEventListener('input', function () {
          var lv = compressClamp(parseInt(this.value, 10) || 6, 1, 10)
          levelEl.textContent = lv
          compressSetPrefs({ level: lv })
        })
      }
    }

    dropEl.addEventListener('click', function () { if (inputEl) inputEl.click() })
    dropEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (inputEl) inputEl.click()
      }
    })
    if (inputEl) {
      inputEl.addEventListener('change', function () {
        compressAdd(dlg, this.files)
        this.value = ''
      })
    }

    ;['dragenter', 'dragover'].forEach(function (ev) {
      dlg.addEventListener(ev, function (e) {
        e.preventDefault()
        dropEl.classList.add('is-over')
      })
    })
    ;['dragleave', 'drop'].forEach(function (ev) {
      dlg.addEventListener(ev, function (e) {
        e.preventDefault()
        if (ev === 'dragleave' && dlg.contains(e.relatedTarget)) return
        dropEl.classList.remove('is-over')
      })
    })
    dlg.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) compressAdd(dlg, e.dataTransfer.files)
    })

    /* 粘贴：弹层有焦点时才接管，避免抢走页面原本的快捷键 */
    dlg.addEventListener('paste', function (e) {
      var items = (e.clipboardData && e.clipboardData.items) || []
      var files = []
      for (var i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          var f = items[i].getAsFile()
          if (f) files.push(f)
        }
      }
      if (files.length) {
        e.preventDefault()
        compressAdd(dlg, files)
      }
    })

    queueEl.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-get]') : null
      if (!btn) return
      var id = btn.getAttribute('data-get')
      for (var i = 0; i < compressQueue.length; i++) {
        if (compressQueue[i].id === id) { compressDownload(compressQueue[i]); break }
      }
    })

    $('.dash-compress__close', dlg).addEventListener('click', function () {
      if (compressGuardClose(dlg)) compressClose()
    })
    $('.dash-compress__add', dlg).addEventListener('click', function () { if (inputEl) inputEl.click() })
    $('.dash-compress__retry', dlg).addEventListener('click', function () { compressRequeue(dlg) })
    $('.dash-compress__save', dlg).addEventListener('click', compressDownloadAll)
    $('.dash-compress__clear', dlg).addEventListener('click', function () { compressClear(dlg) })

    /* 点遮罩关闭：只有落在面板外面才算 */
    layer.addEventListener('click', function (e) {
      if (e.target !== layer) return
      if (compressGuardClose(dlg)) compressClose()
    })

    layer.appendChild(dlg)
    compressRender(dlg)
    return { layer: layer, panel: dlg }
  }

  /* ============================================================
   * ⑥ 动图：视频 → GIF / 帧图（纯本地，不依赖任何库）
   * ------------------------------------------------------------
   * GIF 走自己写的 GIF89a 编码器：每帧中位切分量化 → LZW → 子块化。
   * 抽帧用 <video> + seek，逐帧 drawImage 到 canvas，边抽边编码，
   * 内存里只留编码结果，不留原始像素（几十帧 RGBA 会爆内存）。
   * 体积控制：先按经验值估算一个保守宽度，编码后超限再逐轮降级。
   * ============================================================ */
  var ANIM_PREF_KEY = 'biko-anim-prefs'
  var ANIM_MAX_SEC = 30          // 单段最多处理前 30 秒
  var ANIM_MAX_FRAMES = 360      // 帧数硬上限，防止一次跑太久
  var ANIM_MAX_WIDTH = 720
  var animPrefs = null
  var animTask = null
  var animUi = null
  var animBusy = false

  function animGetPrefs() {
    if (animPrefs) return animPrefs
    var def = { mode: 'gif', limit: '5', fps: 12, width: '', count: 24, imgfmt: 'jpg' }
    try {
      var raw = window.localStorage.getItem(ANIM_PREF_KEY)
      if (raw) {
        var o = JSON.parse(raw)
        if (o && typeof o === 'object') {
          if (o.mode === 'frames') def.mode = 'frames'
          var lim = parseFloat(o.limit)
          if (lim >= 1 && lim <= 20) def.limit = String(lim)
          var fps = parseInt(o.fps, 10)
          if (fps >= 4 && fps <= 30) def.fps = fps
          var w = parseInt(o.width, 10)
          if (w >= 80) def.width = String(Math.min(ANIM_MAX_WIDTH, w))
          var cnt = parseInt(o.count, 10)
          if (cnt >= 4 && cnt <= 120) def.count = cnt
          if (o.imgfmt === 'png') def.imgfmt = 'png'
        }
      }
    } catch (e) {}
    animPrefs = def
    return def
  }

  function animSetPrefs(patch) {
    var prefs = animGetPrefs()
    for (var k in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, k)) prefs[k] = patch[k]
    }
    try {
      window.localStorage.setItem(ANIM_PREF_KEY, JSON.stringify(prefs))
    } catch (e) {}
  }

  function animBytes(n) {
    if (!isFinite(n) || n <= 0) return '0 B'
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB'
    return (n / 1024 / 1024).toFixed(1) + ' MB'
  }

  /* 按宽度等比缩放，宽度不填就保留原尺寸（再被 720 上限截） */
  function animFit(vw, vh, maxW) {
    var w = maxW > 0 ? Math.min(maxW, vw) : vw
    if (w >= vw) return { w: vw, h: vh }
    var h = Math.max(2, Math.round(vh * w / vw))
    return { w: w, h: h & ~1 }
  }

  /* 可增长的字节缓冲：GIF 是流式拼装的，用 Uint8Array 攒比数组 push 快得多 */
  function AnimSink() {
    this.buf = new Uint8Array(1 << 16)
    this.len = 0
  }
  AnimSink.prototype.push = function (b) {
    if (this.len >= this.buf.length) {
      var nb = new Uint8Array(this.buf.length * 2)
      nb.set(this.buf)
      this.buf = nb
    }
    this.buf[this.len++] = b
  }
  AnimSink.prototype.pushAll = function (arr) {
    for (var i = 0; i < arr.length; i++) this.push(arr[i])
  }
  AnimSink.prototype.u16 = function (n) {
    this.push(n & 255)
    this.push((n >> 8) & 255)
  }
  AnimSink.prototype.u32 = function (n) {
    this.push(n & 255)
    this.push((n >> 8) & 255)
    this.push((n >> 16) & 255)
    this.push((n >>> 24) & 255)
  }
  AnimSink.prototype.ascii = function (s) {
    for (var i = 0; i < s.length; i++) this.push(s.charCodeAt(i))
  }
  AnimSink.prototype.tail = function () {
    return this.buf.subarray(0, this.len)
  }

  /* ---------------- 量化：中位切分 + 5-5-5 惰性查找表 ---------------- */
  function animQuantize(data, total, maxColors) {
    var step = Math.max(1, Math.floor(total / 6000))
    var samples = []
    for (var i = 0; i < total; i += step) {
      var p = i * 4
      /* 半透明像素（视频一般没有）按白底合成，避免量化出黑边 */
      var a = data[p + 3] / 255
      samples.push([
        Math.round(data[p] * a + 255 * (1 - a)),
        Math.round(data[p + 1] * a + 255 * (1 - a)),
        Math.round(data[p + 2] * a + 255 * (1 - a))
      ])
    }
    if (!samples.length) samples.push([0, 0, 0])

    var boxes = [samples]
    while (boxes.length < maxColors) {
      var bi = -1
      var bestRange = 0
      var bestCh = 0
      for (var b = 0; b < boxes.length; b++) {
        var box = boxes[b]
        if (box.length < 2) continue
        var mn0 = 255, mn1 = 255, mn2 = 255
        var mx0 = 0, mx1 = 0, mx2 = 0
        for (var j = 0; j < box.length; j++) {
          var c = box[j]
          if (c[0] < mn0) mn0 = c[0]
          if (c[0] > mx0) mx0 = c[0]
          if (c[1] < mn1) mn1 = c[1]
          if (c[1] > mx1) mx1 = c[1]
          if (c[2] < mn2) mn2 = c[2]
          if (c[2] > mx2) mx2 = c[2]
        }
        var r0 = mx0 - mn0
        var r1 = mx1 - mn1
        var r2 = mx2 - mn2
        var ch = r0 >= r1 && r0 >= r2 ? 0 : (r1 >= r2 ? 1 : 2)
        var range = ch === 0 ? r0 : (ch === 1 ? r1 : r2)
        if (range > bestRange) { bestRange = range; bi = b; bestCh = ch }
      }
      if (bi < 0 || bestRange <= 1) break
      var cur = boxes[bi]
      cur.sort(function (x, y) { return x[bestCh] - y[bestCh] })
      var mid = Math.floor(cur.length / 2)
      boxes.splice(bi, 1, cur.slice(0, mid), cur.slice(mid))
    }

    var pal = new Uint8Array(boxes.length * 3)
    for (var k = 0; k < boxes.length; k++) {
      var bx = boxes[k]
      var sr = 0, sg = 0, sb = 0
      for (var m = 0; m < bx.length; m++) { sr += bx[m][0]; sg += bx[m][1]; sb += bx[m][2] }
      pal[k * 3] = Math.round(sr / bx.length)
      pal[k * 3 + 1] = Math.round(sg / bx.length)
      pal[k * 3 + 2] = Math.round(sb / bx.length)
    }

    var lut = new Int32Array(32768)
    lut.fill(-1)
    var idx = new Uint8Array(total)
    var n = boxes.length
    for (var t = 0; t < total; t++) {
      var q = t * 4
      var key = ((data[q] >> 3) << 10) | ((data[q + 1] >> 3) << 5) | (data[q + 2] >> 3)
      var v = lut[key]
      if (v < 0) {
        var r = data[q], g = data[q + 1], bl = data[q + 2]
        var best = 0, bestD = Infinity
        for (var u = 0; u < n; u++) {
          var dr = r - pal[u * 3]
          var dg = g - pal[u * 3 + 1]
          var db = bl - pal[u * 3 + 2]
          var d = dr * dr + dg * dg + db * db
          if (d < bestD) { bestD = d; best = u }
        }
        lut[key] = best
        v = best
      }
      idx[t] = v
    }
    return { palette: pal, count: n, indices: idx }
  }

  /* ---------------- LZW（GIF 版，变长码 + 4096 上限） ---------------- */
  var animLzwDict = null

  function animLzw(indices, total, sink) {
    if (!animLzwDict) animLzwDict = new Int32Array(1 << 20)
    var dict = animLzwDict
    dict.fill(-1)

    var minCode = 8
    var clear = 1 << minCode
    var eof = clear + 1
    var codeSize = minCode + 1
    var next = eof + 1

    var bytes = []
    var cur = 0
    var curBits = 0

    function emit(code) {
      cur |= code << curBits
      curBits += codeSize
      while (curBits >= 8) {
        bytes.push(cur & 255)
        cur >>>= 8
        curBits -= 8
      }
    }

    emit(clear)
    var prefix = indices[0]
    for (var i = 1; i < total; i++) {
      var k = indices[i]
      var key = (prefix << 8) | k
      var code = dict[key]
      if (code >= 0) { prefix = code; continue }
      emit(prefix)
      if (next < 4096) {
        dict[key] = next
        next++
        if (next > (1 << codeSize) && codeSize < 12) codeSize++
      } else {
        emit(clear)
        dict.fill(-1)
        next = eof + 1
        codeSize = minCode + 1
      }
      prefix = k
    }
    emit(prefix)
    emit(eof)
    while (curBits > 0) {
      bytes.push(cur & 255)
      cur >>>= 8
      curBits -= 8
    }
    /* 最小码长要先单独写一个字节，缺了它解码器会把首块长度当码长 */
    sink.push(minCode)
    /* 子块化：每块 ≤255 字节，块前写长度 */
    for (var off = 0; off < bytes.length; off += 255) {
      var chunk = bytes.slice(off, off + 255)
      sink.push(chunk.length)
      sink.pushAll(chunk)
    }
    sink.push(0)
  }

  /* ---------------- 单帧写进 GIF 流 ---------------- */
  function animWriteFrame(sink, quant, w, h, delayCs) {
    /* 图形控制扩展：disposal=2（回背景），无透明 */
    sink.push(0x21); sink.push(0xF9); sink.push(0x04)
    sink.push(0x08)
    sink.u16(delayCs)
    sink.push(0); sink.push(0)
    /* 图像描述符：局部色表，尺寸 = ceil(log2(count)) */
    sink.push(0x2C)
    sink.u16(0); sink.u16(0)
    sink.u16(w); sink.u16(h)
    var bits = 1
    while ((1 << bits) < quant.count) bits++
    sink.push(0x80 | (bits - 1))
    /* 局部色表补齐到 2^bits 项 */
    var slots = 1 << bits
    for (var i = 0; i < slots; i++) {
      var p = i < quant.count ? i * 3 : 0
      sink.push(quant.palette[p])
      sink.push(quant.palette[p + 1])
      sink.push(quant.palette[p + 2])
    }
    animLzw(quant.indices, w * h, sink)
  }

  /* ---------------- 视频抽帧 + 编码成 GIF ---------------- */
  function animSeekOnce(video, t) {
    return new Promise(function (resolve) {
      var done = false
      function finish() {
        if (done) return
        done = true
        video.removeEventListener('seeked', finish)
        resolve()
      }
      video.addEventListener('seeked', finish)
      try { video.currentTime = t } catch (e) { setTimeout(finish, 60) }
      setTimeout(finish, 1200) // 个别容器 seek 不回调，兜底往前走
    })
  }

  async function animGifOnce(file, params, onProgress) {
    var video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    var url = URL.createObjectURL(file)
    video.src = url

    await new Promise(function (resolve, reject) {
      video.addEventListener('loadedmetadata', resolve, { once: true })
      video.addEventListener('error', function () { reject(new Error('这个视频浏览器解不开（换 MP4/H.264 试试）')) }, { once: true })
    })

    try {
      var dur = Math.min(video.duration, ANIM_MAX_SEC)
      if (!isFinite(dur) || dur <= 0) throw new Error('读不到视频时长')
      var size = animFit(video.videoWidth, video.videoHeight, params.width)
      var canvas = document.createElement('canvas')
      canvas.width = size.w
      canvas.height = size.h
      var ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.imageSmoothingQuality = 'high'

      var fps = params.fps
      var gap = 1 / fps
      var total = Math.min(ANIM_MAX_FRAMES, Math.max(2, Math.floor(dur * fps)))
      var delayCs = Math.max(2, Math.round(100 / fps))

      var sink = new AnimSink()
      sink.ascii('GIF89a')
      sink.u16(size.w); sink.u16(size.h)
      sink.push(0x70); sink.push(0); sink.push(0)
      /* 无限循环 */
      sink.push(0x21); sink.push(0xFF); sink.push(0x0B)
      sink.ascii('NETSCAPE2.0')
      sink.push(0x03); sink.push(0x01); sink.u16(0); sink.push(0)

      var budget = params.budget || 0
      for (var i = 0; i < total; i++) {
        var t = Math.min(dur - 0.04, Math.max(0, (i + 0.5) * gap))
        await animSeekOnce(video, t)
        ctx.drawImage(video, 0, 0, size.w, size.h)
        var img = ctx.getImageData(0, 0, size.w, size.h)
        var quant = animQuantize(img.data, size.w * size.h, params.colors)
        animWriteFrame(sink, quant, size.w, size.h, delayCs)
        if (budget && sink.len > budget) {
          /* 提前止损：已经超过预算上限，不用把剩下的帧跑完 */
          throw new AnimAbort(sink.len)
        }
        if (onProgress && (i % 4 === 0 || i === total - 1)) {
          onProgress((i + 1) / total)
          await new Promise(function (r) { setTimeout(r, 0) })
        }
      }
      sink.push(0x3B)

      return {
        blob: new Blob([sink.tail()], { type: 'image/gif' }),
        w: size.w,
        h: size.h,
        frames: total
      }
    } finally {
      video.pause()
      video.removeAttribute('src')
      try { video.load() } catch (e) {}
      URL.revokeObjectURL(url)
    }
  }

  function AnimAbort(bytes) {
    this.name = 'AnimAbort'
    this.bytes = bytes
    this.message = 'budget exceeded'
  }
  AnimAbort.prototype = Object.create(Error.prototype)

  /* 编码一轮，超预算就降参数重来：先降帧率，再降宽度，最后砍色数 */
  async function animMakeGif(file, prefs, onProgress) {
    var limit = Math.max(1, parseFloat(prefs.limit) || 5) * 1024 * 1024
    var meta = animTask.meta
    var userW = parseInt(prefs.width, 10)
    var fps0 = Math.max(4, Math.min(30, parseInt(prefs.fps, 10) || 12))
    var colors0 = 256
    var vw = meta.vw
    var vh = meta.vh
    var w0 = userW > 0 ? Math.min(userW, vw) : Math.min(ANIM_MAX_WIDTH, vw)
    var framesEst = Math.min(ANIM_MAX_FRAMES, Math.floor(Math.min(meta.dur, ANIM_MAX_SEC) * fps0))

    /* 经验值：GIF 每像素约 0.3 字节，先用它压出一个不超限的起始宽度，
       免得每次都从全尺寸开始、跑完才发现超 */
    var cap = Math.sqrt((limit * 0.85 * vw) / (Math.max(1, vh) * framesEst * 0.3))
    if (isFinite(cap) && cap > 0) w0 = Math.min(w0, Math.max(120, Math.floor(cap)))

    var plan = [
      { fps: fps0, width: w0, colors: colors0 },
      { fps: Math.max(5, Math.round(fps0 * 0.8)), width: w0, colors: colors0 },
      { fps: Math.max(5, Math.round(fps0 * 0.8)), width: Math.max(120, Math.round(w0 * 0.8)), colors: 128 },
      { fps: Math.max(4, Math.round(fps0 * 0.65)), width: Math.max(100, Math.round(w0 * 0.65)), colors: 64 }
    ]

    var best = null
    for (var r = 0; r < plan.length; r++) {
      var step = plan[r]
      /* 最后一轮不再止损：一定要跑出一个完整结果，
         否则四轮都提前中断，用户只会看到"失败"而不是"最小结果" */
      var lastRound = r === plan.length - 1
      try {
        var res = await animGifOnce(file, {
          fps: step.fps,
          width: step.width,
          colors: step.colors,
          budget: lastRound ? 0 : limit * 1.02
        }, function (p) {
          onProgress(r / plan.length + p / plan.length)
        })
        best = res
        if (res.blob.size <= limit) return { res: res, tries: r + 1, ok: true }
      } catch (e) {
        if (e && e.name !== 'AnimAbort') throw e
      }
    }
    return { res: best, tries: plan.length, ok: false }
  }

  /* ---------------- 帧图：抽 N 帧 → ZIP（store，不压缩） ---------------- */
  var animCrcTable = null

  function animCrc32(bytes) {
    if (!animCrcTable) {
      animCrcTable = new Uint32Array(256)
      for (var n = 0; n < 256; n++) {
        var c = n
        for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
        animCrcTable[n] = c >>> 0
      }
    }
    var crc = 0xFFFFFFFF
    for (var i = 0; i < bytes.length; i++) {
      crc = animCrcTable[(crc ^ bytes[i]) & 255] ^ (crc >>> 8)
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  function animZip(entries) {
    var sink = new AnimSink()
    var central = []
    var offset = 0
    var now = new Date()
    var dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF
    var dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF

    for (var i = 0; i < entries.length; i++) {
      var e = entries[i]
      var name = new TextEncoder().encode(e.name)
      var crc = animCrc32(e.data)
      var start = sink.len
      sink.u32(0x04034b50)
      sink.u16(20); sink.u16(0); sink.u16(0)
      sink.u16(dosTime); sink.u16(dosDate)
      sink.u32(crc); sink.u32(e.data.length); sink.u32(e.data.length)
      sink.u16(name.length); sink.u16(0)
      sink.pushAll(name)
      sink.pushAll(e.data)
      central.push({ name: name, crc: crc, size: e.data.length, offset: start })
    }

    var cdStart = sink.len
    for (var c = 0; c < central.length; c++) {
      var it = central[c]
      sink.u32(0x02014b50)
      sink.u16(20); sink.u16(20); sink.u16(0); sink.u16(0)
      sink.u16(dosTime); sink.u16(dosDate)
      sink.u32(it.crc); sink.u32(it.size); sink.u32(it.size)
      sink.u16(it.name.length); sink.u16(0); sink.u16(0)
      sink.u16(0); sink.u16(0); sink.u32(0)
      sink.u32(it.offset)
      sink.pushAll(it.name)
    }
    var cdSize = sink.len - cdStart

    sink.u32(0x06054b50)
    sink.u16(0); sink.u16(0)
    sink.u16(central.length); sink.u16(central.length)
    sink.u32(cdSize); sink.u32(cdStart)
    sink.u16(0)

    return sink.tail()
  }

  async function animFrames(file, prefs, onProgress) {
    var video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    var url = URL.createObjectURL(file)
    video.src = url
    await new Promise(function (resolve, reject) {
      video.addEventListener('loadedmetadata', resolve, { once: true })
      video.addEventListener('error', function () { reject(new Error('这个视频浏览器解不开（换 MP4/H.264 试试）')) }, { once: true })
    })
    try {
      var dur = Math.min(video.duration || 0, ANIM_MAX_SEC)
      var count = Math.max(4, Math.min(120, parseInt(prefs.count, 10) || 24))
      var size = animFit(video.videoWidth, video.videoHeight, parseInt(prefs.width, 10) || 0)
      var fmt = prefs.imgfmt === 'png' ? 'image/png' : 'image/jpeg'
      var ext = fmt === 'image/png' ? 'png' : 'jpg'
      var quality = 0.86
      var baseName = animBaseName(file.name)
      var canvas = document.createElement('canvas')
      canvas.width = size.w
      canvas.height = size.h
      var ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      var entries = []
      for (var i = 0; i < count; i++) {
        var t = Math.min(dur - 0.04, Math.max(0, (i + 0.5) * dur / count))
        await animSeekOnce(video, t)
        ctx.drawImage(video, 0, 0, size.w, size.h)
        var blob = await new Promise(function (resolve) {
          canvas.toBlob(resolve, fmt, quality)
        })
        if (blob) {
          var buf = new Uint8Array(await blob.arrayBuffer())
          entries.push({
            name: baseName + '_' + String(i + 1).padStart(3, '0') + '.' + ext,
            data: buf
          })
        }
        if (onProgress) {
          onProgress((i + 1) / count)
          await new Promise(function (r) { setTimeout(r, 0) })
        }
      }
      var zip = animZip(entries)
      return {
        blob: new Blob([zip], { type: 'application/zip' }),
        w: size.w,
        h: size.h,
        frames: entries.length
      }
    } finally {
      video.pause()
      video.removeAttribute('src')
      try { video.load() } catch (e) {}
      URL.revokeObjectURL(url)
    }
  }

  function animBaseName(name) {
    var n = String(name || 'frame').replace(/\.\w+$/, '')
    return n.replace(/[\\/:*?"<>|]/g, '').slice(0, 40) || 'frame'
  }

  /* ---------------- 读视频元信息 ---------------- */
  function animReadMeta(file) {
    return new Promise(function (resolve, reject) {
      var video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.preload = 'metadata'
      var url = URL.createObjectURL(file)
      video.src = url
      var done = false
      function finish(err, meta) {
        if (done) return
        done = true
        video.removeAttribute('src')
        try { video.load() } catch (e) {}
        URL.revokeObjectURL(url)
        if (err) reject(err)
        else resolve(meta)
      }
      video.addEventListener('loadedmetadata', function () {
        finish(null, {
          dur: isFinite(video.duration) ? video.duration : 0,
          vw: video.videoWidth || 0,
          vh: video.videoHeight || 0
        })
      }, { once: true })
      video.addEventListener('error', function () {
        finish(new Error('这个视频浏览器解不开（换 MP4/H.264 试试）'))
      }, { once: true })
      setTimeout(function () { finish(new Error('读取视频超时')) }, 8000)
    })
  }

  /* ---------------- 任务执行 ---------------- */
  function animOnProgress(p) {
    if (!animTask) return
    animTask.progress = Math.max(0, Math.min(1, p))
    animRender()
  }

  async function animStart(file) {
    if (!file || animBusy) return
    var name = file.name || '视频'
    var ext = (name.split('.').pop() || '').toLowerCase()
    if (!/^video\//.test(file.type) && !/^(mp4|m4v|mov|webm|ogv)$/.test(ext)) {
      animTask = { name: name, state: 'error', note: '只支持 MP4 / MOV / WebM 视频', progress: 0, meta: null, result: null }
      animRender()
      return
    }
    var prefs = animGetPrefs()
    var notes = []
    animTask = { name: name, state: 'run', note: '', progress: 0, meta: null, result: null, mode: prefs.mode }
    animBusy = true
    animRender()
    try {
      var meta = await animReadMeta(file)
      animTask.meta = meta
      if (!meta.dur || !meta.vw) throw new Error('读不到视频尺寸或时长')
      if (meta.dur > ANIM_MAX_SEC + 0.5) notes.push('只处理前 ' + ANIM_MAX_SEC + ' 秒')
      animTask.note = notes.join('；')
      animRender()

      var out
      if (prefs.mode === 'frames') {
        out = await animFrames(file, prefs, animOnProgress)
      } else {
        var run = await animMakeGif(file, prefs, animOnProgress)
        out = run.res
        if (!run.ok) {
          notes.push('压不到目标体积，这是最小结果（可调低帧率或宽度）')
        } else if (out && meta.vw && out.w < meta.vw * 0.6) {
          /* 体积优先时宽度会被压得很狠，得让用户知道画质代价 */
          notes.push('为压到 ' + (parseFloat(prefs.limit) || 5) + ' MB，宽度降到 ' + out.w + 'px（原 ' + meta.vw + 'px）')
        }
      }
      if (!out) throw new Error('转换失败')
      animTask.result = out
      animTask.thumb = null
      if (prefs.mode === 'frames') animTask.ext = 'zip'
      else animTask.ext = 'gif'
      animTask.state = 'done'
      animTask.progress = 1
      animTask.note = notes.join('；')
    } catch (e) {
      animTask.state = 'error'
      animTask.note = (e && e.message) || '转换失败'
    } finally {
      animBusy = false
      animRender()
    }
  }

  function animDownload() {
    if (!animTask || !animTask.result) return
    var prefs = animGetPrefs()
    var base = animBaseName(animTask.name)
    var r = animTask.result
    var fname
    if (animTask.ext === 'zip') fname = base + '_frames_' + r.frames + '.zip'
    else fname = base + '_' + r.w + 'x' + r.h + '.gif'
    var a = document.createElement('a')
    a.href = URL.createObjectURL(r.blob)
    a.download = fname
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    setTimeout(function () {
      URL.revokeObjectURL(a.href)
      if (a.parentNode) a.parentNode.removeChild(a)
    }, 4000)
    return fname
  }

  /* ---------------- 弹层 UI ---------------- */
  function animEnsureUi() {
    if (animUi) return animUi
    animUi = buildAnimDialog()
    addToolExpand(animUi.panel, $('.dash-anim__head', animUi.panel))
    document.body.appendChild(animUi.layer)
    document.addEventListener('keydown', function (e) {
      if (!animUi || animUi.layer.hidden) return
      if (e.key === 'Escape') {
        if (animGuardClose()) animClose()
        return
      }
      if (e.key === 'Tab') animTrapTab(e)
    })
    return animUi
  }

  function animTrapTab(e) {
    if (!animUi) return
    var nodes = Array.prototype.filter.call(
      animUi.panel.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (n) { return !n.disabled && n.offsetParent !== null }
    )
    if (!nodes.length) return
    var first = nodes[0]
    var last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function animGuardClose() {
    if (!animBusy) return true
    return window.confirm('正在转换中，关掉会中断。确定关闭吗？')
  }

  function animClose() {
    if (!animUi || animUi.layer.hidden) return
    animUi.layer.hidden = true
    window.BikoToolElectric?.hide(animUi.layer)
    document.documentElement.classList.remove('is-anim-open')
    window.BikoToolBackground('anim', false)
    var trigger = animUi.trigger
    if (trigger && typeof trigger.focus === 'function' && document.contains(trigger)) trigger.focus({ preventScroll: true })
  }

  function animOpen(trigger) {
    var ui = animEnsureUi()
    animRender()
    ui.trigger = trigger || null
    ui.layer.hidden = false
    document.documentElement.classList.add('is-anim-open')
    window.BikoToolElectric?.show(ui.layer, ui.panel)
    window.BikoToolBackground('anim', true)
    var getEl = $('.dash-anim__get', ui.panel)
    var dropEl = $('.dash-anim__drop', ui.panel)
    if (getEl && !getEl.hidden) getEl.focus()
    else if (dropEl && !dropEl.hidden) dropEl.focus()
  }

  function animRender() {
    if (!animUi) return
    var p = animUi.panel
    var dropEl = $('.dash-anim__drop', p)
    var taskEl = $('.dash-anim__task', p)
    var stateEl = $('.dash-anim__state', p)
    var nameEl = $('.dash-anim__name', p)
    var metaEl = $('.dash-anim__meta', p)
    var barEl = $('.dash-anim__bar > i', p)
    var getEl = $('.dash-anim__get', p)
    var sumEl = $('.dash-anim__sum', p)
    var noteEl = $('.dash-anim__note', p)
    var prefs = animGetPrefs()

    /* 帧图专属设置只在帧图模式出现 */
    Array.prototype.forEach.call(p.querySelectorAll('[data-anim-only="frames"]'), function (n) {
      n.hidden = prefs.mode !== 'frames'
    })
    Array.prototype.forEach.call(p.querySelectorAll('[data-anim-only="gif"]'), function (n) {
      n.hidden = prefs.mode === 'frames'
    })

    if (!animTask) {
      dropEl.hidden = false
      taskEl.hidden = true
      sumEl.textContent = '等待添加'
      return
    }

    dropEl.hidden = animTask.state === 'run' || animTask.state === 'done'
    taskEl.hidden = false
    nameEl.textContent = animTask.name
    getEl.hidden = animTask.state !== 'done'
    noteEl.textContent = animTask.note || ''
    noteEl.hidden = !animTask.note

    var st = animTask.state
    var percent = Math.round((animTask.progress || 0) * 100)
    if (st === 'run') {
      stateEl.textContent = '处理中 ' + percent + '%'
      stateEl.className = 'dash-anim__state is-run'
      barEl.style.width = Math.max(4, percent) + '%'
      metaEl.textContent = animTask.meta
        ? Math.round(animTask.meta.vw) + '×' + Math.round(animTask.meta.vh) + ' · ' + animTask.meta.dur.toFixed(1) + 's'
        : ''
      sumEl.textContent = '正在转换…'
    } else if (st === 'done') {
      var r = animTask.result
      stateEl.textContent = animTask.ext === 'zip' ? '完成' : (r.blob.size <= (parseFloat(prefs.limit) || 5) * 1024 * 1024 ? '完成' : '完成（超限）')
      stateEl.className = 'dash-anim__state is-done'
      barEl.style.width = '100%'
      metaEl.textContent = (animTask.ext === 'zip' ? 'ZIP' : 'GIF') +
        ' · ' + r.w + '×' + r.h + ' · ' + r.frames + (animTask.ext === 'zip' ? ' 张' : ' 帧') +
        ' · ' + animBytes(r.blob.size)
      sumEl.textContent = (animTask.ext === 'zip' ? '帧图 · ' : 'GIF · ') + animBytes(r.blob.size)
    } else {
      stateEl.textContent = '失败'
      stateEl.className = 'dash-anim__state is-error'
      barEl.style.width = '0%'
      metaEl.textContent = ''
      sumEl.textContent = '转换失败'
    }
  }

  function buildAnimDialog() {
    var layer = el('div', 'dash-anim-layer')
    layer.hidden = true
    var dlg = el('div', 'dash-anim')
    dlg.setAttribute('role', 'dialog')
    dlg.setAttribute('aria-modal', 'true')
    dlg.setAttribute('aria-labelledby', 'dash-anim-title')
    dlg.innerHTML =
      '<header class="dash-anim__head">' +
      '  <span class="dash-anim__brand"><i class="fas fa-film" aria-hidden="true"></i><b id="dash-anim-title">动图转换</b></span>' +
      '  <span class="dash-anim__hint">纯本地运算，不上传</span>' +
      '  <button type="button" class="dash-anim__close" aria-label="关闭动图">×</button>' +
      '</header>' +
      '<div class="dash-anim__body">' +
      '  <div class="dash-anim__drop" role="button" tabindex="0" aria-label="选择或拖入视频">' +
      '    <i class="fas fa-file-video" aria-hidden="true"></i>' +
      '    <strong>拖入视频开始转换</strong>' +
      '    <small>MP4 · MOV · WebM，单段最多处理前 30 秒</small>' +
      '    <input type="file" accept="video/*,.mp4,.mov,.m4v,.webm" hidden>' +
      '  </div>' +
      '  <div class="dash-anim__task" hidden>' +
      '    <div class="dash-anim__row">' +
      '      <span class="dash-anim__state">等待</span>' +
      '      <b class="dash-anim__name"></b>' +
      '      <span class="dash-anim__meta"></span>' +
      '      <button type="button" class="dash-anim__get" hidden>下载</button>' +
      '    </div>' +
      '    <div class="dash-anim__bar"><i></i></div>' +
      '    <p class="dash-anim__note" hidden></p>' +
      '  </div>' +
      '  <details class="dash-anim__opts">' +
      '    <summary>更多设置</summary>' +
      '    <div class="dash-anim__grid">' +
      '      <label>输出<select data-anim="mode">' +
      '        <option value="gif">GIF 动图</option>' +
      '        <option value="frames">帧图（ZIP）</option>' +
      '      </select></label>' +
      '      <label data-anim-only="gif">目标体积（MB）<input type="number" min="1" max="20" step="0.5" data-anim="limit"></label>' +
      '      <label data-anim-only="gif">帧率<input type="number" min="4" max="30" step="1" data-anim="fps"></label>' +
      '      <label>宽度<input type="number" min="80" max="720" step="2" data-anim="width" placeholder="原始"></label>' +
      '      <label data-anim-only="frames">帧图数量<input type="number" min="4" max="120" step="1" data-anim="count"></label>' +
      '      <label data-anim-only="frames">帧图格式<select data-anim="imgfmt">' +
      '        <option value="jpg">JPG</option>' +
      '        <option value="png">PNG</option>' +
      '      </select></label>' +
      '    </div>' +
      '  </details>' +
      '</div>' +
      '<footer class="dash-anim__foot">' +
      '  <button type="button" class="dash-anim__add">＋ 添加视频</button>' +
      '  <span class="dash-anim__sum">等待添加</span>' +
      '  <button type="button" class="dash-anim__clear">清空</button>' +
      '</footer>'

    var dropEl = $('.dash-anim__drop', dlg)
    var inputEl = $('.dash-anim input[type="file"]', dlg)

    var prefs = animGetPrefs()
    Array.prototype.forEach.call(dlg.querySelectorAll('[data-anim]'), function (f) {
      var key = f.getAttribute('data-anim')
      if (prefs[key] !== undefined) f.value = prefs[key]
      f.addEventListener('change', function () {
        var patch = {}
        if (key === 'limit') {
          var lim = parseFloat(this.value)
          if (!(lim >= 1)) lim = 5
          patch.limit = String(Math.min(20, Math.max(1, lim)))
          this.value = patch.limit
        } else if (key === 'fps') {
          patch.fps = Math.min(30, Math.max(4, parseInt(this.value, 10) || 12))
          this.value = patch.fps
        } else if (key === 'width') {
          var w = parseInt(this.value, 10)
          patch.width = w >= 80 ? String(Math.min(ANIM_MAX_WIDTH, w)) : ''
          this.value = patch.width
        } else if (key === 'count') {
          patch.count = Math.min(120, Math.max(4, parseInt(this.value, 10) || 24))
          this.value = patch.count
        } else {
          patch[key] = this.value
        }
        animSetPrefs(patch)
        animRender()
      })
    })

    dropEl.addEventListener('click', function () { if (inputEl) inputEl.click() })
    dropEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (inputEl) inputEl.click()
      }
    })
    if (inputEl) {
      inputEl.addEventListener('change', function () {
        var f = this.files && this.files[0]
        this.value = ''
        if (f) animStart(f)
      })
    }
    ;['dragenter', 'dragover'].forEach(function (ev) {
      dlg.addEventListener(ev, function (e) {
        e.preventDefault()
        dropEl.classList.add('is-over')
      })
    })
    ;['dragleave', 'drop'].forEach(function (ev) {
      dlg.addEventListener(ev, function (e) {
        e.preventDefault()
        if (ev === 'dragleave' && dlg.contains(e.relatedTarget)) return
        dropEl.classList.remove('is-over')
      })
    })
    dlg.addEventListener('drop', function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]
      if (f) animStart(f)
    })

    $('.dash-anim__get', dlg).addEventListener('click', animDownload)
    $('.dash-anim__close', dlg).addEventListener('click', function () {
      if (animGuardClose()) animClose()
    })
    $('.dash-anim__add', dlg).addEventListener('click', function () { if (inputEl) inputEl.click() })
    $('.dash-anim__clear', dlg).addEventListener('click', function () {
      if (animBusy && !window.confirm('正在转换中，确定清空吗？')) return
      animTask = null
      animRender()
    })
    layer.addEventListener('click', function (e) {
      if (e.target !== layer) return
      if (animGuardClose()) animClose()
    })

    layer.appendChild(dlg)
    animUi = { layer: layer, panel: dlg }
    return { layer: layer, panel: dlg }
  }

  /* ---------------- ④ 网站信息 ---------------- */

  /* 工具内容填入原占位卡，卡片仍由原网格和高度规则排版。 */
  var toolHostLoading = null
  function openToolWorkspace(name, trigger) {
    if (window.BikoHomeTools) { window.BikoHomeTools.open(name, trigger); return }
    if (!toolHostLoading) toolHostLoading = new Promise(function (resolve, reject) {
      var script = document.createElement('script')
      script.src = '/js/custom/home-tools.js'
      script.onload = resolve
      script.onerror = function () { script.remove(); toolHostLoading = null; reject(new Error('工具加载失败，请重试')) }
      document.head.appendChild(script)
    })
    trigger.disabled = true
    toolHostLoading.then(function () { window.BikoHomeTools.open(name, trigger) }).catch(function (error) {
      window.alert(error.message)
    }).finally(function () { trigger.disabled = false })
  }

  var toolOwners = new Set(), toolBackground = []
  window.BikoToolBackground = function (owner, open) {
    if (open) toolOwners.add(owner); else toolOwners.delete(owner)
    if (toolOwners.size && !toolBackground.length) {
      Array.prototype.forEach.call(document.body.children, function (node) {
        if (node.matches('script,style,link,.dash-compress-layer,.dash-anim-layer,.home-tool-layer')) return
        toolBackground.push([node, !!node.inert]); node.inert = true
      })
    } else if (!toolOwners.size) {
      toolBackground.forEach(function (entry) { entry[0].inert = entry[1] }); toolBackground = []
    }
    document.documentElement.classList.toggle('is-home-tool-open', toolOwners.size > 0)
  }
  function addToolExpand(panel, head) {
    var button = el('button', 'home-tool-expand')
    button.type = 'button'; button.textContent = '展开工作区'; button.setAttribute('aria-pressed', 'false')
    head.insertBefore(button, head.lastElementChild)
    button.onclick = function () {
      var full = panel.classList.toggle('is-expanded')
      button.textContent = full ? '还原窗口' : '展开工作区'; button.setAttribute('aria-pressed', String(full))
      window.BikoToolElectric?.place(panel.parentElement)
    }
  }

  function initToolBookshelf(tools) {
    var track = tools.querySelector('.dash-tools__track')
    var buttons = Array.from(track.querySelectorAll('[data-tool]'))
    var active = -1, point = null, intent = null, touch = null, tap = null, routing = false, keyboard = false, touchMode = false
    // One continuous blue-violet / rose family, without a shared muddy grey tail.
    var tones = [
      ['#485c9b', '#7061a0'], ['#5853a2', '#84619f'],
      ['#6b4ca5', '#986095'], ['#794aa6', '#a35b8e'],
      ['#704fa7', '#925e9b'], ['#5d58a6', '#7e63a1'],
      ['#4b63a0', '#6b6da0']
    ]
    tools.classList.add('is-bookshelf')
    buttons.forEach(function (button, i) {
      var label = button.getAttribute('aria-label')
      var spine = document.createElement('span'), caption = document.createElement('span')
      spine.className = 'dash-book-spine'; caption.className = 'dash-book-caption'
      spine.textContent = caption.textContent = label
      spine.setAttribute('aria-hidden', 'true'); caption.setAttribute('aria-hidden', 'true')
      button.appendChild(spine); button.appendChild(caption)
      button.style.setProperty('--book-top', tones[i % tones.length][0])
      button.style.setProperty('--book-bottom', tones[i % tones.length][1])
    })
    function select(index) { active = index; update() }
    function update() {
      buttons.forEach(function (button, i) {
        button.dataset.open = String(i === active)
      })
    }
    track.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch' || touch) return
      if (point && Math.hypot(event.clientX - point.x, event.clientY - point.y) < 4) return
      point = { x: event.clientX, y: event.clientY }; keyboard = false; tap = null; touchMode = false
      var button = event.target.closest('[data-tool]')
      if (!button) return
      intent = button; select(buttons.indexOf(button))
    })
    track.addEventListener('pointerleave', function () {
      point = null; intent = null
      if (!touchMode && !keyboard) select(-1)
    })
    track.addEventListener('focusin', function (event) {
      // A touch focuses the button before click: do not mistake that for a second tap.
      if (touch || tap) return
      var i = buttons.indexOf(event.target)
      if (i >= 0) { keyboard = event.target.matches(':focus-visible'); select(i) }
    })
    track.addEventListener('focusout', function (event) {
      if (!track.contains(event.relatedTarget)) { keyboard = false; tap = null; intent = null; select(-1) }
    })
    track.addEventListener('pointerdown', function (event) {
      if (event.pointerType !== 'touch') { tap = null; touchMode = false; return }
      touchMode = true
      var target = event.target.closest('[data-tool]')
      touch = { target: target, wasOpen: target === buttons[active], x: event.clientX, y: event.clientY }
      tap = null; intent = null; point = null; keyboard = false
    })
    track.addEventListener('pointerup', function (event) {
      if (!touch) return
      tap = { target: touch.target, wasOpen: touch.wasOpen, moved: Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 12 }
      touch = null
    })
    track.addEventListener('pointercancel', function () { touch = null; tap = null })
    track.addEventListener('click', function (event) {
      var target = event.target.closest('[data-tool]')
      if (!target) return
      if (tap) {
        var firstTap = !tap.wasOpen, moved = tap.moved, tapped = tap.target
        tap = null
        if (moved || firstTap || target !== tapped) {
          event.preventDefault(); event.stopImmediatePropagation()
          if (!moved && tapped) select(buttons.indexOf(tapped))
          return
        }
      }
      // Layout movement under a stationary mouse must not open a neighbouring book.
      if (!routing && event.detail > 0 && intent && target !== intent) {
        event.preventDefault(); event.stopImmediatePropagation(); routing = true
        try { intent.click() } finally { routing = false }
      } else { select(buttons.indexOf(target)) }
    }, true)
    track.addEventListener('keydown', function (event) {
      keyboard = true; intent = null; tap = null
      if (event.key === 'Escape') { event.preventDefault(); select(-1); return }
      var next = event.key === 'ArrowLeft' ? (active < 0 ? buttons.length - 1 : active - 1) : event.key === 'ArrowRight' ? active + 1 : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null
      if (next === null) return
      event.preventDefault(); select((next + buttons.length) % buttons.length); buttons[active].focus({ preventScroll: true })
    })
    var api = { update: update }
    tools._bookshelf = api; update(); return api
  }

  function buildQuickTools() {
    var card = el('section', 'dash-card dash-siteinfo-blank')
    card.setAttribute('aria-label', '随手工具')
    card.innerHTML =
      '<div class="dash-tools">' +
      '  <div class="dash-tools__track" role="group" aria-label="随手工具列表">' +
      '    <button type="button" data-tool="compress" aria-label="图片压缩" title="图片压缩"><i class="fas fa-compress" aria-hidden="true"></i></button>' +
      '    <button type="button" data-tool="images" aria-label="图片工具" title="图片工具"><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i></button>' +
      '    <button type="button" data-tool="anim" aria-label="动图转换" title="动图转换"><i class="fas fa-film" aria-hidden="true"></i></button>' +
      '    <button type="button" data-tool="qrcode" aria-label="二维码" title="二维码"><i class="fas fa-qrcode" aria-hidden="true"></i></button>' +
      '    <button type="button" data-tool="knowledge" aria-label="知识图谱" title="知识图谱"><i class="fas fa-diagram-project" aria-hidden="true"></i></button>' +
      '    <button type="button" data-tool="math" aria-label="原理实验" title="原理实验：函数与磁共振"><i class="fas fa-wave-square" aria-hidden="true"></i></button>' +
      '    <button type="button" data-tool="periodic" aria-label="元素周期表" title="元素周期表"><i class="fas fa-atom" aria-hidden="true"></i></button>' +
      '    <button type="button" data-tool="translate" aria-label="翻译" title="多语翻译"><i class="fas fa-language" aria-hidden="true"></i></button>' +
      '  </div>' +
      '</div>'

    initToolBookshelf($('.dash-tools', card))
    $('[data-tool="compress"]', card).onclick = function () { compressOpen(this) }
    $('[data-tool="anim"]', card).onclick = function () { animOpen(this) }
    ;['images', 'qrcode', 'knowledge', 'math', 'periodic', 'translate'].forEach(function (name) {
      $('[data-tool="' + name + '"]', card).onclick = function () { openToolWorkspace(name, this) }
    })

    return card
  }

  function updateQuickTools() {
    var tools = $('#biko-dashboard .dash-tools')
    if (!tools) return
    if (tools._bookshelf) tools._bookshelf.update()
  }

  function buildSiteInfo() {
    var card = el('section', 'dash-card dash-siteinfo')

    var head = el('div', 'dash-card__head')
    head.appendChild(el('span', null, '<i class="fas fa-info-circle"></i>网站信息'))
    card.appendChild(head)

    var rows = el('div', 'dash-siteinfo__rows')
    rows.id = 'dash-siteinfo-rows'
    rows.setAttribute('data-since', '2025-10-15') // 建站日期
    card.appendChild(rows)

    return card
  }

  /* 建站时长：从主题 footer 里已有的「已运行」节点取不到就自己算。
     起始日期写在 #dash-siteinfo-rows 的 data-since 上（由布局脚本给），
     缺省回落到 2024-01-01，保证永远有东西显示。 */
  function fillSiteInfo() {
    var rows = $('#dash-siteinfo-rows')
    if (!rows) return

    var since = rows.getAttribute('data-since') || '2024-01-01'
    var start = new Date(since)
    var days = Math.floor((Date.now() - start.getTime()) / 86400000)
    if (!isFinite(days) || days < 0) days = 0

    var items = [
      ['已运行', days + ' 天'],
      ['最后更新', new Date().toISOString().slice(0, 10)],
      ['当前页面', '首页']
    ]

    // 有 footer 里的更新时间就用真实的
    var fDate = $('#footer .footer-copyright time, #footer time')
    if (fDate && fDate.textContent.trim()) {
      items[1] = ['最后更新', fDate.textContent.trim().slice(0, 10)]
    }

    rows.innerHTML = ''
    items.forEach(function (pair) {
      var row = el('div', 'dash-siteinfo__row')
      row.appendChild(el('span', 'dash-siteinfo__key', pair[0]))
      row.appendChild(el('span', 'dash-siteinfo__val', pair[1]))
      rows.appendChild(row)
    })
  }

  /* ---------------- ⑤ AI 日报 ---------------- */

  var AI_COLS = [
    { key: 'nmr', label: '核磁共振', icon: 'fas fa-magnet' },
    { key: 'materials', label: '材料 · 科研', icon: 'fas fa-atom' },
    { key: 'design', label: '界面设计', icon: 'fas fa-palette' }
  ]

  /* 折叠态默认「展开」还是「收起」？
     参照站 daily-briefing 初始 aria-expanded=false，点开才渲染列表。
     这里默认收起：AI 日报有三列共 9 条，展开占 ~350px，会把下面内容全推走；
     收起后首屏能一眼看完四行卡片。 */
  var AI_OPEN_BY_DEFAULT = false

  /* 尊重系统的「减少动效」偏好（与参照站 A() 的做法一致）。 */
  function scrollBehavior() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return 'auto'
      }
    } catch (e) {}
    return 'smooth'
  }

  function buildAIReportShell() {
    var card = el('section', 'dash-card dash-ai')

    /* ★ 2026-10 海报化收起态（照抄参考站 daily-briefing）：
       整条是一张 ~206px 高的玻璃海报，背景外链参考站的 GPT 娘图，
       左右渐变遮罩压暗左侧文字区。只有独立的展开/收起按钮控制内容。 */
    var poster = el('div', 'dash-ai__poster')
    var toggle = el('button', 'dash-ai__toggle-right')
    toggle.type = 'button'
    toggle.id = 'dash-ai-toggle'
    toggle.setAttribute('aria-controls', 'dash-ai-grid')
    toggle.setAttribute('aria-expanded', AI_OPEN_BY_DEFAULT ? 'true' : 'false')

    // 背景图（先外链参考站，后期用户换本地化）
    var bg = el('img', 'dash-ai__poster-bg')
    bg.src = 'https://www.xinghuisama.top/images/daily-gpt-girl-banner.png'
    bg.alt = '每日拾光海报'
    bg.loading = 'lazy'
    poster.appendChild(bg)
    poster.appendChild(el('span', 'dash-ai__veil'))

    // 顶部行：DAILY SIGNAL 胶囊 + 日期 + / 每日选刊
    var topRow = el('div', 'dash-ai__poster-top')
    topRow.innerHTML =
      '<span class="dash-ai__tag">DAILY SIGNAL</span>' +
      '<span class="dash-ai__date" id="dash-ai-date"></span>' +
      '<span class="dash-ai__sep">/ 每日选刊</span>'
    poster.appendChild(topRow)

    // 中部标题块
    var titleBlock = el('div', 'dash-ai__poster-title')
    titleBlock.innerHTML =
      '<span class="dash-ai__kicker">每日拾光</span>' +
      '<h2 class="dash-ai__head">NMR 日报 <span class="dash-ai__slash">/</span> 文献雷达</h2>' +
      '<p class="dash-ai__sub">低场核磁 · 生物医学传感的阅读来信</p>'
    poster.appendChild(titleBlock)

    // 底部行：统计 + 未读 + 展开提示 + ＋圆钮
    var bottomRow = el('div', 'dash-ai__poster-bottom')
    bottomRow.innerHTML =
      '<span class="dash-ai__stats">' +
        '<span class="dash-ai__stat">NMR 动态 <b class="dash-ai__num" id="dash-ai-count-1">03</b></span>' +
        '<span class="dash-ai__divider"></span>' +
        '<span class="dash-ai__stat">研究论文 <b class="dash-ai__num" id="dash-ai-count-2">03</b></span>' +
        '<span class="dash-ai__unread"><i></i><span id="dash-ai-unread">6 条未读</span></span>' +
      '</span>'
    toggle.innerHTML = '<span class="dash-ai__expand-hint" id="dash-ai-expand-hint">展开今日选刊</span>' +
      '<span class="dash-ai__plus" aria-hidden="true"></span>'
    bottomRow.appendChild(toggle)
    poster.appendChild(bottomRow)

    card.appendChild(poster)

    /* 展开体：viewport + track（三列在 track 里，viewport 一次显示两列） */
    var body = el('div', 'dash-ai__body')
    body.id = 'dash-ai-grid'

    var viewport = el('div', 'dash-ai__viewport')
    var track = el('div', 'dash-ai__track')

    AI_COLS.forEach(function (col) {
      var box = el('div', 'dash-ai__col')
      box.setAttribute('data-col', col.key)
      box.appendChild(el('div', 'dash-ai__colhead',
        '<i class="' + col.icon + '"></i>' + col.label))
      var ul = el('ul', 'dash-ai__items')
      for (var i = 0; i < 3; i++) {
        var li = el('li', 'dash-ai__item')
        li.appendChild(el('div', 'dash-ai__skel'))
        ul.appendChild(li)
      }
      box.appendChild(ul)
      track.appendChild(box)
    })
    viewport.appendChild(track)
    body.appendChild(viewport)

    // 左右箭头 + 圆点
    var nav = el('div', 'dash-ai__nav')
    nav.innerHTML =
      '<button type="button" class="dash-ai__arrow dash-ai__arrow--prev" aria-label="上一组"><i class="fas fa-chevron-left"></i></button>' +
      '<span class="dash-ai__dots"></span>' +
      '<button type="button" class="dash-ai__arrow dash-ai__arrow--next" aria-label="下一组"><i class="fas fa-chevron-right"></i></button>'
    body.appendChild(nav)

    card.appendChild(body)

    /* 初始态：收起 */
    if (!AI_OPEN_BY_DEFAULT) {
      body.hidden = true
      card.classList.add('is-collapsed')
    }

    // 填今天日期
    var d = new Date()
    var dateEl = document.getElementById('dash-ai-date')
    if (dateEl) {
      dateEl.textContent = d.getFullYear() + '.' +
        String(d.getMonth() + 1).padStart(2, '0') + '.' +
        String(d.getDate()).padStart(2, '0')
    }

    bindAIToggle(toggle, body, card)
    bindAICarousel(track, nav)

    return card
  }

  /* 两列轮播：三列在 track 里，viewport 一次显示两列。
     桌面端两屏：[col1,col2] → [col2,col3]；移动端一次一列，三屏。
     JS 只设 data-page 属性，位移由 CSS 媒体查询负责（桌面/移动不同百分比）。 */
  function bindAICarousel(track, nav) {
    if (!track || !nav) return
    var dots = $('.dash-ai__dots', nav)
    var prev = $('.dash-ai__arrow--prev', nav)
    var next = $('.dash-ai__arrow--next', nav)
    if (!dots || !prev || !next) return

    var page = 0
    /* 三列轮播：每次显示一列，共 3 屏 */
    function totalPages() {
      return 3
    }

    function renderDots() {
      dots.innerHTML = ''
      var tp = totalPages()
      for (var i = 0; i < tp; i++) {
        var dot = el('span', 'dash-ai__dot' + (i === page ? ' active' : ''))
        ;(function (idx) {
          dot.onclick = function () { goTo(idx) }
        })(i)
        dots.appendChild(dot)
      }
    }

    function goTo(p) {
      var tp = totalPages()
      page = ((p % tp) + tp) % tp
      track.setAttribute('data-page', String(page))
      renderDots()
    }

    prev.onclick = function (e) { e.stopPropagation(); goTo(page - 1) }
    next.onclick = function (e) { e.stopPropagation(); goTo(page + 1) }

    track.setAttribute('data-page', '0')
    renderDots()

    // resize 时如果当前页超出新的总屏数，回第 0 页
    window.addEventListener('resize', function () {
      var tp = totalPages()
      if (page >= tp) goTo(0)
      else renderDots()
    })
  }

  /* 展开/收起。用 hidden 属性而不是 max-height 动画：
     · 不需要 JS 量高度，内容异步渲染（骨架屏→真实条目）也不会算错
     · 天然可访问（display:none 会把内容移出无障碍树与 Tab 序列）
     · 零布局抖动，不会出现「动画到一半内容溢出被裁」 */
  function bindAIToggle(toggle, body, card) {
    function sync() {
      var open = toggle.getAttribute('aria-expanded') === 'true'
      body.hidden = !open
      toggle.setAttribute('aria-label', open ? '收起今日选刊' : '展开今日选刊')
      if (card) card.classList.toggle('is-collapsed', !open)
      // ＋ 图标在展开时变成 －（CSS 用 aria-expanded 控制）
    }

    sync()

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true'
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true')
      sync()

      // 切换按钮文字
      var hint = document.getElementById('dash-ai-expand-hint')
      if (hint) {
        hint.textContent = open ? '展开今日选刊' : '收起今日选刊'
      }

      if (open) toggle.focus({ preventScroll: true })
    })
  }


  function renderAIReport(data) {
    var badge = $('#dash-ai-badge')
    var grid = $('#dash-ai-grid')
    if (!grid) return

    var groups = (data && data.groups) || {}
    var authored = !!(data && data.authored)
    var stale = !!(data && data.stale)

    // 状态徽标：区分「AI 生成」「仅标题」「历史缓存」
    if (badge) {
      badge.className = 'dash-ai__badge'
      if (stale) {
        badge.classList.add('is-stale')
        badge.textContent = '缓存快照'
      } else if (authored) {
        badge.classList.add('is-ai')
        badge.textContent = 'AI 生成'
      } else {
        badge.textContent = '仅标题'
      }
      if (data && data.generated) {
        badge.title = '生成于 ' + new Date(data.generated).toLocaleString()
      }
    }

    AI_COLS.forEach(function (col) {
      var box = grid.querySelector('[data-col="' + col.key + '"]')
      if (!box) return
      var ul = $('.dash-ai__items', box)
      if (!ul) return

      var list = (groups[col.key] || []).slice(0, 3)

      ul.innerHTML = ''

      if (!list.length) {
        ul.appendChild(el('li', 'dash-ai__item',
          '<span class="dash-ai__sum" style="opacity:.4">暂无内容</span>'))
        return
      }

      list.forEach(function (it) {
        var li = el('li', 'dash-ai__item')

        // 字段契约来自 tools/daily-report：title / link / summary / source
        var a = el('a', 'dash-ai__title', it.title || '')
        a.href = it.link || '#'
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        if (it.source) a.title = it.source
        li.appendChild(a)

        if (it.summary) {
          li.appendChild(el('div', 'dash-ai__sum', it.summary))
        }
        ul.appendChild(li)
      })
    })
  }

  function loadAIReport() {
    fetch('/data/daily-report.json', { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then(renderAIReport)
      .catch(function () {
        // 产物没生成（比如首次构建前）也不报错，只留空态
        renderAIReport({ groups: {} })
      })
  }

  /* ---------------- 装配 ---------------- */

  /* 把 #recent-posts 还原到 #content-inner 里的原始位置。
     不还原的话，pjax 从别的页回到首页时，主题会重新渲染一个干净的
     #content-inner，而我们的旧节点会被一起丢掉或错位。 */
  function teardown() {
    var old = document.getElementById(MOUNT_ID)
    if (old && old.parentNode) {
      // 先把 #recent-posts 摘出来放回 #content-inner
      var recent = document.getElementById('recent-posts')
      var inner = document.getElementById('content-inner')
      if (recent && inner && inner.contains(old)) {
        inner.insertBefore(recent, old)
      } else if (recent && recent.closest('.dash-slider') && inner) {
        inner.insertBefore(recent, inner.firstChild)
      }
      old.parentNode.removeChild(old)
    }
    // #recent-posts 已经在外面、但挂载点还在（异常中断后重入）：别把它一起删掉
    else if (old && old.parentNode) {
      old.parentNode.removeChild(old)
    }
    /* 玻璃遮罩也要一起拆掉：它挂在 body 上（和 #body-wrap 同级），
       只删 #biko-dashboard 会留下一层 fixed 遮罩压在其它页面上。 */
    var veil = document.getElementById('biko-dash-veil')
    if (veil && veil.parentNode) veil.parentNode.removeChild(veil)

    /* 压图层同样挂在 body 上：离开首页时先关掉，
       否则它会压住别的页面，html 上的滚动锁也会跟着留下去。 */
    compressClose()
    animClose()
    if (window.BikoHomeTools) window.BikoHomeTools.close()

    document.body.classList.remove('home-dashboard')
  }

  /* 关掉首页轮播的滚轮劫持。
     swiper_init.js 里写了 mousewheel: true（插件自带配置，不在本仓库维护范围），
     效果是：光标停在轮播卡片上时，滚轮全被 swiper 吃掉，页面纹丝不动
     —— 用户会以为「点了 CTA 之后页面卡住了」。
     这里在挂载后把实例的 mousewheel 关掉；拿不到实例就退化成一次性事件拦截。 */
  function releaseWheel (root) {
    var done = false
    var tries = 0
    var tryDisable = function () {
      tries++
      var inst = window.swiper
      if (inst && inst.params && inst.mousewheel && typeof inst.mousewheel.disable === 'function') {
        inst.mousewheel.disable()
        if (inst.params) inst.params.mousewheel = false
        done = true
        return true
      }
      return false
    }
    if (tryDisable()) return
    // swiper_init.js 是普通脚本，可能在 dashboard 之后才执行：轮询几次
    var timer = setInterval(function () {
      if (tryDisable() || tries > 20) clearInterval(timer)
    }, 150)
    // 兜底：实例始终拿不到时，直接在轮播区域上放行滚轮
    root.addEventListener('wheel', function (e) {
      if (done) return
      if (e.target && e.target.closest && e.target.closest('.blog-slider, .dash-slider')) {
        // 不 preventDefault，让浏览器按默认行为滚动整页
        e.stopPropagation()
      }
    }, { passive: true })
  }

  /* ---------------- 顶栏几何：让「顶栏底边 → 身份卡顶边」恒等于 --dash-edge ---------------- */

  /* 首页有两条互相拉扯的规则：
       custom_nav.css  → #content-inner.layout { padding-top: 74px }
       home_dashboard.css → body.home-dashboard #content-inner.layout { padding-top: var(--dash-pad-top) }
     后者按「顶栏高度 + 缝隙」算，理论上是 60+24=84。但顶栏高度是响应式的
     （≤768px 54px，窄横屏 46px），而且 custom_nav.css 里 .biko-nav 的 height
     和实际盒高不一定相等（有 border-bottom / 行高拉伸）。
     与其到处写死数字，不如在运行期量一次真实底边，直接把 --dash-pad-top 校正到位：

       padding-top = 顶栏底边 - 版心顶边 + 缝隙

     版心顶边取 getBoundingClientRect().top（首页不滚动时就是 0，滚动后会变小，
     所以这里量的是「文档坐标系」里的差值 = rect.top + scrollY，与滚动无关）。

     ⚠️ 顶栏在首页是滑入的（body.biko-nav-on 之前 translateY(-100%)），
        所以「有没有露脸」用 body.biko-nav-on + 底边 > 1 双重判定；
        没露脸就跳过，等 MutationObserver / scroll 再量（见 mount()）。
     ⚠️ 只在「结果与当前值差 > 0.5px」时才写 DOM，避免每帧 style 抖动。 */
  function __bikoDebugChrome() { return syncChromeVars(true) }

  function syncChromeVars(force) {
    var body = document.body
    var nav = document.getElementById('menu-container')
    var inner = document.getElementById('content-inner')
    if (!body || !nav || !inner) return
    if (!body.classList.contains('home-dashboard')) return

    var navRect = nav.getBoundingClientRect()
    var innerRect = inner.getBoundingClientRect()

    /* ★ 顶栏「缩在屏幕外」不算数：首页欢迎态时 #menu-container 是 translateY(-100%)，
       或者虽然停在 0、但里面 .biko-nav 的高度还没被算出来。
       这两种情况下量到的底边（甚至高度）都是错的，直接跳过。 */
    var navVisible = body.classList.contains('biko-nav-on') && navRect.height > 0 && navRect.bottom > 1
    if (!navVisible) return

    var gap = parseFloat(getComputedStyle(body).getPropertyValue('--dash-edge')) || 24
    // #menu-container 是 fixed 顶栏，rect.bottom 始终是视口坐标（不随滚动变），
    // 不能加 pageYOffset；只有 content-inner 是非 fixed 元素，需要加 pageYOffset 转文档坐标。
    var navBottom = navRect.bottom
    var innerTop = innerRect.top + (window.pageYOffset || 0)
    // padding-top 是「盒顶 → 第一张卡」的那段，正好等于「顶栏底边 → 盒顶」+ 缝隙
    var padTop = navBottom - innerTop + gap
    if (!(padTop > 0)) return

    /* ★ 只写 --dash-pad-top，不碰 --dash-nav-h：
       --dash-nav-h 还会喂给别的地方（顶栏高度本身），改了容易自我放大。
       这里量到的 padTop 就是「顶栏底边 → 第一张卡」的净距离，直接落到 CSS 变量上。 */
    var cur = parseFloat(getComputedStyle(body).getPropertyValue('--dash-pad-top'))
    if (isFinite(cur) && Math.abs(cur - padTop) < 0.5) return
    body.style.setProperty('--dash-pad-top', padTop.toFixed(2) + 'px')
  }

  function mount() {
    if (!isIndexPage()) return

    var inner = document.getElementById('content-inner')
    var recent = document.getElementById('recent-posts')
    if (!inner || !recent) return

    // 幂等：已经装过就不重复插
    if (document.getElementById(MOUNT_ID)) return

    document.body.classList.add('home-dashboard')

    /* --- L1 全屏压暗层 ---
       ★ 只负责「把背景压下去」，不负责版心形状：参照站的全屏层就是一个
         铺满视口的矩形，卡片之间的缝隙里看到的是背景板，不是玻璃。
       所以这里既不需要 absolute，也不需要 JS 喂宽高 —— 全屏 fixed 即可。
       ★ 挂载位置：body 的直接子元素，排在 #body-wrap 之后（= 最后）。
         ⚠️ 曾经挂在 #content-inner 里。问题是 #content-inner 上有
            isolation: isolate，会把它变成一个层叠上下文 + 裁剪盒：
              · 它的 fixed 子元素只在 #content-inner 的盒子（版心，1152 宽）内绘制，
                顶栏两侧和页脚之外的区域根本没有遮罩（实测 1440 下每侧空出 ~87px，
                浅色主题那里是纯白、深色是近黑）；
              · 页脚 #footer 是 #body-wrap 的子元素、不在 #content-inner 里，
                于是页脚落在遮罩【之外】，玻璃卡片与缝隙的色调对不上。
         挂到 body 上以后，fixed inset:0 才是真正的「整个视口」。
         层级不变：遮罩 z-index 2、卡片 z-index 110，遮罩依旧在卡片下面；
         它排在 #body-wrap 之后，同层级时也压在版心与页脚内容之上。
         顶栏 #menu-container 是 z-index 10（--z-nav），仍然盖在遮罩上面。

       pointer-events:none 保证永远不挡点击。 */
    var veil = document.getElementById('biko-dash-veil')

    var root = el('div')
    root.id = MOUNT_ID

    /* --- 行 1：身份带 | 历史上的今天 --- */
    var row1 = el('div', 'dash-row dash-row--1')
    var identity = buildIdentity()
    if (identity) row1.appendChild(identity)
    row1.appendChild(buildHistoryShell())
    root.appendChild(row1)

    /* --- 行 2-3 合并区：左侧文章卡 + 下方信息卡/日历卡，右侧天气卡（贯穿两行） --- */
    var row23 = el('div', 'dash-row dash-row--23')

    // 左上方：swiper 文章卡
    var slider = el('div', 'dash-card dash-slider')
    slider.appendChild(recent)
    row23.appendChild(slider)

    // 右上方：天气卡片（跨两行）
    row23.appendChild(buildWeatherShell())

    // 左下方：随手工具与网站信息；右侧是工作日历
    var bottomLeft = el('div', 'dash-bottom-left')
    var infoCol = el('div', 'dash-bottom-left__col')
    infoCol.appendChild(buildQuickTools())
    infoCol.appendChild(buildSiteInfo())
    bottomLeft.appendChild(infoCol)
    bottomLeft.appendChild(buildCalendarShell())
    row23.appendChild(bottomLeft)

    root.appendChild(row23)

    /* --- 行 4：AI 日报（整宽） --- */
    var row4 = el('div', 'dash-row dash-row--4')
    row4.appendChild(buildAIReportShell())
    root.appendChild(row4)

    // 插到 #content-inner 最前面，原来的 aside 由 CSS 隐藏
    inner.insertBefore(root, inner.firstChild)
    updateQuickTools()

    /* 遮罩挂在 body 上、排在 #body-wrap 之后（即 body 的最后一个子元素）。
       顺序决定层叠：同层级时后出现的压在上面，所以遮罩必须排在 #body-wrap 之后；但它 z-index 2，仍低于卡片的 110，卡片依旧在最上层。不要改回 inner.appendChild —— 那会重新落进 #content-inner 的 isolation 裁剪盒。 */
    if (!veil) {
      veil = el('div', 'dash-veil')
      veil.id = 'biko-dash-veil'
      veil.setAttribute('aria-hidden', 'true')
    }
    if (veil.parentNode !== document.body) document.body.appendChild(veil)

    // 签名条的宽度依赖真实排版，挂载 + 字体就绪后各量一次
    refreshSignatures()
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(refreshSignatures)
    }

    /* 顶栏缝隙：上面 CSS 已经给出「顶栏高度 + 24px」的理论值（--dash-pad-top），
       这里再按真实盒高量一次并校正。字体/顶栏脚本都可能晚于本次 mount 就位，
       所以分几拍补量（顶栏是 fixed，晚到一步就会被算成 0）。 */
    syncChromeVars()
    ;[120, 400, 1200].forEach(function (ms) { setTimeout(syncChromeVars, ms) })
    /* 顶栏只在「进入了仪表盘」之后才滑下来（custom_nav.css 的 body.biko-nav-on），
       所以挂载那一刻它通常还在屏幕外 —— 量不到。这里同时监听类名变化与滚动，
       等它真正露面后的第一帧再校正一次。 */
    if (!window.__bikoDashNavWatch) {
      window.__bikoDashNavWatch = true
      var navSync = function () { syncChromeVars() }
      window.addEventListener('scroll', navSync, { passive: true })
      if (window.MutationObserver) {
        new MutationObserver(navSync).observe(document.body, { attributes: true, attributeFilter: ['class'] })
      }
    }

    // 轮播不能吃掉页面滚轮（否则停在卡片上时整个首页像卡死）
    releaseWheel(root)

    // 开始填数据
    try {
      fillSiteInfo()
      loadHistory()
      loadAIReport()
    } catch (e) {
      // 数据层出错不影响骨架，静默
      if (window.console && console.warn) console.warn('[dashboard]', e)
    }

    /* 视口变化时重算「历史上的今天」的分页，并重新量签名。
     ⚠️ 只注册一次：pjax 来回切换会反复 mount，重复注册会让监听器越积越多。 */
    if (!window.__bikoDashResize) {
      var t = null
      window.__bikoDashResize = function () {
        if (t) clearTimeout(t)
        t = setTimeout(function () {
          t = null
          if (!document.getElementById(MOUNT_ID)) return
          syncChromeVars()
          refreshSignatures()
          repaginate()
          updateQuickTools()
        }, 180)
      }
      window.addEventListener('resize', window.__bikoDashResize)
    }
  }

  /* pjax 来回切换时先拆后装，避免叠加。
     ⚠️ 幂等保护（踩过的坑）：
     DOMContentLoaded 与 pjax:complete 在同一生命周期里可能触发多次
     （Butterfly 首次进入会同时触发两者；某些环境 DOMContentLoaded 还会补发）。
     若不拦截，后一次 boot 会先 teardown 拆掉刚建好的布局，随后因
     #recent-posts 已被搬进旧容器而重建失败 → 首页白屏。

     状态存在 DOM 上（documentElement 的 dataset）而不是闭包变量里：
     这样即使脚本被重复 eval / 包裹在别的执行上下文里，判定依然成立。 */
  function boot() {
    var here = location.pathname + location.search
    var root = document.documentElement
    var installedAt = root.getAttribute('data-dash-at')
    var stillThere = !!document.getElementById(MOUNT_ID)

    // 同路径 + 挂载点健在 → 重复事件，什么都不做
    if (installedAt === here && stillThere) return

    try {
      teardown()
      root.removeAttribute('data-dash-at')
      mount()
      if (document.getElementById(MOUNT_ID)) {
        root.setAttribute('data-dash-at', here)
      }
    } catch (e) {
      root.removeAttribute('data-dash-at')
      // 兜底：哪怕 dashboard 挂了也要把原页面还原成可看状态
      document.body.classList.remove('home-dashboard')
      if (window.console && console.warn) console.warn('[dashboard] mount failed', e)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }

  // Butterfly 用 pjax 做无刷新跳转，页面切换后要重跑
  document.addEventListener('pjax:complete', boot)
})()



