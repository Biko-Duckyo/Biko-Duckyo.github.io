/* ============================================================
 * Biko · 相册（/galleryGroup/）
 * ------------------------------------------------------------
 * 一个 URL，两幕：门 → 墙。页面是主题页面
 * （source/galleryGroup/index.md，type: gallery），与 /music/、
 * /calendar/ 同一套骨架：背景、顶栏 .biko-nav、左下角 #rightside 由主题给出，
 * 本脚本只管门与墙。
 *
 *   1. 门：居中的毛玻璃面板，输暗号 → PBKDF2(600000, SHA-256) 派生
 *      AES-GCM-256 密钥 → 解开 /galleryGroup/album.html 里的 base64 信封
 *   2. 墙：把相册渲染成「一摞相纸」，支持搜索（相册名 / 描述 / 照片说明）
 *   3. 灯箱：点相纸打开大图，← → / Esc / 左右按钮 / 触摸滑动
 *
 * 解密 / 会话存储的实现在 gallery_seal.js（与门共用一个文件，
 * 避免「格式改了一处、另一处没跟上」）；本文件只管交互与渲染。
 *
 * 进入本页的三条路：
 *   1. 会话里有明文  → 直接展开墙（刷新 / 返回）
 *   2. 会话里有密钥  → 拿密文重解一次再展开
 *   3. 两样都没有    → 停在门上，等用户输暗号
 *
 * body.is-open 只有一个含义：墙已经登场。
 *   它由 gallery_page.css 用来放开 #gal-root（默认 display:none），
 *   不存在「锁滚动 / 铺底色」的职责 —— 那些是独立页时代的做法，
 *   现在门是 .gg-gate 遮罩自己承担，否则会盖掉主题背景。
 *   注意方向是「解锁时加上」而不是「进页时预写」：主题页面的
 *   <body> 由 layout.pug 输出，页面自己没法预置 class。
 *
 * Pjax 安全（本站硬约定，见 docs/pjax-safety.md）：
 *   单例挂 window.__BIKO_GALLERY__ 并在 boot() 里自己挂 pjax:complete，
 *   重建前 destroy() 成对卸载监听器 / 定时器 / 键位处理，并把灯箱状态
 *   与 body 滚动锁清理干净。顶栏与左下按钮是常驻节点，pjax 不会替换它们。
 * ============================================================ */
