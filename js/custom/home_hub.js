/* ============================================================
 * Biko · 个性化首屏 Home Hub
 * 仅首页显示。可见性跟随滚动：顶部显示 / 下滚隐藏 / 回顶部重现；CTA 进入正文。
 * ============================================================ */
(function () {
  var START = new Date(2025, 9, 15, 0, 0, 0) // 建站 2025-10-15 本地 0 点
  var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  // 当前首屏节点；可见性跟随首页滚动位置（顶部显示 / 下滚隐藏 / 回顶重现）
  var currentHub = null
  function setHubVisible(hub, v) {
    if (!hub) return
    if (v) { hub.classList.remove('leaving'); hub.classList.add('show') }
    else { hub.classList.remove('show'); hub.classList.add('leaving') }
  }
  // 顶栏编排：仅切换 body.biko-nav-on；具体显示由 custom_nav.css 的 #menu-container 规则完成
  function applyNav(on) {
    document.body.classList.toggle('biko-nav-on', !!on)
  }
  // 首页标记：供不支持 :has() 的浏览器兜底（见 custom_nav.css / home_hub.css 的 @supports）
  function markHome(on) {
    document.body.classList.toggle('biko-home', !!on)
  }
  function syncNav(y) {
    if (!isHome()) return
    if (y <= 8) applyNav(false)
    else if (y > 12) applyNav(true)
  }
  // 首次下滚吸附：从欢迎态第一次下滚等同点 CTA，自动补到安全落点
  var entered = false
  // 是否已经「落进」仪表盘（点过 CTA 或从欢迎态下滚过）。
  // 一旦落地就不再回到欢迎页 —— 和站内其它页面的「回到顶部」一致：
  // 上箭头 / 滚到顶部只要求回到本页内容的最上方，而不是把用户退回首屏。
  var landed = false
  var currentEnter = null
  var currentScrollTop = null
  var rafPending = false
  // 滚动/尺寸变化时统一校正：以真实 scrollY 为准，避免滚动同步丢失导致
  // #biko-hub（z-index:200000）残留 .show 遮住正文
  function syncHubByScroll() {
    if (!isHome()) return
    var y = window.scrollY
    if (currentHub) {
      if (y <= 8) {
        entered = false
        // 只有「还没走进仪表盘」的初始状态才重现欢迎页；
        // 落地后回到顶部 = 停在仪表盘最上方（见 home_dashboard.css 的 --dash-pad-top）
        if (!landed) setHubVisible(currentHub, true)
      } else {
        setHubVisible(currentHub, false)
        if (!entered) { entered = true; if (currentEnter) currentEnter() }
      }
    }
    syncNav(y)
  }
  // rAF 节流，兜住滚动事件丢失 / 锚点跳转 / 恢复滚动位置等场景
  function scheduleSync() {
    if (rafPending) return
    rafPending = true
    var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16) }
    raf(function () { rafPending = false; syncHubByScroll() })
  }
  window.addEventListener('scroll', scheduleSyncAndFallback, { passive: true })
  window.addEventListener('resize', scheduleSyncAndFallback, { passive: true })
  window.addEventListener('pageshow', scheduleSyncAndFallback)
  document.addEventListener('scroll', scheduleSyncAndFallback, { passive: true, capture: true })

  // ------------------------------------------------------------
  // 兜底校正：原先是一个常驻 setInterval(1000ms) 永不停止的轮询
  // （页面开着就每秒空转，移动端耗电）。改为「空闲 5s 后才校正一次」的
  // 一次性 setTimeout：任何一次 scroll/resize/pageshow 都会重置它，
  // 只有真正静下来 5 秒才触发，且页面隐藏时直接放弃。
  // 效果不变（仍能自愈滚动事件丢失导致的 hub 残留遮挡），但不再常驻。
  // ------------------------------------------------------------
  var idleTimer = null
  function cancelFallback() {
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null }
  }
  function scheduleFallback() {
    cancelFallback()
    idleTimer = setTimeout(function () {
      idleTimer = null
      if (document.hidden) return            // 切走/最小化时不干活
      if (!currentHub || !isHome()) return
      syncHubByScroll()
    }, 5000)
  }
  function scheduleSyncAndFallback() {
    scheduleSync()
    scheduleFallback()
  }
  // 页面恢复可见时补一次校正（等价于切回来重新兜底）
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) scheduleSyncAndFallback()
  })

  // 供 CTA / 其它逻辑手动触发一次校正；触发时同步续期兜底
  window.__bikoSyncHub = scheduleSyncAndFallback

  function isHome() {
    if (document.body.classList.contains('home')) return true
    var p = location.pathname.replace(/index\.html$/, '')
    return p === '/' || p === ''
  }
  function pad(n) { return (n < 10 ? '0' : '') + n }
  function rand(min, max) { return min + Math.random() * (max - min) }

  function uptimeText() {
    var n = new Date()
    var months = (n.getFullYear() - START.getFullYear()) * 12 + (n.getMonth() - START.getMonth())
    var anchor = new Date(START)
    anchor.setMonth(START.getMonth() + months)
    if (anchor > n) { months--; anchor = new Date(START); anchor.setMonth(START.getMonth() + months) }
    var ms = n - anchor
    var days = Math.floor(ms / 86400000); ms -= days * 86400000
    var hours = Math.floor(ms / 3600000); ms -= hours * 3600000
    var mins = Math.floor(ms / 60000); ms -= mins * 60000
    var secs = Math.floor(ms / 1000)
    return months + ' 个月 ' + days + ' 天 ' + hours + ' 小时 ' + mins + ' 分 ' + secs + ' 秒'
  }

  function spawnFall(layer) {
    var mobile = window.innerWidth <= 768
    var starCount = mobile ? 16 : 30
    var bubbleCount = mobile ? 8 : 15
    var i, el
    for (i = 0; i < starCount; i++) {
      el = document.createElement('span')
      el.className = 'biko-star'
      var size = rand(1, 3)
      el.style.width = size + 'px'
      el.style.height = size + 'px'
      el.style.left = rand(0, 100) + '%'
      el.style.animationDuration = rand(9, 22) + 's, ' + rand(2, 4.5) + 's'
      el.style.animationDelay = rand(0, 16) + 's, ' + rand(0, 4) + 's'
      layer.appendChild(el)
    }
    for (i = 0; i < bubbleCount; i++) {
      el = document.createElement('span')
      el.className = 'biko-bubble'
      var bs = rand(8, 30)
      el.style.width = bs + 'px'
      el.style.height = bs + 'px'
      el.style.left = rand(0, 100) + '%'
      el.style.animationDuration = rand(11, 26) + 's'
      el.style.animationDelay = rand(0, 20) + 's'
      layer.appendChild(el)
    }
  }

  // ------------------------------------------------------------
  // 拆解旧 hub：必须把本实例自己注册的定时器与 window 级监听器全部卸掉。
  // 为什么必须显式卸：build() 会在每次 pjax:complete 重跑，而 placeEars /
  // 秒表 tick 都是闭包内新建的函数引用与新计时器——
  //   - addEventListener 对新引用无法去重 → resize 监听器会逐次累积；
  //   - setInterval 闭包持有已从 DOM 移除的节点 → 节点无法回收，
  //     且每秒仍在算 Date 并写若干已脱离文档的节点，纯属空转。
  // 旧版只 clearInterval 了 _bikoTimer，漏掉了 resize 监听，故补全。
  // ------------------------------------------------------------
  function teardownHub(hub) {
    if (!hub) return
    if (hub._bikoTimer) { clearInterval(hub._bikoTimer); hub._bikoTimer = null }
    if (hub._bikoPlaceEars) {
      window.removeEventListener('resize', hub._bikoPlaceEars)
      hub._bikoPlaceEars = null
    }
    if (hub.parentNode) hub.parentNode.removeChild(hub)
  }

  function build() {
    teardownHub(document.getElementById('biko-hub'))
    // 拆掉旧 hub 时同时取消待执行的兜底校正，避免 pjax 换页后叠加
    cancelFallback()
    currentHub = null
    currentEnter = null
    currentScrollTop = null
    // 换页（含 pjax 回首页）一律退回「欢迎态」：landed 是单次访问内的状态，
    // 不能跨页面残留，否则从内页返回首页会直接看到仪表盘、首屏被跳过。
    landed = false
    entered = false
    // 首页标记要在 isHome() 早退之前写入，供 :has() 兜底规则使用
    markHome(isHome())
    if (!isHome()) return

    var hub = document.createElement('div')
    hub.id = 'biko-hub'
    hub.setAttribute('role', 'dialog')
    hub.setAttribute('aria-label', '欢迎来到 Biko 的个人小站')
    hub.innerHTML =
      '<div class="biko-hub-bg"></div>' +
      '<div class="biko-hub-fall"></div>' +
      '<div class="biko-hub-inner">' +
        '<span class="biko-pill"><i class="fas fa-cat"></i>很高兴在这里遇见你</span>' +
        '<h1 class="biko-hub-title">Biko<span class="biko-heart">♡</span></h1>' +
        '<div class="biko-hub-sub">的个人小站</div>' +
        '<div class="biko-hub-clock">' +
          '<span class="biko-ear biko-ear-l"></span><span class="biko-ear biko-ear-r"></span>' +
          '<span class="biko-time-box" id="bh-hh">00</span><span class="biko-colon">:</span>' +
          '<span class="biko-time-box" id="bh-mm">00</span><span class="biko-colon">:</span>' +
          '<span class="biko-time-box" id="bh-ss">00</span>' +
        '</div>' +
        '<div class="biko-hub-date"><span id="bh-date"></span><span class="biko-weekday" id="bh-week"></span></div>' +
        '<span class="biko-pill"><i class="fas fa-star"></i>小站已经陪你走过<b id="bh-uptime"></b></span>' +
        '<p class="biko-hub-tagline">把问题写清楚，也把生活慢慢记下</p>' +
        '<button class="biko-hub-cta" id="bh-cta" type="button">翻开我的小世界 <i class="fas fa-arrow-down"></i></button>' +
      '</div>'
    document.body.appendChild(hub)
    spawnFall(hub.querySelector('.biko-hub-fall'))

    var hh = hub.querySelector('#bh-hh')
    var mm = hub.querySelector('#bh-mm')
    var ss = hub.querySelector('#bh-ss')
    var dateEl = hub.querySelector('#bh-date')
    var weekEl = hub.querySelector('#bh-week')
    var upEl = hub.querySelector('#bh-uptime')

    // 猫耳定位：把左右耳对齐到真实的时分/秒盒子两端，而不是猜 calc(50%±34px)。
    // 字号、浏览器缩放、数字宽度变化时都能贴住，不会跑偏。
    var clockEl = hub.querySelector('.biko-hub-clock')
    function placeEars() {
      if (!clockEl) return
      var boxes = clockEl.querySelectorAll('.biko-time-box')
      if (boxes.length < 3) return
      var clockRect = clockEl.getBoundingClientRect()
      if (!clockRect.width) return
      var first = boxes[0].getBoundingClientRect()
      var last = boxes[2].getBoundingClientRect()
      // 耳朵中心对准第 1 / 第 3 个时间盒的约 1/4 与 3/4 处
      var earW = parseFloat(getComputedStyle(clockEl).fontSize) * 0.27 || 12
      // 整体左移 10px：左耳、右耳都减同一个量，两只耳朵一起平移、间距不变。
      // 若只改其中一只，间距就会变（会看出左右不对称），所以务必用同一个 EAR_SHIFT。
      var EAR_SHIFT = 10
      var l = (first.left - clockRect.left) + first.width * 0.25 - earW - EAR_SHIFT
      var r = (last.left - clockRect.left) + last.width * 0.75 - earW - EAR_SHIFT
      clockEl.style.setProperty('--bh-ear-l', Math.round(l) + 'px')
      clockEl.style.setProperty('--bh-ear-r', Math.round(r) + 'px')
    }
    placeEars()
    window.addEventListener('resize', placeEars, { passive: true })
    // 字体加载完成后宽度会变，重新贴一次
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(placeEars).catch(function () {})
    }
    hub._bikoPlaceEars = placeEars

    function tick() {
      var d = new Date()
      hh.textContent = pad(d.getHours())
      mm.textContent = pad(d.getMinutes())
      ss.textContent = pad(d.getSeconds())
      dateEl.textContent = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'
      weekEl.textContent = WEEK[d.getDay()]
      upEl.textContent = uptimeText()
    }
    tick()
    // hub 秒表：页面隐藏时靠 tick 内部门控短路（不写 DOM、不重排），
    // 切回来立刻补一次，避免切走期间显示停留在旧值。
    // 注意：这个 setInterval 必须在 teardownHub 里 clearInterval，
    // 否则 pjax 换页后旧计时器会持有已移除的节点持续空转。
    hub._bikoTimer = setInterval(function () {
      if (document.hidden) return
      tick()
    }, 1000)
    if (!document.__bikoHubVisibilityBound) {
      document.__bikoHubVisibilityBound = true
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) return
        if (currentHub && currentHub.isConnected && currentHub._bikoTick) currentHub._bikoTick()
      })
    }
    hub._bikoTick = tick
    currentHub = hub

    function pageYOf(el) {
      var r = el.getBoundingClientRect()
      return Math.round(r.top + window.scrollY)
    }

    // 顶栏高度与留白：落点固定为「内容区上缘」，即 #content-inner 的 --dash-pad-top（76px）。
    // 不能用 #recent-posts 的文档坐标再减一次 74px —— 它现在是首行卡片里的子节点，
    // 减一次会把整块仪表盘推到视口外（被顶栏盖住、看起来像空白页）。
    var NAV_H = 60
    var GAP = 14
    function dashTop() {
      // 首页内容起点就是 #biko-dashboard（#content-inner 的第一个子元素）；
      // 主题里没有 dashboard 时退回到 #content-inner / #content。
      var root = document.getElementById('biko-dashboard') ||
        document.getElementById('content-inner') ||
        document.getElementById('content')
      if (!root) return 0
      return Math.max(0, pageYOf(root) - (NAV_H + GAP))
    }
    // 瞬时定位（不依赖平滑滚动），让仪表盘第一张卡片停在固定顶栏下方。
    // 两种落点：
    //   · at === 'top'：回到文档最顶（上箭头用）→ 仪表盘落在 --dash-pad-top(76)
    //   · 默认：让仪表盘上缘停在 #content-inner 预留区上沿（＝页面最顶），
    //     因此同样归约为 0；保留算式是为了 #content-inner 之上出现其它元素时仍能对齐。
    // opts.user：用户主动点击（CTA / 上箭头）才允许移动视口；
    // 首次下滚吸附只负责显隐，绝不把用户正在滚的页面拽回去。
    function scrollToDashboard(opts) {
      landed = true
      if (opts && opts.user === false) return
      var to = (opts && opts.at === 'top') ? 0 : dashTop()
      window.scrollTo(0, to)
      // 立即按滚动位置再校正一次，防止滚动事件丢失导致 hub 残留遮挡
      if (window.__bikoSyncHub) window.__bikoSyncHub()
      setTimeout(function () {
        window.scrollTo(0, (opts && opts.at === 'top') ? 0 : dashTop())
        if (window.__bikoSyncHub) window.__bikoSyncHub()
      }, 50)
    }
    // 上箭头：与站内其它页面一致 —— 回到本页最上方（这里是仪表盘首屏，不是欢迎页）
    currentScrollTop = function () { scrollToDashboard({ user: true, at: 'top' }) }

    // CTA：「翻开我的小世界」＝ 停在首页内容最上方（#content-inner 预留区之上），
    // 与上箭头同一个落点，避免首屏离场动画期间坐标抖动导致停在半路。
    function enter(opts) {
      landed = true
      setHubVisible(hub, false)
      document.body.classList.add('biko-nav-on')
      scrollToDashboard({ user: !(opts && opts.user === false), at: 'top' })
    }
    // 首次下滚：只切显隐、不接管滚动（用户本来就在滚）
    currentEnter = function () { enter({ user: false }) }
    hub.querySelector('#bh-cta').addEventListener('click', function () { entered = true; enter({ user: true }) })

    // 左下角「回到顶部」（主题 #go-up）：首页里改成回到仪表盘最上方。
    // 主题默认 scrollToDest(0, 500)，会顺带把欢迎页重新唤出来；这里拦截掉，
    // 行为与其它页面一致（回到本页内容顶部），只是终点是仪表盘而不是 0。
    if (!document.__bikoGoUpBound) {
      document.__bikoGoUpBound = true
      document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('#rightside #go-up') : null
        if (!btn) return
        if (!isHome() || !currentHub || !document.getElementById('biko-dashboard')) return
        e.preventDefault()
        e.stopPropagation()
        if (currentScrollTop) currentScrollTop()
      }, true)
    }

    // 初始：位于首页顶部则显示
    setHubVisible(hub, window.scrollY <= 8)
    syncNav(window.scrollY)
  }

  function boot() {
    if (!isHome()) return
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build)
    else build()
  }
  boot()
  document.addEventListener('pjax:complete', function () { setTimeout(build, 350) })
})()
