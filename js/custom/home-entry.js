/* Establish the home welcome state before content or Pjax can paint. */
;(function () {
  if (window.BikoHomeEntry) return
  var root = document.documentElement, timer
  var compactMedia = '(max-width:600px) and (max-aspect-ratio:1/2)'
  var desktopImage = '/img/welcome-desktop.webp', mobileImage = '/img/welcome-mobile.webp'
  var style = document.createElement('style')
  style.textContent = 'html.biko-home-pending::before{content:"";position:fixed;inset:0;z-index:199999;background:#182336 url('+desktopImage+') center/cover no-repeat}@media '+compactMedia+'{html.biko-home-pending::before{background-image:url('+mobileImage+')}}html.biko-home-pending :is(#body-wrap,#bss-island,#bss-dock){visibility:hidden}#biko-hub.biko-hub-initial{transition:none}'
  document.head.appendChild(style)
  function ready() { clearTimeout(timer); root.classList.remove('biko-home-pending') }
  function prepare() {
    clearTimeout(timer)
    var preload = document.getElementById('biko-welcome-preload')
    if (!preload) { preload = document.createElement('link'); preload.id = 'biko-welcome-preload'; preload.rel = 'preload'; preload.as = 'image'; preload.setAttribute('fetchpriority', 'high'); document.head.appendChild(preload) }
    preload.href = window.matchMedia(compactMedia).matches ? mobileImage : desktopImage
    root.classList.add('biko-home-pending')
    timer = setTimeout(ready, 8000)
  }
  window.BikoHomeEntry = { prepare: prepare, ready: ready, get pending() { return root.classList.contains('biko-home-pending') } }
  if (location.pathname === '/') prepare()
  document.addEventListener('click', function (event) {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    var link = event.target.closest && event.target.closest('a[href]')
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return
    var url = new URL(link.href, location.href)
    if (url.origin !== location.origin || url.pathname !== '/' || url.hash) return
    prepare()
    if (location.pathname === '/' && window.__bikoShowWelcome) {
      event.preventDefault(); event.stopPropagation()
      var drawer = document.getElementById('bss-drawer')
      if (drawer && drawer.open) drawer.close()
      window.__bikoShowWelcome()
    }
  }, true)
  window.addEventListener('popstate', function () { if (location.pathname === '/') prepare(); else ready() })
  document.addEventListener('pjax:error', ready)
  document.addEventListener('pjax:complete', function () { if (location.pathname !== '/') ready() })
})()
