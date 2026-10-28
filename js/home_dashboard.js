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
  var HISTORY_CATS = [
    '古代东方政治', '古代东方经济',
    '古代西方政治', '古代西方经济',
    '近现代东方政治', '近现代东方经济',
    '近现代西方政治', '近现代西方经济',
    '现代东方政治', '现代东方经济',
    '现代西方政治', '现代西方经济'
  ]

  function classifyHistory(ev) {
    var y = yearNum(ev.year)
    var era = y < 1500 ? '古代' : (y < 1945 ? '近现代' : '现代')
    var t = (ev.description || '').toLowerCase()
    var eastKw = ['china', 'chinese', 'japan', 'japanese', 'korea', 'korean', 'vietnam', 'mongol', 'mughal', 'ottoman', 'persian', 'arab', 'islamic', 'india', 'indian', 'delhi', 'taj', 'ming', 'qing', 'song', 'tang']
    var econKw = ['trade', 'market', 'bank', 'currency', 'industry', 'company', 'stock', 'gold', 'oil', 'economy', 'economic', 'commercial', 'merchant', 'tax', 'tariff', 'finance']
    var isEast = eastKw.some(function (k) { return t.indexOf(k) >= 0 })
    var isEcon = econKw.some(function (k) { return t.indexOf(k) >= 0 })
    return era + (isEast ? '东方' : '西方') + (isEcon ? '经济' : '政治')
  }

  function openHistoryModal() {
    /* 拉当天全部事件（byabbe.se 一次返回全部，不需要分页） */
    var d = new Date()
    var mm = String(d.getMonth() + 1).padStart(2, '0')
    var dd = String(d.getDate()).padStart(2, '0')

    /* 遮罩 */
    var overlay = el('div', 'history-modal-overlay')
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) document.body.removeChild(overlay)
    })

    var dialog = el('div', 'history-modal')
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')

    var head = el('div', 'history-modal__head')
    head.appendChild(el('h3', null, '历史上的今天 · ' + (d.getMonth() + 1) + '月' + dd + '日'))
    var closeBtn = el('button', 'history-modal__close')
    closeBtn.type = 'button'
    closeBtn.innerHTML = '<i class="fas fa-times"></i>'
    closeBtn.addEventListener('click', function () { document.body.removeChild(overlay) })
    head.appendChild(closeBtn)
    dialog.appendChild(head)

    var chips = el('div', 'history-modal__chips')
    chips.innerHTML = '<button type="button" class="history-modal__chip active" data-cat="全部">全部</button>'
    HISTORY_CATS.forEach(function (c) {
      chips.innerHTML += '<button type="button" class="history-modal__chip" data-cat="' + c + '">' + c + '</button>'
    })
    dialog.appendChild(chips)

    var list = el('div', 'history-modal__list')
    list.innerHTML = '<div class="history-modal__loading">加载中…</div>'
    dialog.appendChild(list)

    overlay.appendChild(dialog)
    document.body.appendChild(overlay)

    fetch('https://api.wikimedia.org/feed/v1/wikipedia/zh/onthisday/all/' + mm + '/' + dd, {
      headers: { 'Api-User-Agent': 'BikoBlog/1.0' }
    })
      .then(function (r) { return r.json() })
      .then(function (json) {
        var events = (json && json.events) || []
        var mapped = events.map(function (ev) {
          return { year: ev.year, description: window.ZhHistory ? window.ZhHistory.t2s(ev.text || '') : (ev.text || '') }
        })
        list.innerHTML = ''
        if (!mapped.length) {
          list.innerHTML = '<div class="history-modal__empty">今日暂无数据</div>'
          return
        }
        renderHistoryModalList(mapped, '全部', list)
        chips.addEventListener('click', function (e) {
          var btn = e.target.closest('.history-modal__chip')
          if (!btn) return
          chips.querySelectorAll('.history-modal__chip').forEach(function (c) { c.classList.remove('active') })
          btn.classList.add('active')
          renderHistoryModalList(mapped, btn.dataset.cat, list)
        })
      })
      .catch(function () {
        list.innerHTML = '<div class="history-modal__empty">加载失败</div>'
      })
  }

  function renderHistoryModalList(events, cat, listEl) {
    var filtered = cat === '全部' ? events : events.filter(function (ev) {
      return classifyHistory(ev) === cat
    })
    filtered.sort(function (a, b) { return yearNum(b.year) - yearNum(a.year) })
    listEl.innerHTML = ''
    filtered.forEach(function (ev) {
      var row = el('div', 'history-modal__row')
      row.innerHTML = '<span class="history-modal__year">' + ev.year + '</span>' +
        '<span class="history-modal__desc">' + (ev.description || '') + '</span>' +
        '<span class="history-modal__cat">' + classifyHistory(ev) + '</span>'
      listEl.appendChild(row)
    })
  }

  /* ---------------- ③.5 天气卡片 ---------------- */

  function buildWeatherShell() {
    var card = el('section', 'dash-card dash-weather')
    card.innerHTML =
      '<div class="dash-weather__head">' +
      '  <span class="dash-weather__city"><i class="fas fa-map-marker-alt"></i>南京市</span>' +
      '  <button class="dash-weather__loc"><i class="fas fa-crosshairs"></i>精确定位</button>' +
      '</div>' +
      '<div class="dash-weather__main">' +
      '  <div class="dash-weather__temp">--°</div>' +
      '  <div class="dash-weather__icon"><i class="fas fa-cloud-sun"></i></div>' +
      '</div>' +
      '<div class="dash-weather__desc">定位中...</div>' +
      '<div class="dash-weather__range">最高--° · 最低--°</div>' +
      '<div class="dash-weather__hourly">' +
      '  <div class="dash-weather__hour"><div class="dash-weather__hour-label">现在</div><div class="dash-weather__hour-icon">--</div><div class="dash-weather__hour-temp">--°</div></div>' +
      '  <div class="dash-weather__hour"><div class="dash-weather__hour-label">1小时</div><div class="dash-weather__hour-icon">--</div><div class="dash-weather__hour-temp">--°</div></div>' +
      '  <div class="dash-weather__hour"><div class="dash-weather__hour-label">2小时</div><div class="dash-weather__hour-icon">--</div><div class="dash-weather__hour-temp">--°</div></div>' +
      '  <div class="dash-weather__hour"><div class="dash-weather__hour-label">3小时</div><div class="dash-weather__hour-icon">--</div><div class="dash-weather__hour-temp">--°</div></div>' +
      '</div>' +
      '<div class="dash-weather__stats">' +
      '  <div class="dash-weather__stat"><i class="fas fa-thermometer-half"></i>体感 <span>--°</span></div>' +
      '  <div class="dash-weather__stat"><i class="fas fa-tint"></i>湿度 <span>--%</span></div>' +
      '  <div class="dash-weather__stat"><i class="fas fa-wind"></i>风速 <span>-- km/h</span></div>' +
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

    // 文章日期数据（从 JSON 文件加载）
    var postDates = {}

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
        console.log('加载文章日期失败', e)
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

        // 有文章的日期加小点
        var dateKey = viewYear + '-' + (viewMonth + 1) + '-' + d
        if (postDates[dateKey]) {
          dayEl.classList.add('has-post')
        }

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
      render()
    })

    nextBtn.addEventListener('click', function() {
      viewMonth++
      if (viewMonth > 11) {
        viewMonth = 0
        viewYear++
      }
      render()
    })

    // 年月下拉切换
    yearSelect.addEventListener('change', function() {
      viewYear = parseInt(this.value)
      render()
    })

    monthSelect.addEventListener('change', function() {
      viewMonth = parseInt(this.value)
      render()
    })

    // 初始渲染
    render()
  }

  /* ---------------- ④ 网站信息 ---------------- */

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
       左右渐变遮罩压暗左侧文字区。点海报任意位置开合。 */
    var toggle = el('button', 'dash-ai__poster')
    toggle.type = 'button'
    toggle.id = 'dash-ai-toggle'
    toggle.setAttribute('aria-controls', 'dash-ai-grid')
    toggle.setAttribute('aria-expanded', AI_OPEN_BY_DEFAULT ? 'true' : 'false')

    // 背景图（先外链参考站，后期用户换本地化）
    var bg = el('img', 'dash-ai__poster-bg')
    bg.src = 'https://www.xinghuisama.top/images/daily-gpt-girl-banner.png'
    bg.alt = '每日拾光海报'
    bg.loading = 'lazy'
    toggle.appendChild(bg)
    toggle.appendChild(el('span', 'dash-ai__veil'))

    // 顶部行：DAILY SIGNAL 胶囊 + 日期 + / 每日选刊
    var topRow = el('div', 'dash-ai__poster-top')
    topRow.innerHTML =
      '<span class="dash-ai__tag">DAILY SIGNAL</span>' +
      '<span class="dash-ai__date" id="dash-ai-date"></span>' +
      '<span class="dash-ai__sep">/ 每日选刊</span>'
    toggle.appendChild(topRow)

    // 中部标题块
    var titleBlock = el('div', 'dash-ai__poster-title')
    titleBlock.innerHTML =
      '<span class="dash-ai__kicker">每日拾光</span>' +
      '<h2 class="dash-ai__head">NMR 日报 <span class="dash-ai__slash">/</span> 文献雷达</h2>' +
      '<p class="dash-ai__sub">低场核磁 · 生物医学传感的阅读来信</p>'
    toggle.appendChild(titleBlock)

    // 底部行：统计 + 未读 + 展开提示 + ＋圆钮
    var bottomRow = el('div', 'dash-ai__poster-bottom')
    bottomRow.innerHTML =
      '<span class="dash-ai__stats">' +
        '<span class="dash-ai__stat">NMR 动态 <b class="dash-ai__num" id="dash-ai-count-1">03</b></span>' +
        '<span class="dash-ai__divider"></span>' +
        '<span class="dash-ai__stat">研究论文 <b class="dash-ai__num" id="dash-ai-count-2">03</b></span>' +
        '<span class="dash-ai__unread"><i></i><span id="dash-ai-unread">6 条未读</span></span>' +
      '</span>' +
      '<span class="dash-ai__toggle-right">' +
        '<span class="dash-ai__expand-hint" id="dash-ai-expand-hint">展开今日选刊</span>' +
        '<span class="dash-ai__plus" aria-hidden="true"></span>' +
      '</span>'
    toggle.appendChild(bottomRow)

    card.appendChild(toggle)

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

      /* 收起后内容消失，用户很可能正停在页面底部一片空白处。
         把焦点和视口送回卡片。 */
      if (open) {
        toggle.focus({ preventScroll: true })
        if (toggle.scrollIntoView) {
          toggle.scrollIntoView({ behavior: scrollBehavior(), block: 'center' })
        }
      } else {
        // 展开后自动滚动，让内容完全显示在屏幕中
        var grid = document.getElementById('dash-ai-grid')
        if (grid && grid.scrollIntoView) {
          setTimeout(function () {
            grid.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
          }, 300)
        }
      }
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

    // 左下方：网站信息卡 + 工作日历卡
    var bottomLeft = el('div', 'dash-bottom-left')
    bottomLeft.appendChild(buildSiteInfo())
    bottomLeft.appendChild(buildCalendarShell())
    row23.appendChild(bottomLeft)

    root.appendChild(row23)

    /* --- 行 4：AI 日报（整宽） --- */
    var row4 = el('div', 'dash-row dash-row--4')
    row4.appendChild(buildAIReportShell())
    root.appendChild(row4)

    // 插到 #content-inner 最前面，原来的 aside 由 CSS 隐藏
    inner.insertBefore(root, inner.firstChild)

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



