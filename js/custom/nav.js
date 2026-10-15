// ======================================================
// Biko 自定义顶栏交互（复刻 superq314.github.io）
// 1) 中间时钟每秒刷新
// 2) 菜单条鼠标滚轮横向滚动
// 3) 移动端汉堡 Navvisible() 复用原生抽屉
// 4) 统一明暗切换 switchNightMode（星球旋转动画），齿轮/顶栏共用
// ======================================================
(function () {
  var timer = null
  function addZero(v) { return v < 10 ? '0' + v : '' + v }
  var weekMap = { 0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' }

  // 时钟：与左侧天气/定位胶囊同风格，带时钟图标
  function setTime() {
    var box = document.getElementById('message-date-box')
    if (!box) return
    var t = new Date()
    var timeStr =
      addZero(t.getHours()) + ':' + addZero(t.getMinutes()) + ':' + addZero(t.getSeconds())
    var html = '<i class="fas fa-clock"></i><span>' + timeStr + '</span>' +
      '<span class="bn-weekday">星期' + weekMap[t.getDay()] + '</span>'
    if (box._bikoHtml !== html) { box.innerHTML = html; box._bikoHtml = html }
  }

  // 顶栏右区按钮：改写为「图标 + 文字」结构，文字常规收起、悬停右区展开。
  // 同时兼容原本就是 <i> 图标 的写法（保留原图标作为 glyph）。
  // 注意：只做「视觉包装」，不要动 #search-button / .search 的类名与层级，
  // 也不要在本文件里给搜索按钮额外绑定 click —— 主题的 local-search.js
  // 通过 document.querySelector('#search-button > .search') 自行绑定，重复绑定会双开/双关。
  function decorateIcon(btn, label) {
    if (!btn || btn.__bikoDecorated) return
    btn.__bikoDecorated = true
    // 纯图标按钮（如明暗切换）：只保留 ☀/🌙 图标，不包「图标 + 文字」结构。
    // 由顶栏标记 data-bn-no-label="true" 控制，便于后续按需增删。
    if (btn.getAttribute('data-bn-no-label') === 'true') {
      btn.classList.add('bn-icon-only')
      if (!btn.getAttribute('title')) btn.setAttribute('title', label)
      if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', label)
      return
    }
    var glyph = document.createElement('span')
    glyph.className = 'bn-icon-glyph'
    var inner = btn.querySelector('i, svg')
    if (inner) glyph.appendChild(inner)
    var text = document.createElement('span')
    text.className = 'bn-icon-text'
    text.textContent = label
    btn.textContent = ''
    btn.appendChild(glyph)
    btn.appendChild(text)
    if (!btn.getAttribute('title')) btn.setAttribute('title', label)
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', label)
  }
  function decorateNavIcons() {
    var icons = document.querySelectorAll('.bn-right .bn-icon')
    for (var i = 0; i < icons.length; i++) {
      var btn = icons[i]
      var label = btn.getAttribute('data-bn-label') || btn.getAttribute('title') || '切换'
      decorateIcon(btn, label)
    }
  }

  // 顶栏搜索按钮：不要在这里绑定！
  // 主题的 local-search.js 通过 document.querySelector('#search-button > .search')
  // 自行绑定 openSearch。我们只要保证该选择器能命中（见 _config.butterfly.yml 的
  // <div id="search-button"><a class="bn-icon social-icon search">…</a></div> 结构）。
  // 之前这里既 .click() 原生节点又调 btf.search()，若两处都触发会把搜索面板开了又关。

  // 移动端汉堡：点击原生 #toggle-menu 打开 Butterfly 抽屉
  window.Navvisible = function () {
    var t = document.getElementById('toggle-menu')
    if (t) t.click()
  }

  // 菜单条横向滚轮
  function bindWheel() {
    var item = document.querySelector('.menu-container .menu-item')
    if (!item || item.__wheelBound) return
    item.__wheelBound = true
    item.addEventListener('wheel', function (e) {
      if (item.scrollWidth <= item.clientWidth) return
      e.preventDefault()
      item.scrollLeft += -e.deltaY
    }, { passive: false })
  }

  function realDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
  }
  // 顶栏与齿轮面板共用的太阳/月亮 SVG 图标；同时同步齿轮面板按钮的 <i>
  function updateAllIcons() {
    var nowDark = realDark()
    var modeIcon = document.getElementById('modeicon')
    if (modeIcon) modeIcon.setAttribute('xlink:href', nowDark ? '#icon-sun' : '#icon-moon')
    var gearIcons = document.querySelectorAll('#rightside-config-show button[title*="dark"] i, ' +
      '#rightside-config-show button[title*="night"] i, #rightside-config-hide #darkmode i')
    for (var i = 0; i < gearIcons.length; i++) {
      gearIcons[i].className = nowDark ? 'fas fa-sun' : 'fas fa-moon'
    }
  }

  // 统一明暗切换：星球动画 → 触发原生 #darkmode → 同步图标
  window.__bikoSwitching = false
  window.switchNightMode = function () {
    if (window.__bikoSwitching) return
    // 正在播放星球动画时避免重入（而不是因为残留 .Cuteen_DarkSky 就永久短路）
    if (window.__bikoSkyPlaying) return
    window.__bikoSkyPlaying = true
    var existedSky = document.getElementsByClassName('Cuteen_DarkSky')[0]
    if (!existedSky) {
      document.body.insertAdjacentHTML('beforeend',
        '<div class="Cuteen_DarkSky"><div class="Cuteen_DarkPlanet"></div></div>')
    }
    setTimeout(function () {
      window.__bikoSwitching = true
      var btn = document.getElementById('darkmode')
      if (btn) btn.click()
      setTimeout(function () { window.__bikoSwitching = false; updateAllIcons() }, 80)
      var sky = document.getElementsByClassName('Cuteen_DarkSky')[0]
      setTimeout(function () {
        if (sky) {
          sky.style.transition = 'opacity 1.2s'
          sky.style.opacity = '0'
          setTimeout(function () {
            if (sky && sky.parentNode) sky.parentNode.removeChild(sky)
            window.__bikoSkyPlaying = false
          }, 1300)
        } else {
          window.__bikoSkyPlaying = false
        }
      }, 900)
    }, 1000)
  }

  // 齿轮面板里的 #darkmode：拦截并改走星球动画（重入时放行原生切换）
  document.addEventListener('click', function (e) {
    var t = e.target
    if (!t || !t.closest) return
    var d = t.closest('#darkmode')
    if (d && !window.__bikoSwitching) {
      e.preventDefault()
      e.stopPropagation()
      window.switchNightMode()
    }
  }, true)

  // 顶栏三栏避让：实测左/右区实际宽度写入 CSS 变量，
  // 供 .bn-menu 的 max-width 精确扣除（见 custom_nav.css），避免中区菜单压到胶囊。
  // 注意：JS 未执行 / pjax 中元素缺失时不要写入兜底大值（旧代码写 300/110，
  // 会让 600~1100px 视口下的 max-width 变成负数），改为写 0 并交给 CSS 的
  // min() 上限与媒体查询分段预算兜底。
  var navRO = null
  var navROTargets = null
  function syncNavMetrics() {
    var nav = document.querySelector('.menu-container .biko-nav') || document.querySelector('.biko-nav')
    var menu = document.querySelector('.bn-menu')
    if (!nav || !menu) return
    var left = nav.querySelector('.bn-left')
    var right = nav.querySelector('.bn-right')
    var lw = left ? left.offsetWidth : 0
    var rw = right ? right.offsetWidth : 0
    menu.style.setProperty('--bn-left-w', lw + 'px')
    menu.style.setProperty('--bn-right-w', rw + 'px')
  }
  function watchNavMetrics() {
    if (typeof ResizeObserver !== 'function') return
    var left = document.querySelector('.bn-left')
    var right = document.querySelector('.bn-right')
    if (!left && !right) return
    // Pjax 换页会用新节点替换 .bn-left/.bn-right，而 ResizeObserver 仍盯着旧引用，
    // 于是三栏避让变量在换页后不再更新（只有手动改窗口宽度才偶发修正）。
    // 这里检测目标已失效 / 已变更就重建观察器，确保始终盯着当前文档里的节点。
    var next = [left, right].filter(Boolean)
    var same = navRO && navROTargets && navROTargets.length === next.length &&
      next.every(function (el, i) { return el === navROTargets[i] })
    if (same) return
    if (navRO) { navRO.disconnect(); navRO = null }
    navROTargets = next
    navRO = new ResizeObserver(function () { syncNavMetrics() })
    next.forEach(function (el) { navRO.observe(el) })
  }

  function init() {
    setTime()
    if (!timer) timer = setInterval(setTime, 1000)
    decorateNavIcons()
    bindWheel()
    updateAllIcons()
    syncNavMetrics()
    watchNavMetrics()
  }

  if (document.readyState !== 'loading') init()
  else document.addEventListener('DOMContentLoaded', init)
  document.addEventListener('pjax:complete', function () {
    window.__bikoSkyPlaying = false
    window.__bikoSwitching = false
    setTimeout(init, 200)
  })
})()
