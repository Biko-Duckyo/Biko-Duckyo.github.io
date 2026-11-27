/**
 * 404 页魔改：把主题默认的「左图右大字」换成参照 Dstudio「402+2」的构图
 *   —— 大圆角卡 + 三色块状 404 + 散落碎片 + 圆形返回钮
 *
 * 设计约束：
 *   - 不改 node_modules 里的主题源码，只在运行时改造 .error-content 内部
 *   - 幂等：重复执行（pjax 重进）不会叠加内容
 *   - 零白屏风险：样式只对 data-biko404="1" 生效，脚本失败就退回主题默认 404
 *   - 碎片用固定 seed 生成，刷新不变（否则每次 404 都长不一样，像抽奖）
 *   - 原 h1「404」保留（视觉隐藏），无障碍与 SEO 仍有一份纯文本
 */
;(function () {
  'use strict'

  var SEED = 20261110

  /* 线性同余，够用且跨浏览器一致 */
  function lcg(seed) {
    var s = seed >>> 0
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0
      return s / 4294967296
    }
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  /* 几何形「4」：斜干 + 横干 + 右下短腿，圆角矩形拼，不依赖任何字体 */
  function glyph4(cls, tx) {
    return '<g class="biko-404__n ' + cls + '" transform="translate(' + tx + ',45)">' +
      '<rect x="0" y="136" width="150" height="40" rx="16"/>' +
      '<g transform="rotate(42.7 84 75)"><rect x="64" y="-15" width="40" height="180" rx="16"/></g>' +
      '<rect x="110" y="136" width="40" height="74" rx="16"/>' +
      '</g>'
  }

  /* 「0」：粗圆环，外径 150×210，描边比约 0.18 */
  function glyph0() {
    return '<g class="biko-404__n biko-404__n--b" transform="translate(305,45)">' +
      '<ellipse cx="75" cy="105" rx="56" ry="86" fill="none" stroke="currentColor" stroke-width="38"/>' +
      '</g>'
  }

  function arrowSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M16 16 6 6"/>' +
      '<path d="M6 11v-5h5"/>' +
      '</svg>'
  }

  /**
   * 碎片层：46 块横条/方块，紧贴数字外缘并向两侧渐疏。
   * 画布 760×300，数字组占 125..635。左右两簇用「距离数字边越远越稀」的
   * 幂分布铺开 —— 均匀铺在两条竖带里会变成两根虚线柱，不像崩开的碎块。
   */
  function artSvg() {
    var rnd = lcg(SEED)
    var groups = [[], [], []]
    var i, w, h, x, y, rot, c, o, d, el

    for (i = 0; i < 46; i++) {
      w = 6 + Math.floor(rnd() * 29)
      h = 6 + Math.floor(rnd() * 5)
      if (i % 7 === 0) {
        w = 10 + Math.floor(rnd() * 9)
        h = w
      }

      if (i < 22) {
        /* 左簇：距数字左边 125 的偏移，p=1.8 让近处更密 */
        d = 3 + Math.floor(Math.pow(rnd(), 1.8) * 108)
        x = Math.max(4, 125 - d - w)
        y = 18 + Math.floor(rnd() * Math.max(1, 264 - h))
      } else if (i < 40) {
        /* 右簇：距数字右边 635 的偏移 */
        d = 3 + Math.floor(Math.pow(rnd(), 1.8) * 100)
        x = Math.min(756 - w, 635 + d)
        y = 18 + Math.floor(rnd() * Math.max(1, 264 - h))
      } else if (i < 43) {
        /* 数字上沿的零碎 */
        x = 80 + Math.floor(rnd() * 580)
        y = 8 + Math.floor(rnd() * 18)
      } else {
        /* 数字下沿的零碎 */
        x = 80 + Math.floor(rnd() * 580)
        y = 262 + Math.floor(rnd() * 24)
      }

      rot = (rnd() - 0.5) * 36
      c = 1 + Math.floor(rnd() * 4)
      o = 0.55 + rnd() * 0.45

      el = '<rect class="biko-404__frag biko-404__frag--c' + c +
        /* 窄屏藏掉一半：按奇偶均匀隐藏，不能按索引截断 ——
           那会把右簇整条砍掉，只剩左边一坨，视觉严重失衡 */
        (i % 2 === 1 ? ' biko-404__frag--hideSm' : '') + '"' +
        ' style="--frag-o:' + o.toFixed(2) + '"' +
        ' x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2"' +
        ' transform="rotate(' + rot.toFixed(1) + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')"/>'

      groups[i % 3].push(el)
    }

    function layer(idx) {
      return '<g class="biko-404__fragGroup biko-404__fragGroup--' + (idx + 1) + '">' +
        groups[idx].join('') + '</g>'
    }

    return '<svg class="biko-404__svg" viewBox="0 0 760 300" preserveAspectRatio="xMidYMid meet"' +
      ' aria-hidden="true" focusable="false">' +
      layer(0) + layer(1) +
      glyph4('biko-404__n--a', 125) +
      glyph0() +
      glyph4('biko-404__n--c', 485) +
      layer(2) +
      '</svg>'
  }

  function mount() {
    var wrap = document.getElementById('body-wrap')
    if (!wrap || !/\btype-404\b/.test(wrap.className || '')) return

    var box = wrap.querySelector('.error-content')
    if (!box || box.getAttribute('data-biko404') === '1') return

    var subtitle = ''
    var oldSub = box.querySelector('.error_subtitle')
    if (oldSub) subtitle = (oldSub.textContent || '').trim()

    box.innerHTML =
      '<div class="biko-404__art">' + artSvg() + '</div>' +
      '<h1 class="error_title">404</h1>' +
      '<p class="biko-404__title">页面走丢了</p>' +
      '<p class="biko-404__desc">' +
        (subtitle ? esc(subtitle) + '<br>' : '') +
        '可能是地址输错了，也可能它已被移动、删除或改名。</p>' +
      '<div class="biko-404__actions">' +
        '<a class="biko-404__home" href="/" aria-label="返回首页">' +
          '<span class="biko-404__homeIcon">' + arrowSvg() + '</span>' +
          '<span class="biko-404__homeText">回首页</span>' +
        '</a>' +
        '<button class="biko-404__back" type="button">返回上一页</button>' +
      '</div>' +
      '<p class="biko-404__foot">© ' + new Date().getFullYear() +
        " Biko's Blog · 站内链接失效请告诉我</p>"

    var back = box.querySelector('.biko-404__back')
    if (back) {
      back.addEventListener('click', function () {
        if (window.history.length > 1) window.history.back()
        else window.location.href = '/'
      })
    }

    box.setAttribute('data-biko404', '1')
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount)
  } else {
    mount()
  }
  document.addEventListener('pjax:complete', mount)
})()
