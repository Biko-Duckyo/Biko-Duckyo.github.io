/* ============================================================
 * 小黑 · 看板娘触发
 * 点击本站看板娘小黑猫 → 打开小黑聊天窗（window.NANALY.open）。
 * 仅在可见猫形上覆盖一个透明热区，避免挡住大片页面。
 * ============================================================ */
(function () {
  function bind() {
    if (window.__NANALY_CAT_BOUND__) return
    var widget = document.getElementById('live2d-widget')
    if (!widget) return
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.id = 'nanaly-cat-hotspot'
    btn.title = '找小黑聊聊'
    btn.setAttribute('aria-label', '打开小黑助手')
    btn.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      try {
        if (window.NANALY && typeof window.NANALY.open === 'function') window.NANALY.open()
      } catch (_) {}
    })
    document.body.appendChild(btn)
    window.__NANALY_CAT_BOUND__ = true
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind)
  else bind()

  // live2d 脚本可能稍晚注入，有限轮询补齐
  var tries = 0
  var timer = setInterval(function () {
    if (window.__NANALY_CAT_BOUND__ || ++tries > 40) clearInterval(timer)
    else bind()
  }, 500)

  // pjax 切换后热区若丢失则重建
  window.addEventListener('pjax:complete', function () {
    if (!document.getElementById('nanaly-cat-hotspot')) {
      window.__NANALY_CAT_BOUND__ = false
      bind()
    }
  })
})()
