/* Resource discovery: one index, combined keyword/category filters, safe Pjax re-entry. */
;(function () {
  'use strict'
  if (window.__BIKO_RESOURCES_INIT__) { window.__BIKO_RESOURCES_INIT__(); return }
  function boot() {
    var root = document.querySelector('.resources-page')
    if (!root || root.dataset.resourcesBound === '1') return
    root.dataset.resourcesBound = '1'
    var input = root.querySelector('#resource-search')
    var groups = Array.from(root.querySelectorAll('.resource-group'))
    var items = Array.from(root.querySelectorAll('.resource-item'))
    var category = groups.some(function (g) { return '#' + g.id === location.hash }) ? location.hash.slice(1) : ''
    var index = new Map(items.map(function (item) { return [item, item.textContent.toLocaleLowerCase()] }))
    function revealNavigation() {
      var schedule = window.requestAnimationFrame || function (fn) { fn() }
      schedule(function () {
        if (!root.isConnected) return
        var island = document.getElementById('bss-island') || document.querySelector('.biko-nav')
        var inset = Math.max(80, island ? island.getBoundingClientRect().bottom + 16 : 0)
        var target = category ? root.querySelector('.resources-chips-nav') : root
        var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - inset), behavior: reduced ? 'auto' : 'smooth' })
      })
    }
    function collapse(group, collapsed) {
      group.classList.toggle('is-collapsed', collapsed)
      group.querySelector('.resource-group-arrow').setAttribute('aria-expanded', String(!collapsed))
    }
    function render() {
      var words = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
      var found = 0
      groups.forEach(function (group) {
        var matched = 0
        group.querySelectorAll('.resource-item').forEach(function (item) {
          var show = (!category || group.id === category) && words.every(function (word) { return index.get(item).includes(word) })
          item.hidden = !show
          if (show) { matched++; found++ }
        })
        group.hidden = matched === 0
        group.querySelector('.count').textContent = matched
        if (words.length || category) collapse(group, false)
      })
      root.querySelector('#resource-results').textContent = found + ' / ' + items.length + ' 项资源'
      root.querySelector('#resource-empty').hidden = found !== 0
      root.querySelector('[data-resource-all]').setAttribute('aria-pressed', String(!category))
      root.querySelectorAll('.resources-chip[href]').forEach(function (link) {
        if (link.hash === '#' + category) link.setAttribute('aria-current', 'true')
        else link.removeAttribute('aria-current')
      })
    }
    groups.forEach(function (group) {
      collapse(group, true)
      var button = group.querySelector('.resource-group-arrow')
      button.setAttribute('aria-label', '折叠或展开' + group.querySelector('h2').textContent)
      button.addEventListener('click', function () { collapse(group, !group.classList.contains('is-collapsed')) })
    })
    root.querySelector('form').addEventListener('submit', function (event) { event.preventDefault() })
    input.addEventListener('input', render)
    root.querySelector('#resource-reset').addEventListener('click', function () {
      input.value = ''; category = ''
      groups.forEach(function (group) { collapse(group, true) })
      history.replaceState(null, '', location.pathname + location.search)
      render(); input.focus()
    })
    root.querySelector('.resources-chips-nav').addEventListener('click', function (event) {
      var target = event.target.closest('.resources-chip')
      if (!target) return
      event.preventDefault()
      event.stopPropagation()
      category = target.hasAttribute('data-resource-all') ? '' : target.hash.slice(1)
      if (target.hasAttribute('data-resource-all')) {
        input.value = ''
        groups.forEach(function (group) { collapse(group, true) })
      }
      history.replaceState(null, '', location.pathname + location.search + (category ? '#' + category : ''))
      render()
      revealNavigation()
    }, true)
    items.forEach(function (item) {
      item.rel = 'noopener noreferrer'
      var icon = document.createElement('i')
      icon.className = 'fas fa-arrow-up-right-from-square resource-open-icon'
      icon.setAttribute('aria-hidden', 'true')
      item.appendChild(icon)
    })
    render()
    if (category) revealNavigation()
  }
  window.__BIKO_RESOURCES_INIT__ = boot
  document.addEventListener('pjax:complete', boot)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true })
  else boot()
})()
