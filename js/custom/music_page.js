/* ============================================================
 * Biko · 音乐页 /music/ 控制器
 * ------------------------------------------------------------
 * 版式：左「唱机」+ 右「歌词 / 歌单」双卡（见 source/music/index.md）。
 *
 * 设计要点：
 *   1. 复用全站唯一的 APlayer 实例（window.__BIKO_AP__），不新建播放器，
 *      因此天然保证「同时只播放一个歌单」，左下角音符按钮也始终同步。
 *   2. 切换歌单 = 就地清空并重灌 list（ap.list.clear / add / switch），
 *      不销毁实例 —— 销毁会把左下角按钮指向的对象一起打掉。
 *   3. 歌词自己渲染，不用 APlayer 内建的 .aplayer-lrc：
 *      那个容器尺寸由主题/Aplayer 样式决定，且被固定在实例容器里，
 *      塞不进右侧卡片；这里只要拿 track.lrc 字符串解析成时间轴。
 *   4. 页脚在本页不需要，运行时移除（幂等 + pjax 后重跑）。
 *   5. APlayer 异步注入，实例没就绪时轮询等待；等不到就自己拉数据建一个
 *      （接口挂掉时 MetingJS 连实例都不建，见 boot()/adopt()）。
 *   6. 曲目里的 lrc 一律不交给 APlayer：
 *      它把这个字段当「LRC 文件的地址」去 XHR（APlayer 源码 lrc.switch），
 *      塞正文进去就会按相对路径 404，塞真地址又会由它自己画歌词、抢显示。
 *      所以喂给它的曲目 lrc 始终为空，正文单独存在 rawTracks 里自渲染。
 *   7. 所有异步回调先判 live / token，页面切走或歌单切走后不再操作 DOM。
 * ============================================================ */
