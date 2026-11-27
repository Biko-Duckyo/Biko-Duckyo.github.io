/* ============================================================
 * Biko · 音乐启动按钮 + 圆角播放面板
 * 左列音符按钮：点击展开圆角小框（APlayer 为隐藏音频引擎）。
 * 面板：旋转唱片 / 歌名歌手 / 进度 / 随机·上下首·播放·音量
 * ============================================================ */
(function () {
  /* 幂等守卫：带 data-pjax 的脚本在 pjax 换页时可能被重复 eval，
     只保留首份闭包，避免重复注册 pjax 监听 / 定时器 / 按钮绑定。
     注意牌子名与 music_page.js 独立，二者互不阻断。 */
  if (window.__BIKO_BT_BOOTED) return
  window.__BIKO_BT_BOOTED = true

  var launcher, panel
  var bound = false
  var ui = {}
  var lastVol = 0.7

  function ap() { return window.__BIKO_AP__ || null }
  /* 顺序模式以实例 options.order 为唯一真相（'random' | 'list'），不另存本地变量；
     APlayer 的 setMode() 只切换 mini/normal 尺寸，不能用来切随机/循环。 */
  function isRandom(a) { return !!a && a.options && a.options.order === 'random' }
  function pad(n) { return (n < 10 ? '0' : '') + n }
  function fmt(s) {
    if (!isFinite(s) || s < 0) return '0:00'
    var m = Math.floor(s / 60)
    var sec = Math.floor(s % 60)
    return m + ':' + pad(sec)
  }
  function cur() {
    var a = ap()
    if (!a || !a.list) return {}
    return a.list.audios[a.list.index] || {}
  }

  /* ---------- 渲染 ---------- */
  function renderMeta() {
    var a = ap()
    if (!a || !ui.disc) return
    var t = cur()
    ui.disc.style.backgroundImage = t.cover ? "url('" + t.cover + "')" : ''
    ui.disc.setAttribute('data-n', String(a.list.index + 1))
    ui.title.textContent = t.name || '未知曲目'
    ui.artist.textContent = t.artist || '未知艺术家'
  }
  function renderProgress() {
    var a = ap()
    if (!a || !ui.seek) return
    var au = a.audio
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
  }
  function renderPlayBtn() {
    var a = ap()
    if (!a || !ui.play) return
    var playing = !!(a.audio && !a.audio.paused)
    /* 幂等：只在状态真的变了才更新 DOM */
    if (playing === ui._lastPlaying) return
    ui._lastPlaying = playing
    ui.play.innerHTML = '<i class="fas ' + (playing ? 'fa-pause' : 'fa-play') + '"></i>'
  }
  function renderStatus() {
    var a = ap()
    if (!a || !ui.status || !a.list || !a.list.audios) return
    var label = isRandom(a) ? '随机播放' : '列表循环'
    ui.status.textContent = label + ' · ' + (a.list.index + 1) + '/' + a.list.audios.length
  }
  /* 顺序按钮高亮 / 静音图标与滑块都从实例状态回读，保证与音乐页一致 */
  function renderModeUI() {
    var a = ap()
    var btn = document.getElementById('bmp-shuffle')
    if (!btn) return
    var on = !!isRandom(a)
    btn.classList.toggle('is-active', on)
    btn.setAttribute('aria-pressed', on ? 'true' : 'false')
  }
  function renderVolumeUI() {
    var a = ap()
    if (!a || !a.audio) return
    var muted = !!a.audio.muted || a.audio.volume === 0
    if (ui.volRange) ui.volRange.value = a.audio.muted ? 0 : a.audio.volume
    var muteBtn = document.getElementById('bmp-mute')
    if (muteBtn) {
      var icon = muteBtn.querySelector('i')
      if (icon) icon.className = 'fas ' + (muted ? 'fa-volume-xmark' : 'fa-volume-high')
    }
  }
  function renderAll() { renderMeta(); renderProgress(); renderPlayBtn(); renderModeUI(); renderVolumeUI(); renderStatus() }

  /* ---------- 播放状态心跳 ----------
   * 与 /music/ 页同一个坑：APlayer 的 play/pause 事件是后置的（要等
   * audio.play() 的 Promise 落定才派发），所以「点了按钮图标不翻」会出现。
   * 这里以 audio.paused 为唯一真相，趁 timeupdate 顺带校准一次 ——
   * 播放中 APlayer 每 ~250ms 就会派发一次 timeupdate，等于白送的心跳，
   * 不需要另开定时器；只有在 timeupdate 断供的极端情况下才补一个兜底表。 */
  var beat = null
  function startBeat() { if (!beat) beat = setInterval(renderPlayBtn, 500) }
  function stopBeat() { if (beat) { clearInterval(beat); beat = null } }

  /* ---------- 绑定 APlayer 事件 ---------- */
  function bindAp() {
    if (bound) return
    var a = ap()
    if (!a) return
    bound = true
    a.on('play', function () {
      panel.classList.add('playing')
      launcher.classList.add('is-playing')
      renderPlayBtn()
      startBeat()
    })
    a.on('pause', function () {
      panel.classList.remove('playing')
      launcher.classList.remove('is-playing')
      renderPlayBtn()
      stopBeat()
    })
    a.on('timeupdate', function () { renderProgress(); renderPlayBtn() })
    a.on('loadeddata', function () { renderMeta(); renderProgress() })
    a.on('canplay', function () { renderMeta(); renderProgress() })
    a.on('listswitch', function () { setTimeout(renderAll, 40) })
    a.on('volumechange', function () { renderVolumeUI() })
    /* 首次渲染：ui._lastPlaying 为 null，首次比较必然触发真写 */
    renderAll()
  }

  /* ---------- 面板开关 ---------- */
  function isMusicPage() { return /\/music\/?/.test(location.pathname) }
  function openPanel() {
    if (!panel) return
    /* R3 双保险：音乐页是整屏播放器，任何路径都不展开小面板（只拦展开，不碰播放状态） */
    if (isMusicPage()) return
    panel.classList.add('open')
    document.body.classList.add('biko-music-open')
  }
  function closePanel() {
    /* 守卫：pjax 回调可能早于 buildPanel() 创建闭包 panel，此时无可收的 DOM，直接返回 */
    if (!panel) return
    panel.classList.remove('open')
    document.body.classList.remove('biko-music-open')
  }
  /* R2：换页即收起面板卡片。只切 class，绝不调 ap.pause()；
     launcher 的 is-playing 旋转态由下方 bindAp 的 play/pause 事件独立驱动，
     播放转、暂停停，与面板是否展开无关。 */
  function syncPanelRoute() { closePanel() }

  /* ---------- 构建面板 ---------- */
  var PANEL_HTML =
    '<div class="bmp-card">' +
      '<div class="bmp-topline">' +
        '<div class="bmp-disc" id="bmp-disc"></div>' +
        '<div class="bmp-meta">' +
          '<span class="bmp-kicker">给今天一点旋律</span>' +
          '<span class="bmp-title" id="bmp-title"></span>' +
          '<span class="bmp-artist" id="bmp-artist"></span>' +
        '</div>' +
        '<button class="bmp-collapse" id="bmp-collapse" type="button" title="收起"><i class="fas fa-chevron-down"></i></button>' +
      '</div>' +
      '<div class="bmp-progress-row">' +
        '<span id="bmp-ptime">0:00</span>' +
        '<input class="bmp-progress" id="bmp-seek" type="range" min="0" max="0" step="0.1" value="0">' +
        '<span id="bmp-dtime">0:00</span>' +
      '</div>' +
      '<div class="bmp-controls">' +
        '<button id="bmp-shuffle" type="button" title="随机播放"><i class="fas fa-random"></i></button>' +
        '<button id="bmp-back" type="button" title="上一首"><i class="fas fa-backward-step"></i></button>' +
        '<button class="bmp-play" id="bmp-play" type="button" title="播放"></button>' +
        '<button id="bmp-forward" type="button" title="下一首"><i class="fas fa-forward-step"></i></button>' +
        '<span class="bmp-volume">' +
          '<button id="bmp-mute" type="button" title="静音"><i class="fas fa-volume-high"></i></button>' +
          '<input id="bmp-vol" type="range" min="0" max="1" step="0.01" value="0.7">' +
        '</span>' +
      '</div>' +
      '<p class="bmp-status" id="bmp-status"></p>' +
    '</div>'

  function buildPanel() {
    if (document.getElementById('biko-music-panel')) return
    panel = document.createElement('div')
    panel.id = 'biko-music-panel'
    panel.innerHTML = PANEL_HTML
    document.body.appendChild(panel)
    ui.disc = panel.querySelector('#bmp-disc')
    ui.title = panel.querySelector('#bmp-title')
    ui.artist = panel.querySelector('#bmp-artist')
    ui.seek = panel.querySelector('#bmp-seek')
    ui.ptime = panel.querySelector('#bmp-ptime')
    ui.dtime = panel.querySelector('#bmp-dtime')
    ui.play = panel.querySelector('#bmp-play')
    ui.status = panel.querySelector('#bmp-status')
    ui.volRange = panel.querySelector('#bmp-vol')

    panel.querySelector('#bmp-collapse').addEventListener('click', closePanel)
    ui._lastPlaying = null      // 上次渲染的状态（用于幂等判断）
    ui.play.addEventListener('click', function () {
      var a = ap()
      if (!a) return
      if (a.audio.paused) {
        var p = a.play()
        if (p && p.catch) p.catch(function () {})
        /* 乐观翻转 + 起表，让图标立刻跟手（理由见 startBeat 处注释）；
           幂等比较用 ui._lastPlaying，见 renderPlayBtn() */
        renderPlayBtn()
        startBeat()
      } else {
        a.pause()
        renderPlayBtn()
        stopBeat()
      }
    })
    panel.querySelector('#bmp-back').addEventListener('click', function () { var a = ap(); if (a) a.skipBack() })
    panel.querySelector('#bmp-forward').addEventListener('click', function () { var a = ap(); if (a) a.skipForward() })
    panel.querySelector('#bmp-shuffle').addEventListener('click', function () {
      var a = ap()
      if (!a || !a.options) return
      a.options.order = isRandom(a) ? 'list' : 'random'
      renderModeUI()
      renderStatus()
    })
    ui.seek.addEventListener('input', function () {
      var a = ap()
      if (a) a.seek(parseFloat(this.value))
    })
    ui.volRange.addEventListener('input', function () {
      var a = ap()
      if (!a || !a.audio) return
      var v = parseFloat(this.value)
      if (v > 0) lastVol = v
      if (a.audio.muted) a.audio.muted = false
      a.volume(Math.round(v * 100), false)
    })
    panel.querySelector('#bmp-mute').addEventListener('click', function () {
      var a = ap()
      if (!a || !a.audio) return
      var muted = !!a.audio.muted || a.audio.volume === 0
      if (!muted) {
        if (a.audio.volume > 0) lastVol = a.audio.volume
        a.volume(0, false)
      } else {
        a.audio.muted = false
        a.volume(Math.round(lastVol * 100) || 70, false)
      }
      renderVolumeUI()
    })
  }

  /* ---------- 启动按钮（并入 #rightside） ---------- */
  function mountLauncher() {
    var side = document.getElementById('rightside')
    if (!side || document.getElementById('music-toggle')) return
    launcher = document.createElement('button')
    launcher.type = 'button'
    launcher.id = 'music-toggle'
    launcher.title = '播放音乐'
    launcher.innerHTML = '<i class="fas fa-music"></i>'
    launcher.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      /* 音乐页面本身就是全页播放器，不展开小面板 */
      if (/\/music\/?/.test(location.pathname)) return
      var isOpen = !!(panel && panel.classList.contains('open'))
      // 「点击音乐按钮才播放」：只有用户点左下角音符按钮时才驱动播放，
      // 且必须由这个真实用户手势同步触发，才能满足浏览器自动播放策略。
      if (isOpen) {
        closePanel()
        return
      }
      openPanel()
      var a = ap()
      if (a && a.audio.paused) {
        try {
          var p = a.play()
          if (p && p.catch) p.catch(function () {})
          /* 乐观翻转：和面板内播放按钮保持同一逻辑（幂等比较走 _lastPlaying） */
          renderPlayBtn()
          startBeat()
        } catch (err) {}
      }
    })
    side.appendChild(launcher)
  }

  function boot() {
    buildPanel()
    mountLauncher()
    bindAp()
    /* 面板可能比 APlayer 实例晚/早一步就位：每次 boot 都同步一次状态。
       已在播（比如从 /music/ 点过来的）就补上图标与心跳，
       暂停中则保证表是停的。 */
    var a = ap()
    if (a && a.audio) {
      renderAll()
      /* R4：首帧把按钮旋转态也按真实播放态校准（播放转、暂停停），不依赖一次新事件 */
      if (launcher) launcher.classList.toggle('is-playing', !a.audio.paused)
      if (a.audio.paused) { stopBeat() } else { startBeat() }
    }
    /* 注意：同页内 boot 重试（实例晚到、bindAp 重绑）不调用 closePanel，
       避免把用户手动展开的面板又关掉；路由收敛只放在下方 pjax:complete。 */
  }
  // 轮询等待 #rightside 与 APlayer 就绪
  var tries = 0
  var timer = setInterval(function () {
    boot()
    if ((document.getElementById('music-toggle') && bound) || ++tries > 60) clearInterval(timer)
  }, 300)
  boot()
  document.addEventListener('pjax:complete', function () {
    /* R2：换页先收起面板，避免展开态随 body 常驻节点残留；
       300ms 再兜一次（pjax 替换异步），随后 boot 重建图标与心跳。 */
    syncPanelRoute()
    setTimeout(syncPanelRoute, 300)
    setTimeout(boot, 350)
  })
})()
