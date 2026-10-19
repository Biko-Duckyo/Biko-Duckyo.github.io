/**
 * 图标字体守卫（FontAwesome guard）
 * ------------------------------------------------------------
 * 目的：让 FontAwesome 在后端 CDN 规则变更、pjax 无刷新跳转、
 *       第三方 CDN 被污染/被墙等任何情况下都能拿到样式表，
 *       同时把「类名 → 字形」自检结果打印到控制台，避免出现
 *       「图标静默变空白 / 整段文字竖排」这种很难定位的现象。
 *
 * 背景（踩过的坑）：
 *   FA6 → FA7 时官方对图标类名做了「按风格分组」拆分（.fa-classic/.fa-solid
 *   分组 + 新前缀），而主题 Butterfly 5.7 与各插件里仍大量沿用 FA5/FA6 的
 *   老类名（fa-shuffle、fa-circle-info、fa-xmark …）。老类名在 FA7 里
 *   取不到字形，浏览器把图标渲染成「0 宽空白」；页面若处在需要测量
 *   文字宽度的容器里，就可能被算成竖排。
 *
 * 本守卫不做「猜版本」，只做两件确定性的事：
 *   1. 探测：CSSOM 里查 @font-face 是否落地 + document.fonts.check
 *      （canvas 只在自检命令里当参考，不参与判定，见下方「危险动作门闩」）；
 *   2. 自愈：**仅当本页确实没有任何图标样式表时**才补一张已知可用的样式表
 *      （<link> / CSSOM 插入 @import）。页面已有全量包时一律不动作，
 *      因为双份样式表的选择器完全相同，后一张会覆盖前一张，反而把
 *      原本正常的图标打坏。
 *
 * 配置：_config.butterfly.yml → fontawesome_guard.enable（默认 true）
 *       值的解析见 scripts/fontawesome-guard-config.js
 *
 * 备注：本文件作为主题 inject 在 <head> 内【同步】执行。
 *   同步拿不到 @font-face，所以首屏只注册 load/pjax:complete 两个钩子；
 *   pjax 钩子挂了也没关系——pjax 会整块替换界面，届时 load 已触发过。
 */
