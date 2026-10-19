/*!
 * Acrylic 风格自定义右键菜单（本站适配版）
 *
 * 结构移植自 张洪Heo《Butterfly魔改：自定义右键菜单》
 *   https://blog.zhheo.com/p/5e931b65.html
 *
 * 本文件是按本站环境（Hexo 8.1.2 + Butterfly 5.7 + Pjax 开启）重写的实现，
 * 与原文 JS 已不构成同一作品。相对原文的改动：
 *
 *   1. 不依赖 jQuery（全站自研脚本都是原生 JS）
 *   2. 用 addEventListener('contextmenu') 而非 window.oncontextmenu = ，不覆盖他人绑定
 *   3. 所有点击监听委托到 document —— Pjax 换页后节点被替换也不会丢绑定
 *   4. 每次打开菜单实时读取尺寸，不缓存 width/height（原版缓存导致缩放后溢出）
 *   5. 遮罩点击 / 空白处点击 / Esc / 滚动 / 缩放 都能关菜单
 *   6. 繁简切换直接调主题的 window.translateFn.translatePage()，不再内置 3 万字映射表
 *   7. 深色模式复用主题的 btf.activateDarkMode / activateLightMode
 *   8. 放行原生菜单：移动端 / 自定义顶栏 / 输入框 / 右侧栏按钮
 *   9. 打开菜单时收起「小黑」AI 面板，避免层级打架
 *
 * 依赖的主题全局对象（Butterfly 5.x 均有）：
 *   - btf.activateDarkMode / btf.activateLightMode / btf.saveToLocal
 *   - window.translateFn.translatePage()
 */
