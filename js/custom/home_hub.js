/* ============================================================
 * Biko · 个性化首屏 Home Hub
 * 仅首页显示。可见性跟随滚动：顶部显示 / 下滚隐藏 / 回顶部重现；CTA 进入正文。
 * ============================================================ */
(function () {
  var START = new Date(2026, 9, 3, 0, 0, 0) // 建站 2026-10-03 本地 0 点
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
  // 首次下滚吸附：从欢迎态第一次下滚等同点 CTA，自动补到安全落点；回顶后复位
  var entered = false
  var currentEnter = null
  var rafPending = false
  // 滚动/尺寸变化时统一校正：以真实 scrollY 为准，避免滚动同步丢失导致
  // #biko-hub（z-index:200000）残留 .show 遮住正文
  function syncHubByScroll() {
    if (!isHome()) return
    var y = window.scrollY
    if (currentHub) {
      if (y <= 8) {
        entered = false
        setHubVisible(currentHub, true)
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

    // CTA：进入文章流；瞬时定位（不依赖平滑滚动），让第一张卡片停在固定顶栏下方
    function enter() {
      var target = document.querySelector('#recent-posts, .recent-posts') || document.getElementById('content')
      var navH = 60
      var GAP = 14
      var top = target ? Math.max(16, pageYOf(target) - navH - GAP) : window.innerHeight
      setHubVisible(hub, false)
      document.body.classList.add('biko-nav-on')
      // 立即按滚动位置再校正一次，防止滚动事件丢失导致 hub 残留遮挡
      if (window.__bikoSyncHub) window.__bikoSyncHub()
      setTimeout(function () { window.scrollTo(0, top) }, 50)
      setTimeout(function () { if (window.__bikoSyncHub) window.__bikoSyncHub() }, 120)
    }
    currentEnter = enter
    hub.querySelector('#bh-cta').addEventListener('click', function () { entered = true; enter() })

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