(function () {
  'use strict'

  var TAG = '[FontAwesome·守卫]'

  /* ------------------------------------------------------------
     危险动作门闩 —— 为什么必须有
     ------------------------------------------------------------
     本脚本只在 <head> 里做两件事：探测 + 兜底。但「探测」本身是有代价的，
     一旦判断错了去「兜底」，补进来的第二张样式表就会用**同样的选择器**
     （.fa-solid::before …）覆盖掉站点原有的 .fas 规则，反而把原本正常的
     图标搞坏（这是本项目真实踩过的坑：主界面图标集体变方框）。
     所以下面两种动作一律不做：
       1. 站点本来已经覆盖全量图标（有 .fa-fw）→ 说明确实是官方全量包，
          此时禁用 canvas 判负与兜底注入，只打印自检结论；
       2. 页面上已经有守卫补过的样式表 / 已加载全量包 → 不再补第二张
          （双份样式表 = 双份 @font-face，既白下载又会互相覆盖）。
     ------------------------------------------------------------ */
  var ACTIONS = { probe: true, inject: true }

  /* 本站在用的实心图标属于 FontAwesome 6 的 Solid 字族。
     若某个类名没被归到 Solid，一定要用 canvas 实测确认。 */
  var SOLID = 'Font Awesome 6 Free'
  var FAMILIES = ['Font Awesome 6 Free', 'Font Awesome 5 Free', 'FontAwesome']

  /* 页面是否已有守卫补过的样式表 / 已存在全量官方包 */
  function alreadyCovered() {
    return !!document.querySelector('link[data-fontawesome-guard], style[data-fontawesome-guard]')
  }

  /* ---------------- 探测：一步到位判断「类名 → 字形」链路是否通 ---------------- */

  /* 本地镜像（tools/vendor-sync.mjs 下载，与 CDN 分发的字节一致）。
     之所以固定写死而不读配置：这是「最后一道兜底」，必须不依赖任何运行时配置。
     ⚠️ 版本必须是 6.x：FA7 会丢掉本项目在用的 FA5/FA6 老类名。 */
  var MIRROR = '/css/vendor/fontawesome.min.css'

  /* 只探测「本站在用」的类名，避免探到未被使用的图标而误报。
     这些都是 FA6 里稳定存在的实心图标（覆盖导航、文章、音乐页、迹录页）。 */
  var PROBES = [
    { cls: 'fas fa-home', char: '\uf015' },        // 首页
    { cls: 'fas fa-stream', char: '\uf550' },      // 文章页 目录
    { cls: 'fas fa-shuffle', char: '\uf074' },     // 音乐页 随机播放
    { cls: 'fas fa-circle-info', char: '\uf05a' }, // 迹录页 提示
    { cls: 'fas fa-xmark', char: '\uf00d' }        // 迹录页 关闭
  ]

  var state = { retries: 0, injected: false, reported: false }

  /* ---------------- 探测：一步到位判断「类名 → 字形」链路是否通 ---------------- */
  function fontsReady() {
    if (!document.fonts || !document.fonts.check) return null // 浏览器不支持，改用 canvas
    try {
      // 「FontAwesome 6 Free + 900」正是 FA6 的实心字族；FA7/缺字时返回 false
      return document.fonts.check('900 16px "' + SOLID + '"')
    } catch (e) {
      return null
    }
  }

  /* 用 canvas 把某个私有区码位画出来，看是否落墨（兜底探测）
     ⚠️ 必须用 Solid 字族并带 font-weight:900。
     此前写 16px "Font Awesome 6 Free" 却**没给字重**，canvas 按
     regular(400) 找字族，而 FA6 的实心字族只注册了 900 —— 于是所有
     实心图标（本项目几乎全是实心）全被判成「没字形」，守卫误以为坏了，
     补进第二张样式表去覆盖，反过来把正常图标打坏。 */
  function glyphInked(char) {
    try {
      var c = document.createElement('canvas')
      c.width = 24
      c.height = 24
      var ctx = c.getContext('2d')
      if (!ctx) return null
      ctx.font = '900 16px "' + SOLID + '"'
      ctx.fillStyle = '#000'
      ctx.textBaseline = 'top'
      ctx.fillText(char, 0, 0)
      var data = ctx.getImageData(0, 0, 24, 24).data
      for (var i = 3; i < data.length; i += 4) {
        if (data[i] !== 0) return true
      }
      return false
    } catch (e) {
      return null // canvas 被指纹保护禁用等
    }
  }

  /* ------------------------------------------------------------
     站点自带的全量包探测：直接查 CSSOM，而不是拿私有码位去 canvas 试画。
     ------------------------------------------------------------
     依据：官方全量包一定有 .fa-fw（固定宽度），而「部分包 / 手写子集」
     几乎不会带上它。这一步的作用是**禁止** canvas 判负：canvas 是否落墨
     受字重、子集分割、浏览器实现影响，很容易误报；一旦误报就会去补
     第二张样式表，反而把正常图标打坏（主界面图标集体变方框就是这么来的）。

     ⚠️ 关键修正：只看 .fa-fw 是**不够**的、会误判。
     主题自带的 /css/index.css 里就抄了一条 .fa-fw{width:1.25em}，
     但它既没有 @font-face 也没有 .fas{font-family:…} —— 是「残缺 FA」。
     若只认 .fa-fw，本函数会在这种页面上恒返回 true，自愈被永久禁用。
     所以改成：**同一张样式表里**同时有 .fa-fw 且声明了 FA 的 @font-face，
     才算全量包。index.css 不满足（无 @font-face），fontawesome.min.css 满足。
     ------------------------------------------------------------ */
  function siteHasFullPackage() {
    var sheets = document.styleSheets
    for (var i = 0; i < sheets.length; i++) {
      var rules
      try {
        rules = sheets[i].cssRules
      } catch (e) {
        continue // 跨域样式表读不到，跳过
      }
      if (!rules) continue
      var hasFw = false
      var hasFace = false
      for (var j = 0; j < rules.length; j++) {
        var r = rules[j]
        if (!r) continue
        if (r.type === 5 /* CSSRule.FONT_FACE_RULE */) {
          var fam = (r.style.getPropertyValue('font-family') || '').replace(/["']/g, '').trim()
          if (FAMILIES.indexOf(fam) !== -1) hasFace = true
          continue
        }
        if (!hasFw && r.selectorText && /(^|,)\s*\.fa-fw\s*(,|$)/.test(r.selectorText)) hasFw = true
      }
      if (hasFw && hasFace) return true
    }
    return false
  }

  /* ---------------- 自愈：补一张样式表（同一个页面只补一次） ---------------- */
  function inject(why) {
    if (state.injected) return
    if (!ACTIONS.inject) {
      console.warn(TAG + ' 触发兜底条件（' + why + '），但本页已禁用自动补样式表')
      return
    }
    // 已经有守卫补过的样式表 / 站点本来就有全量包 → 绝不能补第二张：
    // 两张包的选择器完全相同，后一张会整体覆盖前一张，@font-face 也会重复注册
    if (alreadyCovered()) {
      console.warn(TAG + ' 触发兜底条件（' + why + '），但页面已有图标样式表，跳过注入')
      return
    }
    state.injected = true
    console.warn(TAG + ' 触发兜底：' + why + ' → 追加 ' + MIRROR)
    var css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = MIRROR
    css.setAttribute('data-fontawesome-guard', '1')
    // 本地镜像若也挂不上，再退回 jsDelivr 的官方 all.min.css
    css.onerror = function () {
      // 注意：<link> 插进 DOM 那一刻就会开始下载，所以这里要先把这张失败的
      // 链接摘掉，否则「本地 404 + CDN 补上」时控制台仍会留一条 404，容易被
      // 误读成「又坏了」。
      if (css.parentNode) css.parentNode.removeChild(css)
      var alt = document.createElement('style')
      alt.setAttribute('data-fontawesome-guard', 'cdn')
      alt.textContent =
        '@import url("https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css");'
      document.head.appendChild(alt)
      console.warn(TAG + ' 本地镜像不可用，已改用 jsDelivr 的 FontAwesome 6.5.2')
    }
    document.head.appendChild(css)
  }

  /* 直接查 CSSOM：有没有任何一个 FA 字族真的挂上了 @font-face */
  function hasUsableFace() {
    var sheets = document.styleSheets
    for (var i = 0; i < sheets.length; i++) {
      var rules
      try {
        rules = sheets[i].cssRules
      } catch (e) {
        continue // 跨域样式表读不到，跳过
      }
      if (!rules) continue
      for (var j = 0; j < rules.length; j++) {
        var r = rules[j]
        if (!r || r.type !== 5 /* CSSRule.FONT_FACE_RULE */) continue
        var fam = (r.style.getPropertyValue('font-family') || '').replace(/["']/g, '').trim()
        if (FAMILIES.indexOf(fam) !== -1) return true
      }
    }
    return false
  }

  /* ---------------- 检查主流程 ----------------
     铁律：能不动作就不动作。
     本页已经有全量包时，只报告结论，绝不注入、绝不用 canvas 判负。
  ------------------------------------------------ */
  function check(round) {
    // 站点自带全量包（.fa-fw 在 CSSOM 里）→ 本页无需且禁止自愈
    if (siteHasFullPackage()) {
      ACTIONS.inject = false
      state.action = 'none'
      return report('（站点已自带全量包，跳过自愈）')
    }

    var ready = fontsReady()

    if (ready === null) {
      // 异常环境（无 FontFaceSet）：本来要用 canvas 实测代替，但 canvas
      // 误报率不低，只有在「明确禁用自愈」时才敢用它下结论，所以这里只看
      // 有没有 @font-face 落地，剩下的交给 hasUsableFace 判断。
      if (hasUsableFace()) return report('（@font-face 已解析，无法实测）')
      if (round < 2) return retry(round)
      inject('无法探测且 CSSOM 中没有任何 FA 字族')
      return report('（兜底样式表已注入）')
    }

    if (ready) return report()

    // 尚未就绪：可能还在加载，也可能是 CDN 挂了 / 字体版本不对
    if (round < 2) return retry(round)

    // 两次重试仍未就绪 → 浏览器已尝试过所有 src，判定为「拿不到可用字体」
    if (hasUsableFace()) return report('（@font-face 已解析，等待字体下载）')
    inject('两次重试后仍无可用 FontAwesome 字族')
    report('（兜底样式表已注入）')
  }

  function retry(round) {
    state.retries++
    setTimeout(function () { check(round + 1) }, 400)
  }

  /* ---------------- 自检报告：只打一次，任何一页都能用 F12 复现 ---------------- */
  function report(note) {
    if (state.reported) return
    state.reported = true
    console.log(
      '%c' + TAG + '%c FontAwesome 可用 · 类名链路正常 ' + (note || ''),
      'color:#fff;background:#6513df;padding:1px 6px;border-radius:3px',
      'color:#6513df'
    )
    console.log(TAG + ' 自检命令：控制台执行 __BIKO_FA__.selfTest()')
  }

  /* ---------------- 对外接口：排障时可手动调用 ---------------- */
  window.__BIKO_FA__ = {
    /* 为什么本页没有（或即将）补样式表：先看这个再决定要不要动手 */
    why: function () {
      return {
        站点全量包: siteHasFullPackage(),
        已有守卫样式表: alreadyCovered(),
        允许注入: ACTIONS.inject,
        字体已就绪: fontsReady(),
        有可用字族: hasUsableFace(),
        已注入次数: state.injected ? 1 : 0
      }
    },
    /* 只探一个类名：返回它算出来的字族、伪元素内容与是否真的有字形。
       ⚠️ 纯诊断，不参与自愈判定——canvas 结果只是参考。 */
    probe: function (cls) {
      var p = (cls || 'fas fa-home').split(/\s+/)
      var el = document.createElement('i')
      el.className = (p[0] || 'fas') + ' fa-fw ' + (p[1] || '')
      el.style.position = 'fixed'
      el.style.left = '-9999px'
      el.style.fontSize = '64px'
      document.body.appendChild(el)
      var fam = getComputedStyle(el).fontFamily
      var before = getComputedStyle(el, ':before').content || ''
      var m = /u([0-9a-f]{4,6})/i.exec(before)
      var inked = m ? glyphInked(String.fromCharCode(parseInt(m[1], 16))) : null
      if (el.parentNode) el.parentNode.removeChild(el)
      return { class: el.className.trim(), fontFamily: fam, content: before, inked: inked }
    },
    selfTest: function () {
      var rows = PROBES.map(function (p) {
        var r = window.__BIKO_FA__.probe(p.cls)
        return { 类名: r.class, 字体: r.fontFamily, 码位: r.content, 有字形: r.inked }
      })
      var bad = rows.filter(function (r) { return r['有字形'] === false })
      var styles = Array.prototype.map.call(
        document.querySelectorAll('link[rel="stylesheet"], style'),
        function (n) { return n.href || '[inline style]' }
      ).filter(function (u) { return /fontawesome|font-awesome|fa[-.]/i.test(u) })
      console.log('%c' + TAG + ' 自检结果', 'color:#6513df;font-weight:bold')
      console.table(rows)
      console.log(TAG + ' 相关样式表：', styles)
      console.log(TAG + (bad.length
        ? ' ✗ 有 ' + bad.length + ' 个图标缺字形，请确认 fontawesome.min.css 是 6.x'
        : ' ✓ 抽样的图标全部有字形'))
      return { ok: bad.length === 0, rows: rows, sheets: styles }
    }
  }

  /* ---------------- 注册检查时机 ---------------- */
  function schedule() {
    // 1) 首屏（若本脚本是动态插入的，load 可能已经过去了，两种都兜住）
    if (document.readyState === 'complete') {
      setTimeout(function () { check(0) }, 0)
    } else {
      window.addEventListener('load', function () { check(0) }, { once: true })
    }
    // 2) pjax 无刷新跳转后（data-pjax 引入的 <link> 要等一轮才进 CSSOM）
    document.addEventListener('pjax:complete', function () {
      state.injected = false // 新页面可能带了新的样式表，允许再兜一次
      setTimeout(function () { check(2) }, 600)
    })
  }

  schedule()
})()