(function () {
  'use strict'

  var live = true
  var ap = null
  var bound = false
  var timer = null
  var tries = 0
  var MAX_TRIES = 66            // 66 * 300ms ≈ 20s
  var ADOPT_AFTER = 12          // 12 * 300ms ≈ 3.6s：这么久还没有实例就自己建
  var adopting = false          // 正在走兜底自建（避免每 300ms 重复发起）
  var adopted = false           // 当前实例是本页兜底建出来的（只影响状态文案）
  var PAGE_SIZE = 8             // 歌单每页曲目数：超过就分页，正好 8 首及以下不显示分页器
  var WINDOW_SZ = 7             // 页码数字按钮上限（含首页与末页），保证分页器一行放得下

  var filter = ''
  var page = 0                  // 当前页码（0 基）。筛选变化时会被重置，见 buildList()
  var pageLocked = false        // true = 用户手动翻的页，本轮 buildList 内不允许被「追随当前曲目」规则改掉

  var playlists = []            // [{ name, id, server, type }]
  var activeIndex = -1          // 当前歌单在 playlists 里的下标（可能为 -1：数据没配或少配）
  var switching = false         // 正在拉新歌单：期间禁止重复点击
  var switchToken = 0           // 歌单请求令牌：回来时对不上就丢弃（防连点串台）

  var lrcRows = []              // 歌词行元素
  var lrcTimes = []             // 与 lrcRows 一一对应的时间（秒）
  var lrcTrackKey = ''          // 当前歌词属于哪首（name|artist），切歌才重解析
  var lrcActive = -1

  var ui = {}

  /* ---------- 工具 ---------- */
  function pad (n) { return (n < 10 ? '0' : '') + n }
  function fmt (s) {
    if (!isFinite(s) || s < 0) return '0:00'
    var m = Math.floor(s / 60)
    return m + ':' + pad(Math.floor(s % 60))
  }
  function esc (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }
  function list () { return (ap && ap.list && ap.list.audios) || [] }
  function idx () { return (ap && ap.list && ap.list.index) || 0 }
  function track () { return list()[idx()] || {} }
  function keyOf (t) { return (t.name || '') + '|' + (t.artist || '') }

  function durOf (t) {
    // Meting 给的时间可能是 'mm:ss' 也可能是秒数，统一成 mm:ss 展示
    var d = t && t.duration
    if (typeof d === 'number' && isFinite(d)) return fmt(d)
    if (typeof d === 'string' && d) return d
    return '--:--'
  }

  function getAP () { return window.__BIKO_AP__ || null }

  /* ------------------------------------------------------------
   * 页脚移除
   * ------------------------------------------------------------
   * 已抽成独立脚本 source/js/custom/page_footer.js：
   *   /music/ 与 /calendar/ 都是整屏页面，页脚按「页面标记 + 类型清单」统一隐藏，
   *   并负责 pjax 往返时「进页摘掉、离页还回」。
   * 这里只负责在合适的时机踢它一脚（进页 / 换页），逻辑本身不在此处重复，
   * 免得两份判断各自演化、哪天只改了一边。
   * ------------------------------------------------------------ */
  function syncFooter () {
    var api = window.__BIKO_FOOTER__
    if (api && api.sync) api.sync()
  }

  /* ---------- 播放器就绪 ---------- */
  function boot () {
    if (!live) return
    ap = getAP()
    if (ap && ap.list && ap.list.audios) {
      clearInterval(timer); timer = null
      adopted = false
      /* MetingJS 建的实例里带着 lrc 正文 → APlayer 会去 404。
         建实例前的包装层（_config.butterfly.yml 的 bikoWrap）已经把正文
         清空并转存到 __bikoLrc，这里抄进 rawTracks 供本页渲染歌词。 */
      if (!rawTracks.length) {
        rawTracks = ap.list.audios.map(function (t) {
          return {
            name: t.name,
            artist: t.artist,
            url: t.url,
            cover: t.cover,
            lrc: t.__bikoLrc || t.lrc || '',
            type: t.type
          }
        })
        stripLrc()
      }
      markActive()
      buildList()
      bind()
      renderAll()
      return
    }
    /* MetingJS 只在「接口返回非空数组」时才 new APlayer；
       接口挂掉/限流时它连实例都不建，window.__BIKO_AP__ 永远是 undefined。
       音乐按钮那种「等实例」的写法在这种情况下会一直空转。
       所以这里给本页加一条兜底：等够一段时间还没有实例，就自己拉当前歌单
       并用 APlayer 建一个（同样挂到 window.__BIKO_AP__，全站仍然只有一个）。 */
    if (!adopting && ++tries > ADOPT_AFTER) {
      adopting = true
      adopt()
      return
    }
    if (tries > MAX_TRIES && !adopting) {
      clearInterval(timer); timer = null
      setStatus('播放器没能加载出来，刷新页面再试试～')
      setListHint('播放器不可用：曲目列表需要它的音频引擎。')
      setLrcHint('播放器不可用，暂时读不到歌词。')
    }
  }

  /* ------------------------------------------------------------
   * 兜底自建实例
   * ------------------------------------------------------------
   * 什么时候走这里：MetingJS 的 XHR 失败/返回非数组 → 没建实例。
   * 做法与 MetingJS 完全一致（同一个 APlayer 构造器、同一套参数），
   * 区别只是「我们自己拿到了数组，自己喂给它」，所以不需要 MetingJS 配合。
   * 成功后 adopted = true，后续切歌单仍走 list.clear/add，逻辑不变。
   * ------------------------------------------------------------ */
  function adopt () {
    var pl = playlists[activeIndex >= 0 ? activeIndex : 0]
    if (!pl) {
      setStatus('没有配置歌单：请检查主题配置里的 music_playlists')
      setListHint('没有可用的歌单配置。')
      return
    }
    if (typeof window.APlayer !== 'function') {
      setStatus('播放器脚本没能加载（APlayer 不可用）')
      setListHint('APlayer 加载失败，曲目列表暂时不可用。')
      return
    }
    setStatus('正在直接拉取「' + pl.name + '」…')
    setListHint('正在载入「' + pl.name + '」…')
    fetchPlaylist(pl).then(function (audios) {
      if (!live) return
      if (!audios.length) {
        setStatus('「' + pl.name + '」是空歌单')
        setListHint('这个歌单没有曲目。')
        setLrcHint('暂无歌词。')
        return
      }
      var host = ui.host || document.body
      var el = document.createElement('div')
      el.className = 'aplayer bmpg-adopted'
      host.appendChild(el)
      try {
        /* lrcType:0 —— 歌词由本页自己渲染，不要让 APlayer 再画一份。
           APlayer 的歌词组件仍会初始化（lrcType 只管显隐），
           所以 audio 里的 lrc 统一给空串：没有地址它就不会发请求，
           也不会在切歌时抢我们的 syncLrc()。 */
        ap = new window.APlayer({
          container: el,
          audio: audios.map(function (t) {
            return { name: t.name, artist: t.artist, url: t.url, cover: t.cover, lrc: '', type: t.type || 'auto' }
          }),
          lrcType: 0,
          listFolded: true,
          listMaxHeight: '0px',
          autoplay: false,
          preload: 'none',
          theme: '#7e96b8'
        })
        window.__BIKO_AP__ = ap
      } catch (e) {
        setStatus('创建播放器失败：' + ((e && e.message) || '未知错误'))
        if (el.parentNode) el.parentNode.removeChild(el)
        return
      }
      activeIndex = playlists.indexOf(pl)
      rawTracks = audios.slice()
      if (timer) { clearInterval(timer); timer = null }
      markActive()
      buildList()
      bind()
      renderAll()
      setStatus('已载入「' + pl.name + '」· 共 ' + audios.length + ' 首')
    }).catch(function (err) {
      if (!live) return
      adopting = false           // 允许下一次 boot 再试
      tries = 0
      var why = (err && err.message) ? err.message : '网络异常'
      setStatus('歌单接口不可用：' + why)
      setListHint('曲目没能加载出来（' + why + '）。\n' +
        '这是外部 Meting 接口的问题，与本站无关；接口恢复后刷新即可。\n' +
        '也可以先检查主题配置里的 music_playlists。')
      setLrcHint('曲目没加载，歌词也暂时读不到。')
    })
  }

  /* ---------- 文案 ---------- */
  function setStatus (t) { if (live && ui.status) ui.status.textContent = t }
  function setListHint (t) {
    if (!live || !ui.list) return
    ui.list.innerHTML = '<li class="bmpg-empty">' + esc(t) + '</li>'
    ui.rows = []
    if (ui.pager) ui.pager.hidden = true
  }
  function setLrcHint (t) {
    if (!live || !ui.lrc) return
    ui.lrc.innerHTML = '<p class="bmpg-lrc-hint">' + esc(t) + '</p>'
    lrcRows = []; lrcTimes = []; lrcActive = -1
  }

  /* ---------- 渲染：曲目信息 ---------- */
  function renderMeta () {
    if (!live || !ui.art) return
    var t = track()
    var cover = t.cover || ''
    ui.art.style.backgroundImage = cover ? "url('" + cover + "')" : ''
    if (ui.disc) ui.disc.classList.toggle('has-cover', !!cover)
    if (ui.name) ui.name.textContent = t.name || '未知曲目'
    if (ui.artist) ui.artist.textContent = t.artist || '未知艺术家'
  }

  function renderProgress () {
    if (!live || !ui.seek || !ap) return
    var au = ap.audio
    if (!au) return
    var d = au.duration
    if (isFinite(d) && d > 0) {
      ui.seek.max = d
      ui.seek.value = au.currentTime
      ui.ptime.textContent = fmt(au.currentTime)
      ui.dtime.textContent = fmt(d)
    } else {
      ui.seek.value = 0
      ui.ptime.textContent = '0:00'
      ui.dtime.textContent = '0:00'
    }
    syncLrc()
  }

  function renderPlay () {
    if (!live || !ui.play || !ap) return
    var playing = !!(ap.audio && !ap.audio.paused)
    /* 幂等：只在状态真变化时碰 DOM。
       250ms 心跳会反复调用本函数，若无条件重写 innerHTML，
       会 4 次/秒重建图标节点 —— 既浪费又会让 CSS transition 反复重置。 */
    if (playing === ui.playingState) return
    ui.playingState = playing
    ui.play.innerHTML = '<i class="fas ' + (playing ? 'fa-pause' : 'fa-play') + '"></i>'
    ui.play.setAttribute('aria-label', playing ? '暂停' : '播放')
    if (ui.player) ui.player.classList.toggle('playing', playing)
    if (ui.disc) ui.disc.classList.toggle('spinning', playing)
  }

  function renderStatus () {
    if (!live || !ui.status || !ap) return
    var n = list().length
    setStatus(n ? ('第 ' + (idx() + 1) + ' / ' + n + ' 首') : '歌单是空的')
  }

  function renderActive () {
    if (!live) return
    var cur = idx()
    for (var i = 0; i < ui.rows.length; i++) {
      ui.rows[i].classList.toggle('on', Number(ui.rows[i].getAttribute('data-i')) === cur)
    }
  }

  function renderAll () {
    renderMeta()
    renderProgress()
    renderPlay()
    renderStatus()
    renderActive()
    loadLrc()
  }

  /* ---------- 心跳 ----------
   * APlayer 的 play/pause 事件是「后置」的（play() 要等 audio.play() 的
   * Promise 落定才派发），所以点击 → 图标翻转之间有空窗，甚至某些链路下
   * 事件干脆不来。这里补一层以 audio.paused 为准的心跳，值不变时不碰 DOM。 */
  var beat = null
  function startBeat () { if (!beat) beat = setInterval(function () { renderPlay(); syncLrc() }, 250) }
  function stopBeat () { if (beat) { clearInterval(beat); beat = null } }


  /* ------------------------------------------------------------
   * 歌词
   * ------------------------------------------------------------
   * 数据来源：Meting 返回的曲目对象里的 lrc 字段，可能是
   *   · "[00:01.00]xxx\n[00:05.00]yyy" 这种标准 LRC 文本  → 解析成时间轴
   *   · 纯文本（没有时间戳）                              → 整段展示
   *   · 空 / undefined                                    → 显示「暂无歌词」
   * 只用它的字符串，不碰 APlayer 自己的 .aplayer-lrc 容器：
   * 那个容器长在实例里、尺寸由 APlayer 决定，塞不进右侧卡片。
   * ------------------------------------------------------------ */
  var LRC_RE = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g

  function parseLrc (raw) {
    if (!raw || typeof raw !== 'string') return []
    var out = []
    var lines = raw.replace(/\r/g, '').split('\n')
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i]
      var tags = []
      var m
      LRC_RE.lastIndex = 0
      while ((m = LRC_RE.exec(line)) !== null) {
        var min = parseInt(m[1], 10)
        var sec = parseInt(m[2], 10)
        var frac = m[3] ? parseInt((m[3] + '00').slice(0, 3), 10) / 1000 : 0
        tags.push(min * 60 + sec + frac)
      }
      if (!tags.length) continue
      // 去掉时间戳只留正文；一行可带多个时间戳（副歌复用）
      var text = line.replace(LRC_RE, '').replace(/\s+$/, '')
      for (var t = 0; t < tags.length; t++) out.push({ time: tags[t], text: text })
    }
    out.sort(function (a, b) { return a.time - b.time })
    return out
  }

  function renderLrc (raw) {
    if (!live || !ui.lrc) return
    var rows = parseLrc(raw)
    lrcRows = []; lrcTimes = []; lrcActive = -1

    if (rows.length) {
      var html = ''
      for (var i = 0; i < rows.length; i++) {
        html += '<p class="bmpg-lrc-line" data-i="' + i + '">' +
          (rows[i].text ? esc(rows[i].text) : '<span class="bmpg-lrc-dash">·</span>') + '</p>'
      }
      ui.lrc.innerHTML = html
      var els = ui.lrc.querySelectorAll('.bmpg-lrc-line')
      for (var k = 0; k < els.length; k++) {
        lrcRows.push(els[k])
        lrcTimes.push(rows[k].time)
      }
      syncLrc(true)
      return
    }

    // 没有时间戳但确实有文本：整段按行展示（纯音乐/纯文本歌词常见）
    var plain = String(raw || '').trim()
    if (plain) {
      var parts = plain.split('\n')
      var h = ''
      for (var p = 0; p < parts.length; p++) {
        if (!parts[p].trim()) continue
        h += '<p class="bmpg-lrc-plain">' + esc(parts[p].trim()) + '</p>'
      }
      ui.lrc.innerHTML = h || '<p class="bmpg-lrc-hint">这首歌的歌词是空白的</p>'
      return
    }

    setLrcHint('这首歌暂时没有歌词，安静听一会儿吧。')
  }

  function loadLrc (force) {
    if (!live) return
    var t = rawTrack()
    var k = keyOf(t)
    if (!force && k === lrcTrackKey) { syncLrc(true); return }
    lrcTrackKey = k
    renderLrc(t.lrc)
    // 切歌瞬间 lrc 可能还没随对象就位，空值时延迟补一次
    if (!t.lrc) {
      setTimeout(function () {
        if (!live) return
        var t2 = rawTrack()
        if (keyOf(t2) === k && t2.lrc) { lrcTrackKey = ''; loadLrc() }
      }, 1200)
    }
  }

  function syncLrc (forceScroll) {
    if (!live || !lrcRows.length || !ap || !ap.audio) return
    var cur = ap.audio.currentTime || 0
    var next = -1
    for (var i = 0; i < lrcTimes.length; i++) {
      if (lrcTimes[i] <= cur + 0.15) next = i
      else break
    }
    if (next === lrcActive && !forceScroll) return
    if (lrcActive >= 0 && lrcRows[lrcActive]) lrcRows[lrcActive].classList.remove('is-on')
    lrcActive = next
    if (next < 0) return
    var el = lrcRows[next]
    if (!el) return
    el.classList.add('is-on')
    /* 只有歌词面板可见时才滚动：隐藏面板（display:none）里 scrollTop
       恒为 0，此时算出来的位置没有意义，切回来还得重算一次。 */
    if (!ui.lrcPanel || !ui.lrcPanel.classList.contains('is-on')) return
    var box = ui.lrcBox
    if (!box) return
    var target = el.offsetTop - box.clientHeight / 2 + el.offsetHeight / 2
    if (target < 0) target = 0
    box.scrollTo({ top: target, behavior: forceScroll === true ? 'auto' : 'smooth' })
  }


  /* ------------------------------------------------------------
   * 歌单列表
   * ------------------------------------------------------------ */
  function buildList () {
    if (!live || !ui.list) return
    var arr = list()
    var kw = filter.trim().toLowerCase()
    var shown = 0
    ui.rows = []

    /* 先按关键词收敛成 want，再切页。
       顺序很重要：分页必须发生在筛选之后，否则「第 3 页」的 8 首会先被裁掉
       再被筛没，出现「有页码但列表空」的假象。 */
    var want = []
    for (var i = 0; i < arr.length; i++) {
      var t = arr[i] || {}
      var title = t.name || '未知曲目'
      var artist = t.artist || ''
      if (kw && (title + ' ' + artist).toLowerCase().indexOf(kw) < 0) continue
      want.push({ i: i, t: t, title: title, artist: artist })
    }
    shown = want.length

    var totalPages = Math.max(1, Math.ceil(shown / PAGE_SIZE))

    /* 当前播放曲目落在第几页（0 基）。搜索时它可能已被筛掉，此时不跟随。 */
    var auto = -1
    if (ap && ap.list) {
      var curTrack = idx()
      for (var a = 0; a < want.length; a++) {
        if (want[a].i === curTrack) { auto = Math.floor(a / PAGE_SIZE); break }
      }
    }

    /* 三条规则，顺序即优先级：
     *   0) pageLocked（用户刚手动翻页）→ 用户意图优先，跳过「追随当前曲目」，
     *      否则点第 3 页会被正在播放的曲目当场拽回去，表现为「点了没反应」；
     *   1) 无关键词且当前曲目可见 → 翻到它所在页（切歌时高亮才追得上）；
     *   2) 页码越界（换歌单、搜索结果变少）→ 夹回最后一页。
     * 本轮消费完就把锁放掉，后续（换歌、筛选）又能正常追随。 */
    if (pageLocked) pageLocked = false
    else if (auto >= 0 && !kw) page = auto
    else if (page > totalPages - 1) page = totalPages - 1
    if (page < 0) page = 0

    var visible = want.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    var html = ''
    for (var v = 0; v < visible.length; v++) {
      var it = visible[v]
      html +=
        '<li>' +
        '<button class="bmpg-item" type="button" data-i="' + it.i + '">' +
        /* 封面列取代了旧版的序号列：右侧面板较窄，序号在长列表里也帮不上定位，
           封面更能让人一眼认出。播放中的那一行用 .on 高亮 + 跳动条。 */
        '<span class="cover"' + (it.t.cover ? ' style="background-image:url(\'' + esc(it.t.cover) + '\')"' : '') + '></span>' +
        '<span class="txt">' +
        '<span class="nm">' + esc(it.title) + '</span>' +
        '<span class="ar">' + esc(it.artist) + '</span>' +
        '</span>' +
        '<span class="dur">' + esc(durOf(it.t)) + '</span>' +
        '</button></li>'
    }

    if (!shown) {
      ui.list.innerHTML = '<li class="bmpg-empty">' +
        (kw ? '没有匹配「' + esc(filter) + '」的歌曲' : '这个歌单还是空的') + '</li>'
      ui.rows = []
    } else {
      ui.list.innerHTML = html
      ui.rows = Array.prototype.slice.call(ui.list.querySelectorAll('.bmpg-item'))
      for (var k = 0; k < ui.rows.length; k++) {
        ui.rows[k].addEventListener('click', onPick)
      }
    }

    /* 计数文案带上页信息，否则用户会以为「歌单只剩 8 首」 */
    if (ui.count) {
      ui.count.textContent = shown + ' 首' +
        (totalPages > 1 ? ' · ' + (page + 1) + '/' + totalPages : '')
    }
    renderPager(totalPages)
    renderActive()
  }

  function renderPager (totalPages) {
    if (!ui.pager) return
    /* 隐藏时必须把页码同步到 0，否则「点第 5 页 → 搜索把结果缩到 1 页 →
       清空搜索」会立刻被规则 2 夹回最后一页，看起来像跳页。 */
    if (totalPages <= 1) {
      ui.pager.hidden = true
      ui.pager.innerHTML = ''
      page = 0
      return
    }

    var cur = Math.min(page, totalPages - 1)
    /* 数字按钮太多时只留「首 + 当前附近 + 末」，中间用省略号，
       保证分页器永远一行放得下（WINDOW_SZ = 7）。 */
    var nums = []
    if (totalPages <= WINDOW_SZ) {
      for (var i = 0; i < totalPages; i++) nums.push(i)
    } else {
      var half = Math.floor((WINDOW_SZ - 2) / 2)
      var start = Math.max(1, cur - half)
      var end = Math.min(totalPages - 2, cur + half)
      if (cur - half <= 1) { start = 1; end = WINDOW_SZ - 2 }
      if (cur + half >= totalPages - 2) { start = totalPages - (WINDOW_SZ - 1); end = totalPages - 2 }
      nums = [0]
      if (start > 1) nums.push(-1)              // -1 = 省略号
      for (var n = start; n <= end; n++) nums.push(n)
      if (end < totalPages - 2) nums.push(-2)   // -2 = 省略号
      nums.push(totalPages - 1)
    }

    var html = ''
    for (var j = 0; j < nums.length; j++) {
      var p = nums[j]
      if (p < 0) { html += '<span class="bmpg-pagegap" aria-hidden="true">…</span>'; continue }
      var label = '第 ' + (p + 1) + ' 页'
      html +=
        '<button type="button" data-p="' + p + '"' +
        ' class="bmpg-page' + (p === cur ? ' is-current' : '') + '"' +
        (p === cur ? ' aria-current="page"' : '') +
        ' aria-label="' + label + '" title="' + label + '">' + (p + 1) + '</button>'
    }
    /* 上一页 / 下一页：用 disabled 表达首尾边界（比隐藏更好，位置稳定不跳） */
    html =
      '<button type="button" data-p="' + Math.max(0, cur - 1) + '"' +
      ' class="bmpg-prevpg" aria-label="上一页" title="上一页"' + (cur === 0 ? ' disabled' : '') + '>' +
      '<i class="fas fa-angle-left" aria-hidden="true"></i></button>' +
      html +
      '<button type="button" data-p="' + Math.min(totalPages - 1, cur + 1) + '"' +
      ' class="bmpg-nextpg" aria-label="下一页" title="下一页"' + (cur === totalPages - 1 ? ' disabled' : '') + '>' +
      '<i class="fas fa-angle-right" aria-hidden="true"></i></button>'

    ui.pager.innerHTML = html
    ui.pager.hidden = false

    var btns = ui.pager.querySelectorAll('button')
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener('click', onGoPage)
    }
  }

  function onGoPage () {
    if (!live || this.disabled) return
    var p = Number(this.getAttribute('data-p'))
    if (!isFinite(p)) return
    page = p
    pageLocked = true   /* 用户意图：本次 buildList 不许「追随当前曲目」把页码拽回去 */
    buildList()
    scrollListToTop()
  }

  function scrollListToTop () {
    if (ui.list) ui.list.scrollTop = 0
  }


  /* ------------------------------------------------------------
   * 歌单切换
   * ------------------------------------------------------------
   * 全站只有【一个】APlayer 实例（左下角音符按钮也用它），所以切换歌单
   * 不能 new 一个新的，也不能 destroy 旧的 —— 那会让音符按钮指向死对象。
   * 正确做法是就地换数据：
   *     ap.list.clear()              清空
   *     ap.list.add(audios, i)       灌入新曲目（第二个参数 = 立即切到第几首）
   * 这样 audio 元素、音量、事件订阅、状态全部沿用，切歌单后照常播。
   *
   * 数据怎么来：
   *   走 window.meting_api 模板（与 MetingJS 同一套参数），用 fetch 自己取。
   *   不复用 MetingJS 的 loadMeting()：它以「给 .aplayer 元素补 data-id」
   *   为前提，而 .no-destroy 元素它只处理一次，改 data-id 也不会重跑。
   * ------------------------------------------------------------ */
  // 与 MetingJS 内置的默认模板保持一致（仅作兜底：正常情况一定走
  // _config.butterfly.yml 注入的 window.meting_api）
  var DEFAULT_API = 'https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r'

  function apiUrl (pl) {
    var tpl = (typeof window.meting_api === 'string' && window.meting_api) ? window.meting_api : DEFAULT_API
    return tpl
      .replace(':server', encodeURIComponent(pl.server || 'netease'))
      .replace(':type', encodeURIComponent(pl.type || 'playlist'))
      .replace(':id', encodeURIComponent(pl.id))
      .replace(':auth', '')
      .replace(':r', String(Math.random()))
  }

  /**
   * 拉一个歌单。
   * 设计上必须把「接口挂了」和「歌单是空的」分开：
   * 公共 Meting 服务会限流（返回 {"message":"请求次数已达上限"}，
   * HTTP 状态却是 200），也可能被 Cloudflare 挡成 522。
   * 只要不是合法数组，一律当作失败并给出可读原因。
   */
  function fetchPlaylist (pl) {
    var url = apiUrl(pl)
    return fetch(url, { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) throw new Error('接口返回 ' + res.status)
        return res.text().then(function (body) {
          var data
          try { data = JSON.parse(body) } catch (e) { throw new Error('接口返回的不是曲目数据') }
          if (Array.isArray(data)) return data
          // 限流/报错时服务端会给一个带 message 的对象，原样透出给用户看
          if (data && data.message) throw new Error(String(data.message))
          throw new Error('接口返回格式不对')
        })
      })
  }

  /* ------------------------------------------------------------
   * 原始曲目缓存
   * ------------------------------------------------------------
   * APlayer 内部 list.audios 里的对象会被它改写（lrc 被清空等），
   * 而歌词正文是我们自己渲染要用的，所以单独存一份「拉回来的原样数据」，
   * 用【索引】与 APlayer 的列表对齐（两边都由同一个数组顺序灌入）。
   * ------------------------------------------------------------ */
  var rawTracks = []

  function rawTrack () { return rawTracks[idx()] || {} }

  /* 喂给 APlayer 的曲目必须把 lrc 抹掉，理由见文件顶部第 6 条：
     lrc 是「地址」，给了正文它就按相对路径去 404；给了真地址，
     APlayer 又会自己 XHR + 抢歌词显示。正文我们自己存（rawTracks）。 */
  function aplayerTracks (audios) {
    return audios.map(function (t) {
      return {
        name: t.name,
        artist: t.artist,
        url: t.url,
        cover: t.cover,
        lrc: '',
        type: t.type || 'auto'
      }
    })
  }

  /**
   * 换掉 APlayer 里某几首歌的 lrc 值（空串 = 不请求）。
   * 为什么需要它：首屏那个实例是 MetingJS 用 data-id 建的，它把 Meting
   * 返回的 lrc 正文原样塞进 audio，APlayer 就会在切歌时发一条 404。
   * 这里在它建好之后把 lrc 统一清成空字符串，既消掉噪音也为我们的
   * 自渲染歌词让路。
   */
  function stripLrc () {
    var arr = list()
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].lrc) arr[i].lrc = ''
    }
  }

  function applyPlaylist (pl, audios) {
    if (!ap || !ap.list) return
    rawTracks = audios.slice()
    // add 之后 APlayer 会自己派发 listswitch / listclear，renderAll 由事件兜住
    if (typeof ap.list.clear === 'function') ap.list.clear()
    if (typeof ap.list.add === 'function') ap.list.add(aplayerTracks(audios), 0)
    filter = ''
    if (ui.filter) ui.filter.value = ''
    page = 0
    pageLocked = false
    buildList()
    renderAll()
  }

  function switchPlaylist (index) {
    if (!live || switching) return
    if (index === activeIndex) { closePicker(); return }

    var prevIndex = activeIndex
    var token = ++switchToken
    switching = true
    activeIndex = index
    paintPicker()
    closePicker()

    var pl = playlists[index]
    if (!pl) { switching = false; return }

    setStatus('正在切换歌单「' + pl.name + '」…')
    setListHint('正在载入「' + pl.name + '」…')
    setLrcHint('正在载入歌词…')
    lrcTrackKey = ''

    fetchPlaylist(pl).then(function (audios) {
      // 连点保护：期间又切了别的歌单 / 已经离开页面 → 这次结果作废
      if (!live || token !== switchToken) return
      switching = false
      if (!audios.length) {
        setStatus('「' + pl.name + '」是空歌单')
        setListHint('这个歌单没有曲目。')
        setLrcHint('暂无歌词。')
        return
      }
      applyPlaylist(pl, audios)
      setStatus('已切换到「' + pl.name + '」· 共 ' + audios.length + ' 首')
    }).catch(function (err) {
      if (!live || token !== switchToken) return
      switching = false
      // 失败回滚到原来的歌单，菜单高亮也要跟着回去，否则界面在说谎
      activeIndex = prevIndex
      paintPicker()
      var why = (err && err.message) ? err.message : '网络异常'
      setStatus('切换失败：' + why)
      setListHint('「' + pl.name + '」没拉到曲目（' + why + '）。\n' +
        '当前仍显示原歌单，稍后重试或检查 _config.butterfly.yml 里的 music_playlists。')
    })
  }


  /* ---------- 歌单菜单 ---------- */
  function paintPicker () {
    if (!live) return
    var pl = playlists[activeIndex]
    if (ui.pickname) ui.pickname.textContent = pl ? pl.name : '歌单'
    if (!ui.pickmenu) return

    if (!playlists.length) {
      ui.pickmenu.innerHTML = '<p class="bmpg-pickempty">还没有配置歌单</p>'
      if (ui.pickbtn) ui.pickbtn.disabled = true
      return
    }
    if (ui.pickbtn) ui.pickbtn.disabled = false

    var html = ''
    for (var i = 0; i < playlists.length; i++) {
      var on = i === activeIndex
      html +=
        '<button type="button" role="option" data-pl="' + i + '"' +
        ' class="bmpg-pickitem' + (on ? ' is-on' : '') + '"' +
        ' aria-selected="' + (on ? 'true' : 'false') + '">' +
        '<i class="fas ' + (on ? 'fa-circle-check' : 'fa-circle') + '" aria-hidden="true"></i>' +
        '<span class="gl-name">' + esc(playlists[i].name) + '</span>' +
        '</button>'
    }
    ui.pickmenu.innerHTML = html
    var items = ui.pickmenu.querySelectorAll('.bmpg-pickitem')
    for (var k = 0; k < items.length; k++) {
      items[k].addEventListener('click', onPickPlaylist)
    }
  }

  function onPickPlaylist () {
    var i = Number(this.getAttribute('data-pl'))
    if (isFinite(i)) switchPlaylist(i)
  }

  function openPicker () {
    if (!live || !ui.pickmenu || !playlists.length) return
    ui.pickmenu.hidden = false
    if (ui.pickbtn) ui.pickbtn.setAttribute('aria-expanded', 'true')
    bindDoc()
  }
  function closePicker () {
    if (!ui.pickmenu) return
    ui.pickmenu.hidden = true
    if (ui.pickbtn) ui.pickbtn.setAttribute('aria-expanded', 'false')
    unbindDoc()
  }
  function togglePicker () {
    if (!ui.pickmenu) return
    if (ui.pickmenu.hidden) openPicker()
    else closePicker()
  }

  /* 菜单开着时才挂 document 监听，收起/离开页面就摘掉。
     不这么写的话，pjax 来回几趟就会攒下一堆同样的监听器
     （每次 init 都 wire 一遍，而 closePicker 又指向旧闭包）。
     用具名函数而不是内联闭包，removeEventListener 才对得上。 */
  var docBound = false
  function onDocClick (ev) {
    if (!live) return
    if (ui.picker && !ui.picker.contains(ev.target)) closePicker()
  }
  function onDocKey (ev) {
    if (ev.key === 'Escape') closePicker()
  }
  function bindDoc () {
    if (docBound) return
    docBound = true
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onDocKey)
  }
  function unbindDoc () {
    if (!docBound) return
    docBound = false
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onDocKey)
  }

  /* ---------- tab 切换 ---------- */
  function switchTab (name) {
    if (!live) return
    for (var i = 0; i < ui.tabs.length; i++) {
      var on = ui.tabs[i].getAttribute('data-bmpg-tab') === name
      ui.tabs[i].classList.toggle('is-on', on)
      ui.tabs[i].setAttribute('aria-selected', on ? 'true' : 'false')
    }
    for (var k = 0; k < ui.panels.length; k++) {
      ui.panels[k].classList.toggle('is-on', ui.panels[k].getAttribute('data-bmpg-panel') === name)
    }
    if (name === 'lrc') {
      // 面板从 display:none 变回来时 scrollTop 是 0，补一次定位
      setTimeout(function () { syncLrc(true) }, 0)
    } else {
      closePicker()
    }
  }

  /* ---------- 播放控制 ---------- */
  function onPick () {
    if (!live || !ap) return
    var i = Number(this.getAttribute('data-i'))
    if (!isFinite(i)) return
    try {
      ap.list.switch(i)
      ap.play()
    } catch (e) {}
  }

  function wire () {
    var tabs = ui.tabs
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].addEventListener('click', function () {
        switchTab(this.getAttribute('data-bmpg-tab'))
      })
    }

    if (ui.play) {
      ui.play.addEventListener('click', function () {
        if (!ap) return
        var playing = !!(ap.audio && !ap.audio.paused)
        if (playing) ap.pause()
        else ap.play()
        // 先按意图翻一次图标，事件回来后再以真实状态校正（见 renderPlay 心跳）
        ui.playingState = null
        renderPlay()
        if (!playing) startBeat()
        else stopBeat()
      })
    }
    if (ui.prev) {
      ui.prev.addEventListener('click', function () {
        if (!ap) return
        try { ap.skipBack() } catch (e) {}
      })
    }
    if (ui.next) {
      ui.next.addEventListener('click', function () {
        if (!ap) return
        try { ap.skipForward() } catch (e) {}
      })
    }
    if (ui.shuffle) {
      ui.shuffle.addEventListener('click', function () {
        if (!ap) return
        var on = this.classList.toggle('is-active')
        try { ap.setMode(on ? 'random' : 'circulation') } catch (e) {}
        this.setAttribute('aria-pressed', on ? 'true' : 'false')
      })
    }

    if (ui.seek) {
      ui.seek.addEventListener('input', function () {
        if (ap) ap.seek(parseFloat(this.value))
      })
    }

    if (ui.vol) {
      ui.vol.addEventListener('input', function () {
        if (!ap) return
        ap.volume(Math.round(parseFloat(this.value) * 100), false)
      })
    }
    if (ui.mute) {
      ui.mute.addEventListener('click', function () {
        if (!ap || !ap.audio) return
        var a = ap.audio
        var silent = a.muted || a.volume === 0
        if (silent) {
          a.muted = false
          ap.volume(70, false)
          if (ui.vol) ui.vol.value = 0.7
        } else {
          ap.volume(0, false)
          if (ui.vol) ui.vol.value = 0
        }
        var icon = this.querySelector('i')
        if (icon) icon.className = 'fas ' + (silent ? 'fa-volume-high' : 'fa-volume-xmark')
      })
    }

    if (ui.filter) {
      ui.filter.addEventListener('input', function () {
        filter = this.value || ''
        /* 换关键词等于换了一批结果：强制回第 1 页。
           不重置的话，页码会被 buildList 的规则 2「夹到最后一页」，
           用户看到的是列表跳到中段，像 bug 而不像搜索。 */
        page = 0
        pageLocked = false
        buildList()
        scrollListToTop()
      })
    }

    if (ui.pickbtn) {
      ui.pickbtn.addEventListener('click', function (ev) {
        // 阻止冒泡，否则同一次点击立刻被 onDocClick 判成「点在外面」而收起
        ev.stopPropagation()
        togglePicker()
      })
    }
  }


  /* ---------- 绑定 APlayer 事件 ---------- */
  function bind () {
    if (bound || !ap || !ap.on) return
    bound = true
    ap.on('play', function () { renderPlay(); startBeat() })
    ap.on('pause', function () { renderPlay(); stopBeat(); syncLrc() })
    ap.on('timeupdate', renderProgress)
    ap.on('loadeddata', function () { renderMeta(); renderProgress(); loadLrc() })
    ap.on('canplay', function () { renderMeta(); renderProgress(); loadLrc() })
    /* listswitch 在「切歌 / 切歌单」时都会来；listclear 只在清空时来。
       两者都走 renderAll 兜底：即便切歌单时 APlayer 没派发 listswitch，
       曲目信息与列表高亮也不会停在旧数据上。 */
    ap.on('listswitch', function () {
      setTimeout(function () {
        renderAll()
        // 切歌后当前曲目可能翻到别的页，列表要跟着翻过去（用户手动翻页时规则 0 会拦住）
        buildList()
      }, 40)
    })
    ap.on('listclear', function () {
      setTimeout(function () {
        ui.rows = []
        renderAll()
      }, 40)
    })
  }

  /* ---------- 曲目数据源 ---------- */
  function readPlaylists () {
    if (!ui.playsEl) return []
    try {
      var data = JSON.parse(ui.playsEl.textContent || '[]')
      if (Array.isArray(data)) return data
    } catch (e) {}
    return []
  }

  /* 找到 APlayer 当前装的是哪个歌单，只用于「高亮」。
     这里只做一种推断：首屏实例由 inject 里的 data-id 建出来，
     而那个 data-id 就是配置的第一项（见 _config.butterfly.yml 的注释）。
     实例里还没有曲目时（接口挂了/还在拉）保持 -1 —— 比瞎猜一个更诚实。 */
  function markActive () {
    if (!playlists.length) return
    activeIndex = list().length ? 0 : -1
    paintPicker()
  }

  /* ---------- 初始化 ---------- */
  function init () {
    if (!document.querySelector('.page.type-music .bmpg')) return
    live = true
    syncFooter()

    ui.player = document.getElementById('bmpg-player')
    if (!ui.player) return
    ui.disc = document.getElementById('bmpg-disc')
    ui.art = document.getElementById('bmpg-art')
    ui.name = document.getElementById('bmpg-name')
    ui.artist = document.getElementById('bmpg-artist')
    ui.seek = document.getElementById('bmpg-seek')
    ui.ptime = document.getElementById('bmpg-ptime')
    ui.dtime = document.getElementById('bmpg-dtime')
    ui.play = document.getElementById('bmpg-play')
    ui.prev = document.getElementById('bmpg-prev')
    ui.next = document.getElementById('bmpg-next')
    ui.shuffle = document.getElementById('bmpg-shuffle')
    ui.mute = document.getElementById('bmpg-mute')
    ui.vol = document.getElementById('bmpg-vol')
    ui.status = document.getElementById('bmpg-status')
    ui.list = document.getElementById('bmpg-list')
    ui.count = document.getElementById('bmpg-count')
    ui.filter = document.getElementById('bmpg-filter')
    ui.pager = document.getElementById('bmpg-pager')
    ui.lrc = document.getElementById('bmpg-lrc')
    ui.lrcBox = document.getElementById('bmpg-lrc-box')
    ui.lrcPanel = document.querySelector('[data-bmpg-panel="lrc"]')
    ui.tabs = document.querySelectorAll('[data-bmpg-tab]')
    ui.panels = document.querySelectorAll('[data-bmpg-panel]')
    ui.picker = document.querySelector('.bmpg-picker')
    ui.pickbtn = document.getElementById('bmpg-pickbtn')
    ui.pickname = document.getElementById('bmpg-pickname')
    ui.pickmenu = document.getElementById('bmpg-pickmenu')
    ui.playsEl = document.getElementById('bmpg-playlists')

    /* 兜底实例的挂载点：单独给一个 0 尺寸容器，
       不塞进卡片里，避免 APlayer 的样式影响本页布局。
       它随 #body-wrap 一起被 pjax 替换，不会残留。 */
    ui.host = document.getElementById('bmpg-host')
    if (!ui.host) {
      ui.host = document.createElement('div')
      ui.host.id = 'bmpg-host'
      if (ui.player && ui.player.parentNode) ui.player.parentNode.insertBefore(ui.host, ui.player)
    }

    ui.rows = []
    ui.playingState = null      // 未知态：首次 renderPlay 必须真写一次 DOM
    lrcRows = []; lrcTimes = []; lrcActive = -1; lrcTrackKey = ''
    switching = false
    adopting = false
    switchToken++               // 作废上一次页面遗留的请求

    playlists = readPlaylists()
    paintPicker()
    wire()
    setLrcHint('正在载入歌词…')

    boot()
    /* 进页面时若音乐已在播放（从别的页切来、或左下角按钮刚点过），
       事件早已派发完毕，这里补一次渲染并起表。 */
    if (ap && ap.audio && !ap.audio.paused) { renderPlay(); startBeat() }
    if (!timer) timer = setInterval(boot, 300)
  }

  function teardown () {
    live = false
    stopBeat()
    if (timer) { clearInterval(timer); timer = null }
    unbindDoc()
  }

  if (document.readyState !== 'loading') init()
  else document.addEventListener('DOMContentLoaded', init)

  /* pjax 换页：#body-wrap 整块被换掉，上面的 DOM 引用全部失效，必须重建。
     ⚠️ 时机：pjax 的 handle-response 先 switchSelectors 再 trigger
        pjax:complete，但那段替换是【异步】的（doRequest 之后走
        等图片/脚本的链路）。也就是说事件到达时，#body-wrap 有可能
        还是【旧页面】、也可能已经是【新页面】。
        所以不能在这里直接 document.querySelector('.bmpg') 判页 ——
        那会把「从首页点进 /music/」误判成「正在离开音乐页」，
        把音乐页的初始化整个跳掉，页面永远停在「加载中…」。
        下面这个 afterBodyWrap 就是等真正换完之后再判。 */
  function afterBodyWrap (fn) {
    var next = document.getElementById('body-wrap')
    if (next && next !== lastBodyWrap) { lastBodyWrap = next; fn(); return }
    var n = 0
    ;(function loop () {
      var cur = document.getElementById('body-wrap')
      if (cur !== lastBodyWrap) { lastBodyWrap = cur; fn(); return }
      if (++n > 100) return            // ≈3s 还没换：放弃，下次再来
      setTimeout(loop, 30)
    })()
  }

  var lastBodyWrap = document.getElementById('body-wrap')

  document.addEventListener('pjax:complete', function () {
    afterBodyWrap(function () {
      if (!document.querySelector('.page.type-music .bmpg')) {
        // 离开音乐页：页脚由 page_footer.js 统一还回去（它是 #body-wrap 的
        // 兄弟节点，pjax 不会自己补），这里只需停掉本页的心跳与轮询。
        syncFooter()
        teardown()
        return
      }
      live = true
      bound = false
      tries = 0
      ap = null
      /* pjax 后分页状态回到第一页：否则「在第 3 页 → 去别的页 → 再回 /music/」
         会停在第 3 页，而高亮可能是第 1 页的曲子，两边对不上。 */
      page = 0
      pageLocked = false
      setTimeout(init, 300)
    })
  })

  /* 直达首页/文章页时本脚本也会加载：那些页面页脚必须是好的。
     page_footer.js 进来时已自跑一次，这里再补一拍是因为
     pjax 之外还有「主题异步补渲染 #footer」的情况；幂等，多调无害。 */
  if (document.readyState !== 'loading') syncFooter()
  else document.addEventListener('DOMContentLoaded', syncFooter)

  window.addEventListener('pagehide', teardown)
})()

