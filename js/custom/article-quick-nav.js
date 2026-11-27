/* Explicit in-page navigation, scoped to opt-in links in article quick indexes. */
;(function () {
  if (window.BikoArticleQuickNav) return
  window.BikoArticleQuickNav = true
  window.addEventListener('click', function (event) {
    const link = event.target.closest('a.article-section-link[href^="#"]')
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    let id
    try { id = decodeURIComponent(link.getAttribute('href').slice(1)) } catch { return }
    const heading = document.getElementById(id)
    if (!heading) return
    event.preventDefault()
    event.stopImmediatePropagation()
    window.scrollTo({ top: Math.max(0, heading.getBoundingClientRect().top + window.scrollY - 96), behavior: 'instant' })
    history.replaceState(history.state, '', '#' + encodeURIComponent(id))
  }, true)
})()
