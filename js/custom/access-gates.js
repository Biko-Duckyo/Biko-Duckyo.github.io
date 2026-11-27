/* Shared first-paint screen for private pages; never changes authentication. */
;(function () {
  'use strict'
  if (window.BikoAccessGate) return
  var root = document.documentElement, timer
  var states = new WeakMap()
  var routes = { '/anime/': ['animeGate', '.anime-page'], '/galleryGroup/': ['gg-gate', '#gal-root'], '/finance/': ['finGate', '#finMain'] }
  var critical = document.createElement('style')
  critical.textContent = 'html.bss-access-pending::before{content:"";position:fixed;inset:0;z-index:1240;background:#111b2a}html.bss-access-pending :is(#animeGate,#gg-gate,#finGate){visibility:hidden!important}html[data-access-state] #loading-box{display:none!important}'
  document.head.appendChild(critical)
  function route() { return routes[location.pathname.replace(/\/?$/, '/')] }
  function ready(state) {
    clearTimeout(timer)
    var entry = route()
    root.classList.remove('bss-access-pending')
    if (!entry) { root.removeAttribute('data-access-state'); return }
    root.dataset.accessState = state
    var gate = document.getElementById(entry[0])
    if (gate) states.set(gate, state)
    if (state === 'locked' && gate) gate.hidden = false
    var content = document.querySelector(entry[1])
    if (content) content.inert = state !== 'unlocked'
  }
  function begin() {
    clearTimeout(timer)
    var entry = route()
    if (!entry) { ready(''); return }
    var gate = document.getElementById(entry[0])
    // Inline controllers can finish before pjax:complete. Do not relock
    // that same page after it has already resolved its authentication.
    if (gate && states.has(gate)) { ready(states.get(gate)); return }
    root.dataset.accessState = 'pending'
    root.classList.add('bss-access-pending')
    // If a controller fails, keep the page closed but show its normal gate.
    timer = setTimeout(function () { if (root.classList.contains('bss-access-pending')) ready('locked') }, 1500)
  }
  window.BikoAccessGate = { ready: ready }
  begin()
  document.addEventListener('pjax:complete', begin)
})()
