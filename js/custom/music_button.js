/* ============================================================
 * Biko · 音乐启动按钮 + 圆角播放面板
 * 左列音符按钮：点击展开圆角小框（APlayer 为隐藏音频引擎）。
 * 面板：旋转唱片 / 歌名歌手 / 进度 / 随机·上下首·播放·音量
 * ============================================================ */
(function () {
  var launcher, panel
  var bound = false
  var ui = {}
  var shuffle = false
  var lastVol = 0.7

  function ap() { return window.__BIKO_AP__ || null }
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
    var playing = !a.audio.paused
    ui.play.innerHTML = '<i class="fas ' + (playing ? 'fa-pause' : 'fa-play') + '"></i>'
  }
  function renderStatus() {
    var a = ap()
    if (!a || !ui.status) return
    var label = shuffle ? '随机播放' : '列表循环'
    ui.status.textContent = label + ' · ' + (a.list.index + 1) + '/' + a.list.audios.length
  }
  function renderAll() { renderMeta(); renderProgress(); renderPlayBtn(); renderStatus() }

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
    })
    a.on('pause', function () {
      panel.classList.remove('playing')
      launcher.classList.remove('is-playing')
      renderPlayBtn()
    })
    a.on('timeupdate', renderProgress)
    a.on('loadeddata', function () { renderMeta(); renderProgress() })
    a.on('canplay', function () { renderMeta(); renderProgress() })
    a.on('listswitch', function () { setTimeout(renderAll, 40) })
    a.on('volumechange', function () {
      if (ui.volRange) ui.volRange.value = a.audio.muted ? 0 : a.audio.volume
    })
    renderAll()
  }

  /* ---------- 面板开关 ---------- */
  function openPanel() {
    panel.classList.add('open')
    document.body.classList.add('biko-music-open')
  }
  function closePanel() {
    panel.classList.remove('open')
    document.body.classList.remove('biko-music-open')
  }

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
    ui.play.addEventListener('click', function () {
      var a = ap()
      if (!a) return
      if (a.audio.paused) { var p = a.play(); if (p && p.catch) p.catch(function () {}) } else a.pause()
    })
    panel.querySelector('#bmp-back').addEventListener('click', function () { var a = ap(); if (a) a.skipBack() })
    panel.querySelector('#bmp-forward').addEventListener('click', function () { var a = ap(); if (a) a.skipForward() })
    panel.querySelector('#bmp-shuffle').addEventListener('click', function () {
      var a = ap()
      if (!a) return
      shuffle = !shuffle
      try { a.setMode(shuffle ? 'random' : 'circulation') } catch (e) {}
      this.classList.toggle('is-active', shuffle)
      renderStatus()
    })
    ui.seek.addEventListener('input', function () {
      var a = ap()
      if (a) a.seek(parseFloat(this.value))
    })
    ui.volRange.addEventListener('input', function () {
      var a = ap()
      if (!a) return
      var v = parseFloat(this.value)
      if (v > 0) lastVol = v
      a.volume(Math.round(v * 100), false)
    })
    panel.querySelector('#bmp-mute').addEventListener('click', function () {
      var a = ap()
      if (!a) return
      var icon = this.querySelector('i')
      if (a.audio.volume > 0 && !a.audio.muted) {
        lastVol = a.audio.volume
        a.volume(0, false)
      } else {
        a.volume(Math.round(lastVol * 100), false)
      }
      setTimeout(function () {
        if (icon) icon.className = 'fas ' + (a.audio.volume > 0 && !a.audio.muted ? 'fa-volume-high' : 'fa-volume-xmark')
      }, 60)
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
      var isOpen = panel.classList.contains('open')
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
        } catch (err) {}
      }
    })
    side.appendChild(launcher)
  }

  function boot() {
    buildPanel()
    mountLauncher()
    bindAp()
  }
  // 轮询等待 #rightside 与 APlayer 就绪
  var tries = 0
  var timer = setInterval(function () {
    boot()
    if ((document.getElementById('music-toggle') && bound) || ++tries > 60) clearInterval(timer)
  }, 300)
  boot()
  document.addEventListener('pjax:complete', function () { setTimeout(boot, 350) })
})()
