/* Set before paint; keep the comparison override scoped to this URL. */
;(function () {
  'use strict'
  if (window.__bikoChromeGlass) return
  window.__bikoChromeGlass = true
  function sync() {
    document.documentElement.dataset.chromeGlass = new URLSearchParams(location.search).get('glass') === 'classic' ? 'classic' : 'enhanced'
  }
  sync()
  document.addEventListener('pjax:complete', sync)
})()
