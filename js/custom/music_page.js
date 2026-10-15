/* ============================================================
 * Biko · 独立音乐页控制器 /music/
 * ------------------------------------------------------------
 * 设计要点：
 *   1. 复用全站唯一的 APlayer 实例（window.__BIKO_AP__），不新建播放器，
 *      因此天然保证「同时只播放一个歌单」。
 *   2. 若实例还没就绪（APlayer 异步加载中），轮询等待，最多约 15 秒。
 *   3. 所有 APlayer 事件回调里先判 live，页面切走后不再操作 DOM。
 * ============================================================ */
(function () {
  'use strict'

  var live = true
  var ap = null
  var bound = false
  var timer = null
  var tries = 0
  var MAX_TRIES = 50          // 50 * 300ms = 15s
  var filter = ''
  var ui = {}

  /* ---------- 工具 ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n }
  function fmt(s) {
    if (!isFinite(s) || s < 0) return '0:00'
    var m = Math.floor(s / 60)
    return m + ':' + pad(Math.floor(s % 60))
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }
  function list() { return (ap && ap.list && ap.list.audios) || [] }
  function idx() { return (ap && ap.list && ap.list.index) || 0 }
  function track() { return list()[idx()] || {} }

  /* ---------- 播放器就绪 ---------- */
  function getAP() {
    return window.__BIKO_AP__ || null
  }

  function boot() {
    if (!live) return
    ap = getAP()
    if (ap && ap.list && ap.list.audios && ap.list.audios.length) {
      clearInterval(timer); timer = null
      buildList()
      bind()
      renderAll()
      return
    }
    if (++tries > MAX_TRIES) {
      clearInterval(timer); timer = null
      if (ui.status) ui.status.textContent = '播放器没能加载出来，刷新页面再试试～'
    }
  }

  /* ---------- 渲染 ---------- */
  function renderMeta() {
    if (!live || !ui.art) return
    var t = track()
    ui.art.style.backgroundImage = t.cover ? "url('" + t.cover + "')" : ''
    ui.name.textContent = t.name || '未知曲目'
    ui.artist.textContent = t.artist || '未知艺术家'
  }
  function renderProgress() {
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
  }
  function renderPlay() {
    if (!live || !ui.play || !ap) return
    var playing = ap.audio && !ap.audio.paused
    ui.play.innerHTML = '<i class="fas ' + (playing ? 'fa-pause' : 'fa-play') + '"></i>'
    ui.play.setAttribute('aria-label', playing ? '暂停' : '播放')
    if (ui.player) ui.player.classList.toggle('playing', !!playing)
  }
  function renderStatus() {
    if (!live || !ui.status || !ap) return
    var n = list().length
    ui.status.textContent = n ? ('第 ' + (idx() + 1) + ' / ' + n + ' 首') : '歌单是空的'
  }
  function renderActive() {
    if (!live) return
    var cur = idx()
    for (var i = 0; i < ui.rows.length; i++) {
      ui.rows[i].classList.toggle('on', Number(ui.rows[i].getAttribute('data-i')) === cur)
    }
  }
  function renderAll() { renderMeta(); renderProgress(); renderPlay(); renderStatus(); renderActive() }
  /* ---------- 绑定 APlayer 事件 ---------- */
  function bind() {
    if (bound || !ap || !ap.on) return
    bound = true
    ap.on('play', function () { renderPlay(); })
    ap.on('pause', function () { renderPlay(); })
    ap.on('timeupdate', renderProgress)
    ap.on('loadeddata', function () { renderMeta(); renderProgress() })
    ap.on('canplay', function () { renderMeta(); renderProgress() })
    ap.on('listswitch', function () { setTimeout(renderAll, 40) })
    ap.on('volumechange', function () {
      if (ui.vol && ap.audio) ui.vol.value = ap.audio.muted ? 0 : ap.audio.volume
    })
  }

  /* ---------- 歌单列表 ---------- */
  function durOf(t) {
    var d = t && (t.duration != null ? t.duration : t.durationRaw)
    if (typeof d === 'number' && isFinite(d)) return fmt(d)
    return ''
  }
  function buildList() {
    if (!live || !ui.list) return
    var arr = list()
    var kw = filter.trim().toLowerCase()
    var html = ''
    var shown = 0
    ui.rows = []

    for (var i = 0; i < arr.length; i++) {
      var t = arr[i] || {}
      var title = t.name || '未知曲目'
      var artist = t.artist || ''
      if (kw && (title + ' ' + artist).toLowerCase().indexOf(kw) < 0) continue
      shown++
      html +=
        '<li>' +
        '<button class="bmpg-item" type="button" data-i="' + i + '">' +
        '<span class="idx">' + (i + 1) + '</span>' +
        '<span class="cover"' + (t.cover ? ' style="background-image:url(\'' + esc(t.cover) + '\')"' : '') + '></span>' +
        '<span class="txt">' +
        '<span class="nm">' + esc(title) + '</span>' +
        '<span class="ar">' + esc(artist) + '</span>' +
        '</span>' +
        '<span class="dur">' + esc(durOf(t)) + '</span>' +
        '</button></li>'
    }

    if (!shown) {
      ui.list.innerHTML = '<li class="bmpg-empty">' +
        (kw ? '没有匹配「' + esc(filter) + '」的歌曲' : '歌单还是空的') + '</li>'
      ui.rows = []
    } else {
      ui.list.innerHTML = html
      ui.rows = Array.prototype.slice.call(ui.list.querySelectorAll('.bmpg-item'))
      for (var k = 0; k < ui.rows.length; k++) {
        ui.rows[k].addEventListener('click', onPick)
      }
    }
    if (ui.count) ui.count.textContent = shown + ' 首'
    renderActive()
  }

  function onPick() {
    if (!live || !ap) return
    var i = Number(this.getAttribute('data-i'))
    if (!isFinite(i)) return
    /* 同一首再点就切换播放/暂停，符合直觉 */
    if (i === idx()) {
      toggle()
      return
    }
    ap.list.switch(i)
    var p = ap.play()
    if (p && p.catch) p.catch(function () {})
    setTimeout(renderAll, 60)
  }

  function toggle() {
    if (!ap || !ap.audio) return
    if (ap.audio.paused) {
      var p = ap.play()
      if (p && p.catch) p.catch(function () {})
    } else ap.pause()
  }
  /* ---------- 控制条事件 ---------- */
  function wire() {
    if (ui.play) ui.play.addEventListener('click', toggle)
    if (ui.prev) ui.prev.addEventListener('click', function () { if (ap) ap.skipBack() })
    if (ui.next) ui.next.addEventListener('click', function () { if (ap) ap.skipForward() })

    if (ui.shuffle) {
      ui.shuffle.addEventListener('click', function () {
        if (!ap) return
        var on = !this.classList.contains('is-active')
        this.classList.toggle('is-active', on)
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
        } else {
          ap.volume(0, false)
        }
        var icon = this.querySelector('i')
        if (icon) icon.className = 'fas ' + (silent ? 'fa-volume-high' : 'fa-volume-xmark')
      })
    }

    if (ui.filter) {
      ui.filter.addEventListener('input', function () {
        filter = this.value || ''
        buildList()
      })
    }
  }

  /* ---------- 初始化 ---------- */
  function init() {
    ui.player = document.getElementById('bmpg-player')
    if (!ui.player) return
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
    ui.rows = []

    wire()
    boot()
    if (!timer) timer = setInterval(boot, 300)
  }

  function teardown() {
    live = false
    if (timer) { clearInterval(timer); timer = null }
  }

  if (document.readyState !== 'loading') init()
  else document.addEventListener('DOMContentLoaded', init)

  /* APlayer 是异步注入的，pjax 换页后再补一次 */
  document.addEventListener('pjax:complete', function () {
    live = true
    bound = false
    tries = 0
    setTimeout(init, 300)
  })
  window.addEventListener('pagehide', teardown)
})()