(function () {
  'use strict'

  /* ------------------------------------------------------------
   * 实例外壳：一段可在 pjax 回访时重新执行的初始化
   * ----------------------------------------------------------
   * 门与墙的 DOM 随 #body-wrap 一起被 pjax 换掉，所以这里不能只在
   * 顶层跑一次：脚本文件本身在 inject.bottom 里、只执行一次，
   * 而 pjax 回访本页不会再执行它。boot() 因此被包成一个函数，
   * 引用在闭包里，下一次直接调用即可（不必重新插入 <script>）。 */
  function boot () {
  var $ = function (id) { return document.getElementById(id) }

  /* 不在本页（脚本全站注入）：墙都不在就直接退出，别去碰别页的 DOM */
  if (!$('gal-wall')) return

  var gate = $('gg-gate')          // 解密面板
  var wall = $('gal-wall')         // 照片墙

  /* ---------- 单例：先拆上一轮 ---------- */
  if (window.__BIKO_GALLERY__ && window.__BIKO_GALLERY__.destroy) {
    try { window.__BIKO_GALLERY__.destroy() } catch (e) { /* 忽略 */ }
  }

  var seal = window.GallerySeal.create()
  var SOURCE = seal.SOURCE
  var KEY_STORE = seal.KEY_STORE
  var DATA_STORE = seal.DATA_STORE

  var panel = $('gg-panel')
  var form = $('gg-form')
  var passEl = $('gg-pass')
  var okEl = $('gg-ok')
  var errEl = $('gg-err')

  var wallEl = $('gal-wall')
  var gridEl = $('gal-grid')
  var countEl = $('gal-count')
  var searchBox = $('gal-search-box')
  var searchEl = $('gal-search')
  var clearEl = $('gal-search-clear')

  var lb = $('gal-lb')
  var lbImg = $('gal-lb-img')
  var lbTitle = $('gal-lb-title')
  var lbCount = $('gal-lb-count')
  var lbCaption = $('gal-lb-caption')
  var lbOpen = $('gal-lb-open')
  var lbPrev = $('gal-lb-prev')
  var lbNext = $('gal-lb-next')
  var lbClose = $('gal-lb-close')

  /* ---------- 状态 ---------- */
  var albums = []            // 已解密并规范化的相册
  var raw = null             // 解密后的原始对象（写回缓存用）
  var unlocked = false
  var busy = false
  var timer = null           // 门的淡出计时，destroy 时清掉
  var keyBytes = null        // 记住最近一次的密钥，用于失败后免重复派生
  var listeners = []         // [target, type, fn, opts]
  var lbState = { open: false, album: -1, photo: 0, returnTo: null }
  var layoutMode = 'film'    // 布局模式：film（胶片风格） / stack（一摞相纸）

  /* ---------- 小工具 ---------- */
  function on (target, type, fn, opts) {
    if (!target) return
    target.addEventListener(type, fn, opts)
    listeners.push([target, type, fn, opts])
  }

  /* 会话读写 / 解密全部走 gallery_seal.js（门页与墙页同一份实现） */
  function store (key, value) { seal.remember(key, value) }
  function recall (key) { return seal.recall(key) }
  function hexToBytes (hex) { return seal.hexToBytes(hex) }
  function normalize (data) { return seal.normalize(data) }

  function text (el, value) {
    if (el) el.textContent = value == null ? '' : String(value)
  }

  function prefersReduced () {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    } catch (e) { return false }
  }

  /* ------------------------------------------------------------
   * 一、解密（实现在 gallery_seal.js，这里只做转发，保持下文可读）
   * ---------------------------------------------------------- */
  function fetchToken () { return seal.fetch() }
  function decryptWith (keyBytesValue, meta) { return seal.decryptWith(keyBytesValue, meta) }

  /* ------------------------------------------------------------
   * 二、门：输暗号 → 解密 → 撤场
   * ---------------------------------------------------------- */
  function shake (msg) {
    text(errEl, msg)
    if (!panel) return
    panel.classList.remove('is-shaking')
    void panel.offsetWidth          // 强制回流，第二次输错才会重新抖
    panel.classList.add('is-shaking')
    if (passEl) { try { passEl.select() } catch (e) { /* 忽略 */ } }
  }

  function setBusy (flag) {
    busy = flag
    if (!okEl) return
    okEl.disabled = flag
    text(okEl, flag ? '校验中…' : '确认暗号')
    if (passEl) passEl.disabled = flag
  }

  /* 解锁：门退场，墙登场。两者在同一个文档里，所以是「切换可见性」而不是跳转 */
  function unlockUI (data) {
    albums = normalize(data)
    unlocked = true
    /* is-open 现在只负责「墙登场」（见 gallery_page.css 的
       #gal-root { display: none } / body.is-open #gal-root { display: block }）。
       必须先加上它，再 focus 卡片 —— 否则 display:none 的元素 focus 不上。 */
    document.body.classList.add('is-open')
    if (gate) {
      gate.classList.add('is-leaving')
      gate.setAttribute('aria-hidden', 'true')
    }
    wall.hidden = false
    render()
    var first = gridEl.querySelector('.gal-card')
    if (first) { try { first.focus({ preventScroll: true }) } catch (e) { first.focus() } }
    // 门是 position:fixed 的遮罩，淡出后要从布局里摘掉，否则挡住墙的点击
    timer = setTimeout(function () {
      timer = null
      if (gate) gate.hidden = true
    }, prefersReduced() ? 0 : 380)
  }

  /* 用给定暗号解密：成功则缓存「密钥 + 明文」并解锁 */
  function attempt (pass) {
    return seal.open(pass).then(function (data) {
      keyBytes = seal.getKey()
      raw = data
      unlockUI(data)
    })
  }

  function onSubmit (e) {
    e.preventDefault()
    if (busy) return
    var value = passEl ? passEl.value : ''
    if (!value) { shake('先输入暗号哦~'); return }
    setBusy(true)
    text(errEl, '')
    attempt(value).catch(function (err) {
      setBusy(false)
      keyBytes = null
      if (err && /fetch|HTTP|payload|network/i.test(err.message || '')) {
        shake('暂时读取不到相册数据，请刷新后重试。')
      } else if (err && (err.name === 'OperationError' || /decrypt/i.test(err.name || ''))) {
        // 暗号错时把刚才存下的密钥也清掉，免得下次进页面拿它去白试一遍
        store(KEY_STORE, null)
        shake('暗号不对哦，再想想~')
      } else {
        shake('暂时无法校验，请刷新后重试。')
      }
    })
  }

  /* 输入法（拼音）候选未上屏时回车，不要当成提交 */
  function onPassKeydown (e) {
    if (e.key === 'Enter' && (e.isComposing || e.keyCode === 229)) e.preventDefault()
  }

  /* 自动填充 / 浏览器残留可能塞入脏值：进页面先清干净再聚焦 */
  function resetInput () {
    if (passEl && passEl.value && !passEl.dataset.touched) passEl.value = ''
    try { passEl.focus({ preventScroll: true }) } catch (e) { /* 忽略 */ }
  }

  /* 进入页面：明文 → 密钥 → 手动输，三条路依次尝试 */
  function bootFromCache () {
    var plain = seal.getData()
    if (plain) {
      raw = plain
      unlockUI(plain)
      return
    }

    var storedKey = hexToBytes(recall(KEY_STORE))
    if (storedKey && storedKey.length) {
      keyBytes = storedKey
      seal.setKey(storedKey)
      setBusy(true)
      seal.fetch().then(function (meta) {
        return decryptWith(storedKey, meta)
      }).then(function (data) {
        setBusy(false)
        raw = data
        store(DATA_STORE, JSON.stringify({ t: Date.now(), data: data }))
        unlockUI(data)
      }).catch(function () {
        // 密钥失效（暗号换过 / 被清过 / 密文重发过）→ 静默回门，不吓人
        setBusy(false)
        keyBytes = null
        store(KEY_STORE, null)
        text(errEl, '')
        resetInput()
      })
      return
    }

    if (passEl) {
      on(passEl, 'input', function () { passEl.dataset.touched = '1' })
      on(passEl, 'keydown', onPassKeydown)
      on(window, 'pageshow', function () {
        timer = setTimeout(function () { timer = null; resetInput() }, 50)
      })
      timer = setTimeout(function () { timer = null; resetInput() }, 60)
    }
  }

  /* ------------------------------------------------------------
   * 三、墙（渲染 + 搜索）
   * ---------------------------------------------------------- */
  function matches (album, q) {
    if (!q) return true
    if ((album.name + ' ' + album.desc + ' ' + album.date).toLowerCase().indexOf(q) > -1) return true
    for (var i = 0; i < album.photos.length; i++) {
      if ((album.photos[i].caption || '').toLowerCase().indexOf(q) > -1) return true
    }
    return false
  }

  /* 相纸：三层。背面两张尽量取同相册的不同照片，不足时用相纸斜纹补位 */
  function sheet (mod, album, idx) {
    var el = document.createElement('div')
    el.className = 'gal-sheet gal-sheet--' + mod
    if (mod !== 'front') el.setAttribute('aria-hidden', 'true')
    var photo = album.photos[idx]
    if (photo && photo.thumb) {
      var img = document.createElement('img')
      img.src = photo.thumb
      img.alt = ''
      img.loading = 'lazy'
      img.decoding = 'async'
      img.draggable = false
      el.appendChild(img)
    } else {
      el.classList.add('gal-sheet--blank')
    }
    return el
  }

  /* 一摞相纸；点击时打开灯箱 */
  function buildCard (album, i) {
    var n = album.photos.length
    var card = document.createElement('button')
    card.type = 'button'
    card.className = 'gal-card is-in'
    card.style.setProperty('--i', String(Math.min(i, 8)))
    card.setAttribute('aria-label', album.name + '，' + n + ' 张照片')

    var stack = document.createElement('div')
    stack.className = 'gal-stack'
    // 张数 ≤2 时补空白相纸，保证「一摞」的外观不塌
    stack.appendChild(sheet('b2', album, n > 2 ? n - 1 : -1))
    stack.appendChild(sheet('b1', album, n > 1 ? n - 2 : -1))

    var front = sheet('front', album, 0)
    var cap = document.createElement('div')
    cap.className = 'gal-sheet-cap'
    var b = document.createElement('b')
    b.textContent = n ? n + ' 张照片' : '空相册'
    var s = document.createElement('span')
    s.textContent = n ? '点开查看' : '敬请期待'
    cap.appendChild(b)
    cap.appendChild(s)
    front.appendChild(cap)
    stack.appendChild(front)
    card.appendChild(stack)

    var meta = document.createElement('div')
    meta.className = 'gal-meta'
    var line = document.createElement('div')
    line.className = 'gal-meta-line'
    var name = document.createElement('span')
    name.className = 'gal-name'
    name.textContent = album.name
    line.appendChild(name)
    if (album.date) {
      var date = document.createElement('span')
      date.className = 'gal-date'
      date.textContent = album.date
      line.appendChild(date)
    }
    meta.appendChild(line)
    var desc = document.createElement('p')
    desc.className = 'gal-desc'
    desc.textContent = album.desc
    meta.appendChild(desc)
    card.appendChild(meta)

    on(card, 'click', function () { openLb(i, 0) })
    return card
  }

  /* 胶片风格卡片 */
  function buildFilmCard (album, i) {
    var n = album.photos.length
    var card = document.createElement('div')
    card.className = 'gal-film-card'

    // 胶片齿孔
    var holes = document.createElement('div')
    holes.className = 'gal-film-card__holes'
    for (var h = 0; h < 5; h++) {
      var hole = document.createElement('div')
      hole.className = 'gal-film-card__hole'
      holes.appendChild(hole)
    }
    card.appendChild(holes)

    // 封面图
    var cover = document.createElement('div')
    cover.className = 'gal-film-card__cover'
    if (album.photos[0] && album.photos[0].thumb) {
      var img = document.createElement('img')
      img.src = album.photos[0].thumb
      img.alt = album.name
      img.loading = 'lazy'
      cover.appendChild(img)
    } else {
      // 没有封面图时用星空鲸鱼图占位
      var img2 = document.createElement('img')
      img2.src = 'https://s2.loli.net/2022/04/11/oDZPBRxHn59rbYO.jpg'
      img2.alt = album.name
      img2.loading = 'lazy'
      cover.appendChild(img2)
    }
    card.appendChild(cover)

    // 相册名
    var name = document.createElement('p')
    name.className = 'gal-film-card__name'
    name.textContent = album.name
    card.appendChild(name)

    // 照片数
    var count = document.createElement('p')
    count.className = 'gal-film-card__count'
    count.textContent = n + ' 张照片'
    card.appendChild(count)

    on(card, 'click', function () { openLb(i, 0) })
    return card
  }

  function render () {
    var q = (searchEl && searchEl.value || '').trim().toLowerCase()
    var shown = 0
    var frag = document.createDocumentFragment()

    if (!albums.length) {
      frag.appendChild(emptyBox('fa-box-open', '还没有相册，先去布置一下吧。'))
    } else {
      albums.forEach(function (album, i) {
        if (!matches(album, q)) return
        // 根据布局模式渲染不同卡片
        if (layoutMode === 'film') {
          frag.appendChild(buildFilmCard(album, i))
        } else {
          frag.appendChild(buildCard(album, i))
        }
        shown++
      })
      if (!shown) frag.appendChild(emptyBox('fa-magnifying-glass', '没有找到「' + searchEl.value.trim() + '」相关的照片。'))
    }

    gridEl.textContent = ''
    gridEl.appendChild(frag)

    // 更新统计数字
    var photoCount = 0
    albums.forEach(function(album) { photoCount += album.photos.length })
    var photoCountEl = document.getElementById('gal-photo-count')
    var albumCountEl = document.getElementById('gal-album-count')
    if (photoCountEl) photoCountEl.textContent = photoCount
    if (albumCountEl) albumCountEl.textContent = albums.length

    // 更新 grid 的 class
    gridEl.classList.toggle('gal-grid--film', layoutMode === 'film')
    gridEl.classList.toggle('gal-grid', layoutMode === 'stack')

    text(countEl, q ? '命中 ' + shown + ' / 共 ' + albums.length + ' 本' : '共 ' + albums.length + ' 本')
    if (searchBox) searchBox.classList.toggle('has-value', !!q)
  }

  function emptyBox (icon, msg) {
    var box = document.createElement('div')
    box.className = 'gal-empty'
    var i = document.createElement('i')
    i.className = 'fas ' + icon
    i.setAttribute('aria-hidden', 'true')
    box.appendChild(i)
    box.appendChild(document.createTextNode(msg))
    return box
  }

  /* 输入防抖：中文输入法组词期间不重排 */
  function onSearchInput () {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(function () {
      searchTimer = null
      render()
    }, 140)
  }

  function clearSearch () {
    if (!searchEl) return
    searchEl.value = ''
    render()
    searchEl.focus()
  }

  /* ------------------------------------------------------------
   * 四、灯箱
   * ---------------------------------------------------------- */
  function paintLb () {
    var album = albums[lbState.album]
    if (!album) return
    var photo = album.photos[lbState.photo]
    if (!photo) return

    if (lbImg) {
      lbImg.classList.add('is-loading')
      var loader = new Image()
      loader.onload = function () {
        if (!lbState.open) return
        if (lbImg.getAttribute('src') !== photo.src) lbImg.src = photo.src
        lbImg.classList.remove('is-loading')
      }
      loader.onerror = function () { if (lbImg) lbImg.classList.remove('is-loading') }
      loader.src = photo.src
      // 命中缓存时 onload 可能同步前已触发，兜底一次
      if (loader.complete && loader.naturalWidth) {
        lbImg.src = photo.src
        lbImg.classList.remove('is-loading')
      }
    }

    text(lbTitle, album.name)
    text(lbCount, (lbState.photo + 1) + ' / ' + album.photos.length)
    text(lbCaption, photo.caption || album.desc || '')
    if (lbOpen) {
      lbOpen.href = photo.src
      lbOpen.title = album.name + ' · 第 ' + (lbState.photo + 1) + ' 张'
    }
    if (lbPrev) lbPrev.disabled = album.photos.length < 2
    if (lbNext) lbNext.disabled = album.photos.length < 2
  }

  function openLb (albumIdx, photoIdx) {
    var album = albums[albumIdx]
    if (!album || !album.photos.length) return
    lbState.open = true
    lbState.album = albumIdx
    lbState.photo = photoIdx || 0
    lbState.returnTo = document.activeElement
    lb.classList.add('is-open')
    lb.setAttribute('aria-hidden', 'false')
    document.body.classList.add('gal-lb-lock')
    paintLb()
    try { lbClose.focus({ preventScroll: true }) } catch (e) { if (lbClose) lbClose.focus() }
  }

  function closeLb () {
    if (!lbState.open) return
    lbState.open = false
    lb.classList.remove('is-open')
    lb.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('gal-lb-lock')
    if (lbImg) { lbImg.removeAttribute('src'); lbImg.alt = '' }
    var back = lbState.returnTo
    lbState.returnTo = null
    if (back && typeof back.focus === 'function') {
      try { back.focus({ preventScroll: true }) } catch (e) { /* 忽略 */ }
    }
  }

  function stepLb (dir) {
    var album = albums[lbState.album]
    if (!album || album.photos.length < 2) return
    var n = album.photos.length
    lbState.photo = (lbState.photo + dir + n) % n
    paintLb()
  }

  function onKeydown (e) {
    if (e.key === 'Escape' && lbState.open) {
      e.preventDefault()
      closeLb()
      return
    }
    if (lbState.open) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepLb(-1) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); stepLb(1) }
      return
    }
    /* 墙上空处按 / 直接搜索（和很多站点一致的肌肉记忆） */
    if (e.key === '/' && unlocked && searchEl && document.activeElement !== searchEl &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) {
      e.preventDefault()
      searchEl.focus()
    }
  }

  /* 触摸左右滑：只在灯箱打开时生效，纵向滑动不拦 */
  var touch = { x: 0, y: 0, active: false }
  function onTouchStart (e) {
    if (!lbState.open || (e.touches && e.touches.length !== 1)) { touch.active = false; return }
    var t = e.touches ? e.touches[0] : e.changedTouches[0]
    touch.x = t.clientX
    touch.y = t.clientY
    touch.active = true
  }
  function onTouchEnd (e) {
    if (!lbState.open || !touch.active) return
    touch.active = false
    var t = (e.changedTouches && e.changedTouches[0]) || null
    if (!t) return
    var dx = t.clientX - touch.x
    var dy = t.clientY - touch.y
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) stepLb(dx < 0 ? 1 : -1)
  }

  /* 点背景（不是图片 / 按钮 / 文字）关灯箱 */
  function onStageClick (e) {
    if (e.target === e.currentTarget || e.target === lbImg) closeLb()
  }

  /* ------------------------------------------------------------
   * 五、装配 / 拆卸（pjax 要求成对）
   * ---------------------------------------------------------- */
  var searchTimer = null

  function bind () {
    on(form, 'submit', onSubmit)
    on(searchEl, 'input', onSearchInput)
    on(searchEl, 'search', onSearchInput)      // 点原生 ✕ 时只触发 search
    on(clearEl, 'click', clearSearch)
    on(window, 'keydown', onKeydown)

    // 布局切换按钮
    var layoutToggle = document.getElementById('gal-layout-toggle')
    if (layoutToggle) {
      on(layoutToggle, 'click', function() {
        layoutMode = layoutMode === 'film' ? 'stack' : 'film'
        // 更新按钮文字
        var span = layoutToggle.querySelector('span')
        if (span) {
          span.textContent = layoutMode === 'film' ? '切换回原相册布局' : '切换到胶片风格'
        }
        render()
      })
    }

    on(lbClose, 'click', closeLb)
    on(lbPrev, 'click', function () { stepLb(-1) })
    on(lbNext, 'click', function () { stepLb(1) })
    on(lb, 'click', onStageClick)
    on(lb, 'touchstart', onTouchStart, { passive: true })
    on(lb, 'touchend', onTouchEnd, { passive: true })
    // 图片本身也允许点掉（手机上更顺手）
    on(lbImg, 'click', closeLb)
    on(lb, 'transitionend', function (e) {
      if (e.target === lb && !lbState.open && lbImg) lbImg.removeAttribute('src')
    })
  }

  function destroy () {
    listeners.forEach(function (item) {
      try { item[0].removeEventListener(item[1], item[2], item[3]) } catch (e) { /* 忽略 */ }
    })
    listeners = []
    if (timer) { clearTimeout(timer); timer = null }
    if (searchTimer) { clearTimeout(searchTimer); searchTimer = null }
    lbState.open = false
    lbState.returnTo = null
    if (document.body) document.body.classList.remove('gal-lb-lock')
    /* 离开本页时把 is-open 摘掉：
       它是挂在 body 上的页面状态，而 pjax 只替换 #body-wrap；
       留着的话下次再进本页会以「已解锁」的样子先闪一下墙。 */
    if (document.body) document.body.classList.remove('is-open')
  }

  bind()
  bootFromCache()

  window.__BIKO_GALLERY__ = { destroy: destroy }

  /* 调试出口：控制台里 __BIKO_GALLERY__.state() 看当前状态 */
  window.__BIKO_GALLERY__.state = function () {
    return { unlocked: unlocked, busy: busy, albums: albums.length, raw: !!raw, key: keyBytes ? keyBytes.length : 0 }
  }
  }

  /* ------------------------------------------------------------
   * 顶层：首屏 boot + pjax 回访时重新 boot
   * ----------------------------------------------------------
   * inject.bottom 的脚本只执行一次，而 pjax 换页不会重跑它；
   * 所以「回到本页」要靠这里自己接。下一拍再 boot：pjax 是异步
   * 替换 #body-wrap 的，同步执行读到的还是旧 DOM。
   * ---------------------------------------------------------- */
  boot()

  document.addEventListener('pjax:complete', function () {
    setTimeout(function () {
      /* 不在本页就什么都不做（boot 自身也会在拿不到 #gal-wall 时退出） */
      if (!document.getElementById('gal-wall')) return
      boot()
    }, 0)
  })
})()