;(function () {
  'use strict'

  if (window.__BIKO_RIGHTMENU__) return
  window.__BIKO_RIGHTMENU__ = true

  var MOBILE_MAX = 768 // 与主题 main.js 的断点保持一致
  var GAP = 10         // 菜单与鼠标的间距

  var menuEl = null
  var maskEl = null

  function getMenu () {
    if (!menuEl || !document.body.contains(menuEl)) {
      menuEl = document.getElementById('rightMenu')
    }
    return menuEl
  }

  function getMask () {
    if (!maskEl || !document.body.contains(maskEl)) {
      maskEl = document.getElementById('rightmenu-mask')
    }
    return maskEl
  }

  /* ---------------------------------------------------------------
   * 开关
   * --------------------------------------------------------------- */

  function closeMenu () {
    var menu = getMenu()
    var mask = getMask()
    if (menu) menu.classList.remove('right-menu-open')
    if (mask) mask.classList.remove('right-menu-open')
  }

  function openMenu (pageX, pageY) {
    var menu = getMenu()
    if (!menu) return

    // 先显示再量尺寸（display:none 时 offsetWidth 为 0）
    menu.classList.add('right-menu-open')

    // 每次实时读取，不缓存 —— 缩放 / 旋转 / Pjax 换页后依然正确
    var w = menu.offsetWidth
    var h = menu.offsetHeight

    var left = pageX + GAP
    var top = pageY + GAP

    if (left + w > window.innerWidth) left = Math.max(GAP, pageX - w - GAP)
    if (top + h > window.innerHeight) top = Math.max(GAP, pageY - h - GAP)

    menu.style.left = left + 'px'
    menu.style.top = top + 'px'

    var mask = getMask()
    if (mask) mask.classList.add('right-menu-open')

    // 与「小黑」AI 面板（#nanaly-panel，z-index 9003）错开层级：打开菜单时收起它。
    // 注意：面板的展开类名是 is-open（见 nanaly/js/noimpty-ai.js 的 openPanel/closePanel），
    // 不是 open；收起时需同步 aria-hidden 与 inert，否则会留下可聚焦的隐藏面板。
    var chat = document.getElementById('nanaly-panel')
    if (chat && chat.classList.contains('is-open')) {
      chat.classList.remove('is-open')
      chat.setAttribute('aria-hidden', 'true')
      chat.inert = true
    }
  }

  // 兼容外部（含旧写法）调用
  window.RemoveRightMenu = closeMenu

  /* ---------------------------------------------------------------
   * 事件
   * --------------------------------------------------------------- */

  // 需要保留浏览器原生右键菜单的场景
  function shouldUseNative (target) {
    if (window.innerWidth <= MOBILE_MAX) return true // 移动端不接管
    if (!target || !target.closest) return false
    // 自定义顶栏
    if (target.closest('.menu-container') || target.closest('#menu-container')) return true
    // 输入框 / 可编辑区
    if (target.closest('input, textarea, [contenteditable="true"], [contenteditable=""]')) return true
    // 右下角功能按钮
    if (target.closest('#rightside')) return true
    return false
  }

  document.addEventListener('contextmenu', function (e) {
    if (shouldUseNative(e.target)) return // 放行原生

    e.preventDefault()
    openMenu(e.clientX, e.clientY)
  })

  // 统一处理：点击菜单项 / 点击遮罩 / 点击空白处
  // 用 capture 阶段，保证先于页面上其他 click 逻辑执行
  document.addEventListener('click', function (e) {
    var menu = getMenu()
    if (!menu || !menu.classList.contains('right-menu-open')) return

    var item = e.target.closest && e.target.closest('#rightMenu .rightMenu-item')
    if (item) {
      e.preventDefault()
      e.stopPropagation()
      handleAction(item.id)
      closeMenu()
      return
    }

    // 点在菜单面板内部（非菜单项，例如分组留白）不关
    if (e.target.closest && e.target.closest('#rightMenu')) return

    closeMenu()
  }, true)

  document.addEventListener('scroll', closeMenu, { passive: true, capture: true })
  window.addEventListener('resize', closeMenu)
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) closeMenu()
  })

  // Pjax 换页后确保状态干净（节点被 pjax 保留，状态得我们自己清）
  document.addEventListener('pjax:send', closeMenu)
  document.addEventListener('pjax:complete', closeMenu)

  /* ---------------------------------------------------------------
   * 动作
   * --------------------------------------------------------------- */

  function handleAction (id) {
    switch (id) {
      case 'menu-backward':
        window.history.back()
        break
      case 'menu-forward':
        window.history.forward()
        break
      case 'menu-refresh':
        window.location.reload()
        break
      case 'menu-home':
        window.location.href = window.location.origin + '/'
        break
      case 'menu-darkmode':
        toggleDarkMode()
        break
      case 'menu-translate':
        toggleTranslate()
        break
      case 'menu-radompage':
        goRandomPost()
        break
      default:
        break
    }
  }

  function toggleDarkMode () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    try {
      if (isDark) {
        if (window.btf && window.btf.activateLightMode) window.btf.activateLightMode()
        if (window.btf && window.btf.saveToLocal) window.btf.saveToLocal.set('theme', 'light', 2)
      } else {
        if (window.btf && window.btf.activateDarkMode) window.btf.activateDarkMode()
        if (window.btf && window.btf.saveToLocal) window.btf.saveToLocal.set('theme', 'dark', 2)
      }
    } catch (err) {
      // 极端兜底：直接改 data-theme
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark')
    }

    // 通知依赖主题色的第三方组件（与原版行为一致）
    if (typeof window.utterancesTheme === 'function') window.utterancesTheme()
    if (typeof window.loadFBComment === 'function') window.loadFBComment()
    var disqus = document.getElementById('disqus_thread')
    if (window.DISQUS && disqus && disqus.children.length && typeof window.disqusReset === 'function') {
      setTimeout(function () { window.disqusReset() }, 200)
    }
  }

  function toggleTranslate () {
    var t = window.translateFn
    if (t && typeof t.translatePage === 'function') t.translatePage()
  }

  /**
   * 随便逛逛：跳转到站内随机一篇
   *
   * 说明：
   *  - 原版硬编码 href='/random.html'，本站没有该页面
   *  - 本站 search.xml 曾是全站加密的（旧 scripts/noimpty-lockdown.js，已移除），不能直接读
   *  - 因此这里优先读一个不加密的轻量清单 /json/random-posts.json：
   *      { "posts": ["/2026/10/14/xxx/", "/2026/10/13/yyy/"] }
   *    该文件可用一个很小的 Hexo 生成器在构建期产出
   *  - 清单不可用时，退化为跳「时间轴」页
   */
  function goRandomPost () {
    var fallback = '/archives/'

    fetch('/json/random-posts.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null })
      .then(function (data) {
        var list = data && data.posts
        if (!list || !list.length) { window.location.href = fallback; return }

        var here = window.location.pathname
        var pick = list[Math.floor(Math.random() * list.length)]

        // 避免随机到自己
        if (list.length > 1) {
          var guard = 0
          while (pick === here && guard < 5) {
            pick = list[Math.floor(Math.random() * list.length)]
            guard++
          }
        }
        window.location.href = pick
      })
      .catch(function () { window.location.href = fallback })
  }
})()


