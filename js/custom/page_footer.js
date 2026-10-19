/*!
 * 按页面隐藏页脚（/music/、/calendar/ 这类整屏页面不需要版权栏）
 * ============================================================
 * 为什么不能只用 CSS 的 #footer{display:none}：
 *   /music/ 与 /calendar/ 都是整屏布局，页脚留着即使看不见，
 *   #body-wrap 之后仍会多出一段高度（页脚有自己的内边距/背景），
 *   底部会露出一条空白 —— 这类「不要」是结构问题，不是颜色问题。
 *
 * 为什么不用删掉就完事：
 *   #footer 是 #body-wrap 的【兄弟】节点（layout.pug），
 *   而 pjax 只替换 #body-wrap —— 也就是说：
 *     · 在本页删掉后，pjax 去别的页不会自己长回来 → 必须在非本页时补回；
 *     · 离开本页再回来也不会自动消失 → 必须每次进页都重跑。
 *   所以这里是「按当前页同步」而不是一次性 remove。
 *   被摘下的节点存着，来回切始终只动同一个，不会越删越少；
 *   补回的位置也还原成「#body-wrap 之后」，与主题原始结构一致。
 *
 * 判定方式（任一命中即隐藏）：
 *   1. 页面根节点带 data-biko-nofooter —— 页面自己声明，最直观，
 *      写好 MD 里的那个属性就行，不必改本文件；
 *   2. 根节点类名在下列 FALLBACK 里 —— 防止有人在改页面时
 *      把 data 属性顺手删掉，页脚又冒出来。
 *   根节点 = .page[class*=type-]（Butterfly 把 front-matter 的 type 写成 class）。
 *
 * 加载：inject.bottom，全站注入，带 data-pjax（本文件自挂 pjax:complete）。
 */
(function () {
  'use strict'

  /* 兜底清单：按 front-matter 的 type 写类名。
     新页面优先用 data-biko-nofooter 声明，这里只在必要时补。 */
  var FALLBACK = ['type-music', 'type-calendar', 'type-gallery']

  /* 页脚被摘下后暂存在这里；同一页面内多次调用只会存同一个节点 */
  var stash = null

  function pageRoot () {
    return document.querySelector('.page[class*="type-"]') ||
      document.getElementById('body-wrap')
  }

  function wanted () {
    var root = pageRoot()
    if (!root) return false
    if (root.hasAttribute && root.hasAttribute('data-biko-nofooter')) return true
    var cls = ' ' + (root.className || '') + ' '
    for (var i = 0; i < FALLBACK.length; i++) {
      if (cls.indexOf(' ' + FALLBACK[i] + ' ') > -1) return true
    }
    return false
  }

  function footer () { return document.getElementById('footer') }

  function hide () {
    var f = footer()
    if (!f || !f.parentNode) return
    stash = f
    f.parentNode.removeChild(f)
  }

  function restore () {
    var f = footer()
    if (f) { stash = null; return }            // 已经有了（主题新渲染的），不用补
    if (!stash) return
    var wrap = document.getElementById('body-wrap')
    var host = (wrap && wrap.parentNode) || document.body
    /* 还原到 #body-wrap 之后；没有 wrap 就追加到 body 末尾，至少别丢 */
    if (wrap && wrap.parentNode) wrap.parentNode.insertBefore(stash, wrap.nextSibling)
    else host.appendChild(stash)
    stash = null
  }

  function sync () {
    try {
      if (wanted()) hide()
      else restore()
    } catch (e) { /* 兜底：页脚问题不该拖垮整页脚本 */ }
  }

  if (document.readyState !== 'loading') sync()
  else document.addEventListener('DOMContentLoaded', sync)

  /* pjax 换页后 #body-wrap 是异步替换的，稍等一拍再判，
     否则读到的是旧页面（会把「正在离开」误判成「还在本页」）。 */
  document.addEventListener('pjax:complete', function () {
    setTimeout(sync, 0)
    setTimeout(sync, 300)
  })

  /* 暴露给其它脚本/控制台（music_page.js 不再自己管页脚） */
  window.__BIKO_FOOTER__ = { sync: sync, wanted: wanted }
})()
