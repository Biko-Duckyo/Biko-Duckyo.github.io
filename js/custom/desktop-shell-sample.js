/* Biko OS preview shell: home, archives, resources and calendar. Existing tools stay authoritative. */
(function () {
  'use strict'
  if (window.__bikoShellSample) { window.__bikoShellSample.boot(); return }
  var root, drawer, trigger, previousFocus, observer, controls, observedHub, weatherObserver
  function glyph(name) { return '<i class="fas fa-' + name + '" aria-hidden="true"></i>' }
  var pageNames = { '/': '鸭喵屋', '/archives/': '随笔', '/resources/': '百宝箱', '/calendar/': '迹寻', '/galleryGroup/': '相册', '/music/': '音乐', '/anime/': '追番', '/scholar/': '研思', '/finance/': '金库' }
  // Standalone layouts keep their own navigation. Keep this list in sync with the
  // early hint in _config.butterfly.yml (inject.head).
  // /admin/ 已从公开构建排除；访问该路径会落入通用 404，仍使用灵动岛。
  var exemptPrefixes = ['/image-editor/', '/books/', '/nanaly/']
  var postPath = /^\/(19|20)\d{2}\/\d{2}\/\d{2}\//
  // Only used when a page has no biko-nav menu to clone (standalone workspaces).
  var destinations = [['/', '鸭喵屋', 'home'], ['/calendar/', '迹寻', 'calendar-day'], ['/archives/', '随笔', 'list'], ['/galleryGroup/', '相册', 'images'], ['/music/', '音乐', 'music'], ['/anime/', '追番', 'heartbeat'], ['/scholar/', '研思', 'book'], ['/finance/', '金库', 'wallet'], ['/resources/', '百宝箱', 'bookmark']]
  function normalizedPath() { return location.pathname.replace(/\/?$/, '/') }
  function trimmed(text) {
    text = (text || '').replace(/\s+/g, ' ').trim()
    return text.length > 18 ? text.slice(0, 18) + '…' : text
  }
  function pageName() {
    var known = pageNames[normalizedPath()]
    if (known) return known
    var title = document.getElementById('article-title')
    return trimmed(title ? title.textContent : (document.title || '').split(/[|·—]/)[0]) || '鸭喵屋'
  }
  function enabled() {
    if (new URLSearchParams(location.search).get('shell') === 'classic') return false
    var path = normalizedPath()
    for (var i = 0; i < exemptPrefixes.length; i++) if (path.indexOf(exemptPrefixes[i]) === 0) return false
    return true
  }
  function tool(id) { var node = document.getElementById(id); if (node) node.click() }
  function search(opener) {
    var returnTo = opener && !opener.closest('#bss-drawer') ? opener : trigger
    close(false)
    if (window.BikoSearch) window.BikoSearch.open(returnTo)
    else document.querySelector('#search-button > .search')?.click()
  }
  function close(restore) { if (restore === false) previousFocus = null; if (drawer && drawer.open) drawer.close() }
  function open(mode) {
    if (!drawer || !enabled()) return
    if (drawer.open) { close(); return }
    previousFocus = document.activeElement
    drawer.dataset.mode = mode || 'navigation'
    document.getElementById('bss-panel-title').textContent = mode === 'controls' ? '控制中心' : '去哪里逛逛？'
    drawer.showModal()
    document.body.classList.add('bss-open')
    trigger.setAttribute('aria-expanded', 'true')
    drawer.querySelector('[data-bss-close]').focus()
  }
  function update() {
    if (!root) return
    document.body.classList.toggle('bss-home', location.pathname === '/')
    document.body.classList.toggle('bss-content-focus', ['/resources/', '/calendar/', '/galleryGroup/', '/music/', '/anime/'].includes(normalizedPath()))
    document.body.classList.toggle('bss-post', postPath.test(normalizedPath()))
    root.querySelector('.bss-current').textContent = pageName()
    document.querySelectorAll('[data-bss-link]').forEach(function (a) {
      if (a.getAttribute('href') === location.pathname) a.setAttribute('aria-current', 'page')
      else a.removeAttribute('aria-current')
    })
    var hub = document.getElementById('biko-hub')
    if (hub && hub !== observedHub && observer) { observer.observe(hub, { attributes: true, attributeFilter: ['class'] }); observedHub = hub }
    var welcome = location.pathname === '/' && hub && hub.classList.contains('show')
    root.hidden = welcome
    // Hide actions a page cannot actually serve, so the shell never shows dead buttons.
    var hasSearch = !!(window.BikoSearch || document.querySelector('#search-button .search'))
    var hasMusic = normalizedPath() === '/music/' || !!document.getElementById('music-toggle')
    var hasTranslate = !!document.getElementById('translateLink')
    document.querySelectorAll('[data-bss-action="search"]').forEach(function (b) { b.hidden = !hasSearch })
    document.querySelectorAll('[data-bss-action="music"]').forEach(function (b) { b.hidden = !hasMusic })
    document.querySelectorAll('[data-bss-action="translate"]').forEach(function (b) { b.hidden = !hasTranslate })
    var dock = document.getElementById('bss-dock')
    if (dock) { dock.hidden = welcome; dock.classList.toggle('bss-slim', !hasSearch && !hasMusic) }
    var clock = root.querySelector('time')
    var date = new Date()
    clock.textContent = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    clock.dateTime = date.toISOString()
    var dark = document.documentElement.dataset.theme === 'dark'
    var theme = drawer.querySelector('[data-bss-action="theme"]')
    theme.removeAttribute('aria-pressed')
    theme.querySelector('span').textContent = dark ? '浅色外观' : '深色外观'
    theme.setAttribute('aria-label', dark ? '切换到浅色外观' : '切换到深色外观')
    theme.title = theme.getAttribute('aria-label')
    theme.querySelector('i').className = 'fas fa-' + (dark ? 'sun' : 'moon')
    var assistant = drawer.querySelector('[data-bss-action="assistant"]')
    if (assistant) assistant.hidden = !document.getElementById('biko-assistant-load') && !document.getElementById('nanaly-cat-hotspot')
    var up = document.querySelector('[data-bss-action="top"]')
    if (up) up.hidden = window.scrollY < 400
  }
  function create() {
    var navSource = document.querySelector('.bn-drawer-links')
    root = document.createElement('div')
    root.id = 'bss-island'
    root.innerHTML = '<a class="bss-home-link" href="/" aria-label="返回鸭喵屋">' + glyph('cat') + '</a>' +
      '<button type="button" id="bss-trigger" aria-label="打开网站导航" aria-controls="bss-drawer" aria-expanded="false"><span class="bss-current">' + pageName() + '</span>' + glyph('chevron-down') + '</button>' +
      '<span class="bss-separator"></span><nav class="bss-shortcuts" aria-label="常用导航"><a href="/" data-bss-link>鸭喵屋</a><a href="/calendar/" data-bss-link>迹寻</a><a href="/archives/" data-bss-link>随笔</a></nav>' +
      '<time aria-label="当前时间"></time><span class="bss-weather" id="bss-weather" aria-label="当前天气" hidden></span><button type="button" class="bss-search" aria-label="搜索全站" data-bss-action="search">' + glyph('magnifying-glass') + '</button>'
    document.body.appendChild(root)
    trigger = document.getElementById('bss-trigger')
    drawer = document.createElement('dialog')
    drawer.id = 'bss-drawer'
    drawer.setAttribute('aria-labelledby', 'bss-panel-title')
    drawer.innerHTML = '<header><div><p>BIKO · PERSONAL SPACE</p><h2 id="bss-panel-title">去哪里逛逛？</h2></div><button type="button" aria-label="关闭导航面板" data-bss-close>' + glyph('xmark') + '</button></header><nav class="bss-destinations" aria-label="全站导航"></nav>' +
      '<section class="bss-control-section" aria-label="全局工具"><p class="bss-section-title">随时可用</p><div class="bss-controls"><button type="button" data-bss-action="search">' + glyph('magnifying-glass') + '<span>站内搜索</span></button><button type="button" data-bss-action="theme" aria-pressed="false">' + glyph('circle-half-stroke') + '<span>切换外观</span></button><button type="button" data-bss-action="music">' + glyph('music') + '<span>音乐播放器</span></button><button type="button" data-bss-action="translate">' + glyph('language') + '<span>简繁转换</span></button></div></section><div class="bss-panel-foot"><span>你的个人数字桌面</span><span>Esc 关闭</span></div>'
    if (navSource) {
      navSource.querySelectorAll('a[href]').forEach(function (source) {
        var link = source.cloneNode(true)
        link.removeAttribute('class'); link.setAttribute('data-bss-link', '')
        drawer.querySelector('.bss-destinations').appendChild(link)
      })
    } else {
      destinations.forEach(function (item) {
        var link = document.createElement('a')
        link.href = item[0]; link.setAttribute('data-bss-link', '')
        link.innerHTML = glyph(item[2]) + '<span>' + item[1] + '</span>'
        drawer.querySelector('.bss-destinations').appendChild(link)
      })
    }
    var menu = drawer.querySelector('.bss-destinations')
    // Normalize inherited navigation too, so mobile and standalone pages agree.
    ;['/', '/calendar/', '/archives/'].reverse().forEach(function (path) {
      var link = menu.querySelector('a[href="' + path + '"]')
      if (!link) return
      var label = link.querySelector('span')
      if (label) label.textContent = pageNames[path]
      else link.textContent = pageNames[path]
      menu.prepend(link)
    })
    document.body.appendChild(drawer)
    var assistant = document.createElement('button')
    assistant.type = 'button'; assistant.dataset.bssAction = 'assistant'; assistant.hidden = true
    assistant.innerHTML = glyph('comment') + '<span>多多助手</span>'
    drawer.querySelector('.bss-controls').appendChild(assistant)
    var dock = document.createElement('nav')
    dock.id = 'bss-dock'; dock.setAttribute('aria-label', '桌面快捷工具')
    dock.innerHTML = '<button type="button" data-bss-action="search" aria-label="搜索全站" title="搜索全站">' + glyph('magnifying-glass') + '</button><button type="button" data-bss-action="music" aria-label="音乐播放器" title="音乐播放器">' + glyph('music') + '</button><span></span><button type="button" data-bss-action="controls" aria-label="打开控制中心" title="控制中心">' + glyph('sliders') + '</button><button type="button" data-bss-action="top" aria-label="回到顶部" title="回到顶部" hidden>' + glyph('arrow-up') + '</button>'
    document.body.appendChild(dock)
    trigger.addEventListener('click', function () { open('navigation') })
    root.addEventListener('click', actions); dock.addEventListener('click', actions)
    drawer.addEventListener('click', function (event) {
      if (event.target.closest('[data-bss-close]')) { close(); return }
      var link = event.target.closest('a[href]')
      if (link) {
        var destination = new URL(link.href, location.href)
        close(destination.pathname === location.pathname && destination.search === location.search && !destination.hash)
        return
      }
      var rect = drawer.getBoundingClientRect()
      if (event.target === drawer && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) { close(); return }
      actions(event)
    })
    drawer.addEventListener('close', function () {
      document.body.classList.remove('bss-open')
      trigger.setAttribute('aria-expanded', 'false')
      if (enabled() && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    })
    observer = new MutationObserver(update)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'], childList: true })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return true
  }
  function actions(event) {
    var button = event.target.closest('[data-bss-action]')
    if (!button) return
    var action = button.dataset.bssAction
    if (action === 'search') search(button)
    if (action === 'controls') open('controls')
    if (action === 'theme') {
      var toggle = nativeToggle()
      if (toggle) toggle.click()
      else applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')
      update()
    }
    if (action === 'translate') { close(false); tool('translateLink') }
    if (action === 'music') {
      close(false)
      if (normalizedPath() === '/music/') {
        document.getElementById('bmpg-player')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
        document.getElementById('bmpg-play')?.focus({ preventScroll: true })
      } else tool('music-toggle')
    }
    if (action === 'assistant') { close(false); (document.getElementById('biko-assistant-load') || document.getElementById('nanaly-cat-hotspot'))?.click() }
    if (action === 'top') window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  /* The old top bar already owns a weather capsule wired to /api/weather by weather.js.
     Rather than fetching a second copy (and risking two different cities), move that
     exact node into the island: same id, so weather.js keeps updating it in place.
     /scholar/ and /finance/ are hand-written pages: they ship no theme nav and no
     weather.js, so the same node is created here and the same script loaded once. */
  function weatherNode() {
    var node = document.getElementById('he-plugin-simple')
    if (node) return node
    node = document.createElement('span')
    node.className = 'bn-weather'
    node.id = 'he-plugin-simple'
    node.setAttribute('aria-label', '当前天气')
    if (!document.querySelector('script[src*="custom/weather.js"]')) {
      var s = document.createElement('script')
      s.src = '/js/custom/weather.js'
      s.defer = true
      document.head.appendChild(s)
    }
    return node
  }
  /* weather.js hides the capsule (display:none) when it has no location yet or the
     proxy is unavailable; an empty 19px divider left in the island reads as a glitch. */
  function syncWeatherSlot() {
    var slot = document.getElementById('bss-weather')
    if (!slot) return
    var node = slot.querySelector('#he-plugin-simple')
    slot.hidden = !node || node.style.display === 'none' || !(node.textContent || '').trim()
  }
  function watchWeather() {
    if (weatherObserver) weatherObserver.disconnect()
    var node = document.getElementById('he-plugin-simple')
    if (!node) return
    weatherObserver = new MutationObserver(syncWeatherSlot)
    weatherObserver.observe(node, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] })
  }
  function mountWeather() {
    var slot = document.getElementById('bss-weather')
    if (!slot) return
    var source = weatherNode()
    slot.querySelectorAll('#he-plugin-simple').forEach(function (node) { if (node !== source) node.remove() })
    if (source.parentNode !== slot) slot.appendChild(source)
    syncWeatherSlot()
    watchWeather()
  }
  /* Delegate to each workspace's existing theme control, including Finance.
     The fallback only serves pages with no native control, using Butterfly's
     {value, expiry} envelope so a subsequent site navigation retains the choice. */
  function applyTheme(next) {
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', JSON.stringify({ value: next, expiry: Date.now() + 7 * 864e5 })) } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', next === 'dark' ? '#0d1018' : '#f2f5fa')
  }
  /* Butterfly 的 #darkmode 才是真正接线的按钮；.bn-right 里那个 onclick="switchNightMode"
     只是旧导航的一层外壳，点它不会切主题，所以顺序反过来。 */
  function nativeToggle() {
    return document.getElementById('darkmode') || document.querySelector('.bn-right [onclick*="switchNightMode"]') || document.getElementById('themeToggle') || document.getElementById('fin-theme-toggle')
  }
  function boot() {
    document.documentElement.classList.remove('bss-early')
    document.body.classList.toggle('biko-shell-sample', enabled())
    if (!enabled()) {
      close()
      if (root) { root.hidden = true; var offDock = document.getElementById('bss-dock'); if (offDock) offDock.hidden = true }
      return
    }
    if (!root && !create()) return
    mountWeather()
    update()
  }
  window.__bikoShellSample = { boot: boot, close: close, dispose: function () { observer?.disconnect(); weatherObserver?.disconnect(); clearInterval(controls) } }
  document.addEventListener('pjax:send', function () { close(false) })
  window.addEventListener('pagehide', function () { close(false) })
  document.addEventListener('pjax:complete', boot)
  window.addEventListener('scroll', function () {
    var up = document.querySelector('#bss-dock [data-bss-action="top"]')
    if (up) up.hidden = window.scrollY < 400
  }, { passive: true })
  // One shared clock, paused in hidden tabs; observer handles theme and welcome state.
  controls = setInterval(function () { if (!document.hidden && enabled()) update() }, 30000)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
