/* ============================================================
 * Biko · 独立页（/music/ · /books/）明暗切换
 * ------------------------------------------------------------
 * 独立页 layout: false，不加载主题脚本，因此没有 btf.activateDarkMode，
 * 也没有 nav.js 那套 switchNightMode（星球旋转动画）。
 *
 * 本脚本做两件事：
 *   1. 用与主站【完全同构】的方式切主题：
 *      <html data-theme="light|dark">，localStorage 键固定为 "theme"
 *      （与 butterfly 主题同键、同值域，所以两边偏好天然互通）
 *   2. 首次进入时读回偏好；若没有任何记录，则跟随系统 prefers-color-scheme
 *
 * 同时暴露 window.switchNightMode，签名与主站一致，
 * 这样按钮/右键菜单/快捷键都能共用同一套调用方式。
 * ============================================================ */
(function () {
  'use strict'

  var KEY = 'theme'                 // ⚠️ 必须与 butterfly 主题保持一致
  var DARK = 'dark'
  var LIGHT = 'light'
  var root = document.documentElement

  /* 主题在 <head> 里同步执行过（见各页内联脚本），这里只做兜底 */
  function current() {
    return root.getAttribute('data-theme') === DARK ? DARK : LIGHT
  }

  function prefersDark() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (e) { return false }
  }

  /* 读取偏好：localStorage → 系统 → 浅色 */
  function readPref() {
    var v = null
    try { v = localStorage.getItem(KEY) } catch (e) { /* 隐私模式下可能抛错 */ }
    if (v === DARK || v === LIGHT) return v
    return prefersDark() ? DARK : LIGHT
  }

  function persist(v) {
    try { localStorage.setItem(KEY, v) } catch (e) { /* 忽略写入失败 */ }
  }

  /* 无动画地立即套用（首次渲染前调用，避免闪白） */
  function apply(v) {
    root.setAttribute('data-theme', v === DARK ? DARK : LIGHT)
    syncMeta()
  }

  /* 与主题 meta_theme_color_light / meta_theme_color_dark 同值 */
  function syncMeta() {
    var m = document.querySelector('meta[name="theme-color"]')
    if (m) m.setAttribute('content', current() === DARK ? '#0d1018' : '#f2f5fa')
  }

  /* ---------- 星球旋转动画（复刻主站 nav.js 的时序，观感一致） ---------- */
  var playing = false
  function playSky() {
    if (playing) return
    playing = true
    if (!document.getElementsByClassName('Cuteen_DarkSky')[0]) {
      document.body.insertAdjacentHTML('beforeend',
        '<div class="Cuteen_DarkSky"><div class="Cuteen_DarkPlanet"></div></div>')
    }
    var sky = document.getElementsByClassName('Cuteen_DarkSky')[0]
    // 盖住动画：1s 后切主题，再等 0.9s 淡出，总时长与主站一致
    setTimeout(function () {
      apply(current() === DARK ? LIGHT : DARK)
      persist(current())
      setTimeout(function () {
        if (!sky) { playing = false; return }
        sky.style.transition = 'opacity 1.2s'
        sky.style.opacity = '0'
        setTimeout(function () {
          if (sky && sky.parentNode) sky.parentNode.removeChild(sky)
          playing = false
        }, 1300)
      }, 900)
    }, 1000)
  }

  var reduceMotion = false
  try {
    reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch (e) { /* 忽略 */ }

  /* 对外统一入口：与主站 window.switchNightMode 同名同义 */
  window.switchNightMode = function () {
    if (playing) return
    // 尊重「减少动态效果」：直接切换，不播动画
    if (reduceMotion) {
      apply(current() === DARK ? LIGHT : DARK)
      persist(current())
      return
    }
    playSky()
  }

  /* ---------- 初始化 ---------- */
  function boot() {
    apply(readPref())
    // 系统主题变化时：仅在用户没有显式选择过的情况下跟随
    if (window.matchMedia) {
      var mq
      try { mq = window.matchMedia('(prefers-color-scheme: dark)') } catch (e) { mq = null }
      if (mq && mq.addEventListener) {
        mq.addEventListener('change', function (e) {
          var saved = null
          try { saved = localStorage.getItem(KEY) } catch (err) { /* 忽略 */ }
          if (saved === DARK || saved === LIGHT) return   // 用户手动选过，不跟随
          apply(e.matches ? DARK : LIGHT)
        })
      }
    }
  }

  /* 脚本带 defer / 放在 body 末尾，DOM 已可操作 */
  boot()

  /* 暴露给测试与其它脚本复用 */
  window.__BIKO_SUBPAGE_THEME__ = {
    apply: apply,
    current: current,
    readPref: readPref
  }
})()
