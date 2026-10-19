// ======================================================
// 不蒜子（busuanzi）计数本地兜底守护
// ------------------------------------------------------
// 背景：busuanzi 官方统计接口依赖请求头 Referer 来区分站点。当浏览器/代理
// 未携带 Referer（例如从应用内 WebView 打开、目标站声明了 no-referrer 策略、
// 或经由剥离 Referer 的中间层）时，服务端不会按「站点」返回数据，而是回落到
// 一个「全局共享池」，于是网页上会出现 57223274 / 80887335 这类明显不属于
// 本站的百万级数字（实测：带本站 Referer 时返回 ~19/38，不带时返回 5.7kw/8.0kw）。
//
// 本脚本作为 theme.asset.busuanzi 的替代源，在官方脚本之前加载，做两件事：
//   1) 用 fetch 显式携带本站 Referer 直接查询接口，拿到「本站真实」数值，
//      写入 window.__bikoBusuanzi，供后续渲染使用；
//   2) 包装 busuanziCallback 做兜底：若官方脚本在极短时间内把明显异常的
//      「全局共享池」数值写进 DOM，则用第 1 步拿到的真实值覆盖。
//
// 说明：本站为纯静态博客（GitHub Pages），自建计数器需后端存储，故此处
// 选择「保持官方计数 + 修正 Referer 缺失导致的串号」这一无后端方案。
// 若后续接入带后端的统计（umami / waline visitor），可直接停用本文件。
// ======================================================
(function (global) {
  'use strict'

  var ENDPOINT = '//busuanzi.ibruce.info/busuanzi?jsonpCallback=__bikoBusuanziCb'
  var ABNORMAL_MIN = 1e6 // 本站真实量级为两位数，百万级必为共享池串号
  var FALLBACK_DELAY = 4000 // 取数超时：4 秒仍无值就把转圈占位换成 “—”
  var VALUE_IDS = ['busuanzi_value_site_uv', 'busuanzi_value_site_pv', 'busuanzi_value_page_pv']
  var real = null
  var guarded = false

  function writeValue(id, value) {
    var el = document.getElementById(id)
    if (!el) return
    var text = String(value)
    if (el.textContent !== text) el.textContent = text
  }

  // 把「本站真实」数值写入 DOM（busuanzi 官方脚本同样使用这些 id）
  function applyReal() {
    if (!real) return
    if (real.uv != null) writeValue('busuanzi_value_site_uv', real.uv)
    if (real.pv != null) writeValue('busuanzi_value_site_pv', real.pv)
    if (real.pvPage != null) writeValue('busuanzi_value_page_pv', real.pvPage)
  }

  // 超时降级：仍为空（还在转圈）的位置用 “—” 占位，避免永久 spinner
  function scheduleFallback() {
    setTimeout(function () {
      VALUE_IDS.forEach(function (id) {
        var el = document.getElementById(id)
        if (el && !el.textContent.trim()) el.textContent = '—'
      })
    }, FALLBACK_DELAY)
  }

  // 官方脚本 JSONP 回调的兜底包装：拦截共享池串号
  function installCallbackGuard() {
    if (guarded) return
    guarded = true
    var origin = global.busuanziCallback
    global.busuanziCallback = function (r) {
      var uv = r && Number(r.site_uv)
      var pv = r && Number(r.site_pv)
      var suspicious = (uv > ABNORMAL_MIN) || (pv > ABNORMAL_MIN)
      if (suspicious && real) {
        // 丢弃官方写回的共享池数值，改用本站真实值
        applyReal()
        return
      }
      if (typeof origin === 'function') origin(r)
    }
  }

  // 显式携带本站 Referer 查询接口，取回本站真实数值
  function loadReal() {
    if (typeof fetch !== 'function') return
    installCallbackGuard()
    scheduleFallback()
    // referrerPolicy 用 unsafe-url 携带完整页面 URL：
    // site_uv/site_pv 按域名统计，page_pv 按「完整页面路径」统计；
    // 若只发 origin（域名），page_pv 无法区分具体文章。
    fetch(ENDPOINT, { credentials: 'omit', referrer: location.href, referrerPolicy: 'unsafe-url' })
      .then(function (res) { return res.ok ? res.text() : '' })
      .then(function (text) {
        if (!text) return
        // 响应形如：try{__bikoBusuanziCb({"site_uv":19,"site_pv":38,"page_pv":12,...});}catch(e){}
        // 注意不能用 /(\{[\s\S]*?\})/：外层 try{} 的 "{" 在 JSON 之前，
        // 非贪婪会在 JSON 第一个 "}" 处提前结束。改为从 "site_uv" 成员处锚定。
        var match = /(\{"site_uv"[\s\S]*?\})/.exec(text)
        if (!match) return
        var data
        try { data = JSON.parse(match[1]) } catch (e) { return }
        real = {
          uv: data.site_uv != null ? data.site_uv : null,
          pv: data.site_pv != null ? data.site_pv : null,
          pvPage: data.page_pv != null ? data.page_pv : null
        }
        global.__bikoBusuanzi = real
        applyReal()
      })
      .catch(function () { /* 取真实值失败则由 scheduleFallback 显示 “—” */ })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReal)
  } else {
    loadReal()
  }
  // Pjax 切页后元素会重新渲染为 spinner，需要重新拉取并重新计时降级
  document.addEventListener('pjax:complete', function () {
    real = null
    loadReal()
  })
})(window)
