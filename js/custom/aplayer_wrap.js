/* ============================================================
 * Biko · APlayer 构造器包装
 * ------------------------------------------------------------
 * 作用：
 *   1. 每次 new APlayer(...) 时，把实例捕获到 window.__BIKO_AP__，
 *      供左下角音符按钮（music_button.js）与音乐页（music_page.js）
 *      复用，全站只持有这一个音频引擎实例。
 *   2. /music/ 页自带歌词渲染：建实例前把每首 audio.lrc 正文转存到
 *      __bikoLrc 再清空，避免 APlayer（lrcType=3）把正文当 URL 去请求
 *      404，也避免它抢歌词显示；正文由 music_page.js 读取后自渲染。
 *      其它页面不动，左下角小面板行为不变。
 *
 * 加载顺序（关键）：三处都必须带 defer，且按文档顺序排列 ——
 *   APlayer.min.js → 本文件(aplayer_wrap.js) → Meting.min.js
 *   defer 脚本按文档顺序执行：先有原生 APlayer，本文件再安装包装，
 *   最后 MetingJS 在 DOMContentLoaded 建实例时，new 到的就是包装后的
 *   构造器，实例才会被捕获到 window.__BIKO_AP__。
 *
 * 注意：defer 只对带 src 的外部脚本有效，内联脚本上写 defer 会被忽略，
 * 所以本逻辑必须放在外部文件里，不能以内联 <script defer> 形式存在。
 * ============================================================ */
(function () {
  var O = window.APlayer
  if (!O || O.__bikoWrap) return

  function W (cfg) {
    /* /music/ 自带歌词渲染：建实例前把 lrc 正文转存后清空。
       其它页面不动，左下角小面板行为不变。 */
    try {
      if (cfg && cfg.audio && /\/music\//.test(location.pathname)) {
        for (var i = 0; i < cfg.audio.length; i++) {
          var t = cfg.audio[i]
          if (t) {
            t.__bikoLrc = t.lrc || ''
            t.lrc = ''
          }
        }
      }
    } catch (e) {}

    var ap = new O(cfg)
    try {
      window.__BIKO_AP__ = ap
    } catch (e) {}
    return ap
  }

  /* 保持原型链与静态属性：让包装构造器对 MetingJS 透明，
     instanceof / 静态方法都不被破坏。 */
  W.prototype = O.prototype
  try {
    Object.setPrototypeOf(W, O)
  } catch (e) {}
  Object.getOwnPropertyNames(O).forEach(function (k) {
    if (k === 'length' || k === 'prototype' || k === 'name') return
    try {
      W[k] = O[k]
    } catch (e) {}
  })
  W.__bikoWrap = true
  window.APlayer = W
})()
