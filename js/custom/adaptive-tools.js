/* Move the original controls, so existing event handlers and device-local data stay intact. */
;(function () {
  'use strict'
  if (window.BIKO_ADAPTIVE) { window.BIKO_ADAPTIVE.refresh(); return }
  var narrow = window.matchMedia('(max-width: 768px)')
  var groups = [], loaded = new Set(), pending = new Map(), assetPending = new Map(), chatReady = false, routeEpoch = 0
  var definitions = [
    ['.anime-data-tools', ['#aiEnrichBtn', '#exportJsonBtn', '#importJsonBtn']],
    ['.wl-month-nav', ['#wl-export']],
    ['.bk-drawer-foot', ['#bk-export-json', '#bk-import-json']],
    ['.bk-topbar-right', ['#bk-export-md', '#bk-export-img']],
    ['.nanaly-head__actions', ['.nanaly-backup-entry', '[data-act="setup"]', '[data-act="clear"]']]
  ]
  function groupActions() {
    groups = groups.filter(function (g) { return g.host.isConnected })
    if (!narrow.matches) {
      groups.forEach(function (g) { g.moves.forEach(function (m) { m.marker.replaceWith(m.node) }); g.details.remove() })
      groups = []; return
    }
    definitions.forEach(function (definition) {
      document.querySelectorAll(definition[0]).forEach(function (host) {
        if (host.closest('.anime-manage')) return
        if (groups.some(function (g) { return g.host === host })) return
        var nodes = definition[1].map(function (selector) { return host.querySelector(selector) }).filter(Boolean)
        if (!nodes.length) return
        var details = document.createElement('details'); details.className = 'mobile-action-more'
        var summary = document.createElement('summary'); summary.textContent = '更多'; details.appendChild(summary)
        var options = document.createElement('div'); options.className = 'mobile-action-options'; details.appendChild(options)
        // Top layer keeps menus visible inside scrollable cards and drawers.
        if ('showPopover' in options) {
          options.setAttribute('popover', 'manual')
          details.addEventListener('toggle', function () {
            // Toggle events can run after Pjax has removed the old menu.
            if (!options.isConnected) return
            if (details.open) options.showPopover()
            else options.hidePopover()
          })
        }
        var moves = nodes.map(function (node) { var marker = document.createComment('mobile-action'); node.before(marker); options.appendChild(node); return { node: node, marker: marker } })
        var note = document.createElement('p'); note.textContent = definition[0] === '.wl-month-nav' ? '导出当前月份的工作记录。批量整理建议在电脑上完成。' : '批量处理建议在电脑上完成。导入前请先导出一份备份。'; options.appendChild(note)
        host.appendChild(details); groups.push({host:host, details:details, moves:moves})
      })
    })
  }
  function manifest(group) {
    var node = document.getElementById('biko-optional-assets')
    try { return node ? JSON.parse(node.textContent)[group] || [] : [] } catch (_) { return [] }
  }
  function loadAsset(asset) {
    var key = JSON.stringify([asset.css ? 'style' : 'script', asset.src || asset.css || asset.code, asset.attrs || {}])
    if (loaded.has(key)) return Promise.resolve()
    if (assetPending.has(key)) return assetPending.get(key)
    var task = new Promise(function (resolve, reject) {
      var node = document.createElement(asset.css ? 'link' : 'script')
      var settled = false
      var timer = setTimeout(function () { finish(new Error('加载超时，请重试')) }, 15000)
      function finish(error) {
        if (settled) return
        settled = true; clearTimeout(timer); node.onload = node.onerror = null
        if (error) { node.remove(); reject(error) }
        else { loaded.add(key); resolve() }
      }
      node.onload = function () { finish() }
      node.onerror = function () { finish(new Error('组件加载失败，请重试')) }
      if (asset.css) { node.rel = 'stylesheet'; node.href = asset.css }
      else if (asset.src) {
        // 先还原清单里保留的属性再设 src：click-heart 依赖 id="click-heart" + mobile，
        // clickShowText 依赖 data-*，缺了它们脚本会在自身逻辑里抛错或静默失效。
        if (asset.attrs) Object.keys(asset.attrs).forEach(function (name) {
          try { node.setAttribute(name, asset.attrs[name]) } catch (_) {}
        })
        node.src = asset.src; node.async = false
      }
      else node.textContent = asset.code
      try {
        document.head.appendChild(node)
        if (asset.code) finish()
      } catch (error) { finish(error) }
    })
    assetPending.set(key, task)
    function clearPending() { if (assetPending.get(key) === task) assetPending.delete(key) }
    task.then(clearPending, clearPending)
    return task
  }
  function ensure(group) {
    var assets = manifest(group), signature = JSON.stringify(assets), previous = pending.get(group)
    // A missing manifest on one route must not permanently cache an empty success.
    if (!assets.length) return Promise.reject(new Error('当前页面未提供此组件，请返回后重试'))
    if (previous && previous.signature === signature) return previous.task
    var task = assets.reduce(function (chain, asset) { return chain.then(function () { return loadAsset(asset) }) }, Promise.resolve())
      .catch(function (error) { if (pending.get(group)?.task === task) pending.delete(group); throw error })
    pending.set(group, { signature: signature, task: task }); return task
  }
  function desktopGuide(trigger) {
    var dialog = document.getElementById('mobile-desktop-dialog')
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.id = 'mobile-desktop-dialog'; dialog.setAttribute('aria-labelledby','mobile-desktop-title')
      dialog.innerHTML = '<h2 id="mobile-desktop-title">在电脑上继续</h2><p>手机端保留阅读与查阅。精细标注、批量 AI 处理和复杂管理建议在电脑上完成。</p><p data-document-id></p><button type="button" data-copy-document>复制页面链接</button><button type="button" data-close-guide>返回</button><p role="status" data-guide-status></p>'
      document.body.appendChild(dialog)
      dialog.querySelector('[data-close-guide]').onclick = function () { dialog.close() }
      dialog.querySelector('[data-copy-document]').onclick = async function () {
        var status = dialog.querySelector('[data-guide-status]')
        try { await navigator.clipboard.writeText(dialog.dataset.link); status.textContent = '已复制。请在电脑上打开链接；需要时在电脑自行解锁。' }
        catch (_) { status.textContent = '复制未完成，请手动复制：' + dialog.dataset.link }
      }
    }
    var doi = document.querySelector('#panel-reader')?.dataset.paperDoi || ''
    var href = trigger.getAttribute('href') || ''
    if (href.startsWith('scholar-local:')) { try { doi = new URL(href).searchParams.get('doi') || doi } catch (_) {} }
    var link = new URL(location.href); if (doi) link.searchParams.set('doi', doi)
    dialog.dataset.link = link.href
    dialog.querySelector('[data-document-id]').textContent = doi ? '当前文献 DOI：' + doi : '链接只用于打开同一页面。当前设备的本地文件、进度和备份不会自动传到另一台电脑。'
    dialog.querySelector('[data-copy-document]').textContent = doi ? '复制文献链接' : '复制页面链接'
    dialog.querySelector('[data-guide-status]').textContent = ''
    dialog.showModal()
  }
  function refresh() {
    groupActions()
    if (!document.getElementById('biko-assistant-load') && manifest('chat').length) {
      var button = document.createElement('button'); button.id = 'biko-assistant-load'; button.hidden = true; button.type = 'button'
      button.textContent = '多多助手'; document.body.appendChild(button)
      button.onclick = function () {
        if (button.disabled) return
        if (chatReady) { window.NANALY?.open(); return }
        button.disabled = true
        var launchPath = location.pathname, launchEpoch = routeEpoch
        var status = document.getElementById('biko-asset-status')
        if (!status) { status = document.createElement('p'); status.id = 'biko-asset-status'; status.setAttribute('role','status'); document.body.appendChild(status) }
        if (window.BikoFeedback) window.BikoFeedback.show('正在加载多多助手…', { kind: 'loading' })
        else status.textContent = '正在加载多多助手…'
        ensure('chat').then(function () {
          chatReady = true; status.textContent = ''
          window.dispatchEvent(new Event('biko:assistant-ready'))
          if (location.pathname === launchPath && routeEpoch === launchEpoch) {
            window.BikoFeedback?.show('多多助手已就绪', { kind: 'success' }); window.NANALY?.open()
          }
        }).catch(function (error) {
          if (location.pathname !== launchPath || routeEpoch !== launchEpoch) return
          if (window.BikoFeedback) window.BikoFeedback.show('助手加载失败，可重试。', { kind: 'error', retry: function () { button.click() } })
          else status.textContent = error.message + '，可从菜单再次打开。'
        }).finally(function () { button.disabled = false })
      }
    }
  }
  window.BIKO_ADAPTIVE = { refresh:refresh, ensure:ensure }
  function leavePage() {
    routeEpoch++
    groups.forEach(function (g) { g.details.open = false })
    var dialog = document.getElementById('mobile-desktop-dialog')
    if (dialog?.open) dialog.close()
    var status = document.getElementById('biko-asset-status')
    if (status) status.textContent = ''
  }
  document.addEventListener('pjax:send', leavePage)
  window.addEventListener('pagehide', leavePage)
  document.addEventListener('click', function (event) {
    if (!narrow.matches) return
    var trigger = event.target.closest('a[href^="scholar-local:"], #desktopOpenLink, #readerDesktopBtnAnnot, [data-desktop-only], #aiEnrichBtn, #pubAddBtn, #piAiBtn, #bk-annot-region, #bk-ann-region, #bk-region-toggle, #bk-ann-export, #bk-bi-image, #bk-bi-generate, #bk-ann-clear, #bk-bi-clear, .nanaly-studio-entry')
    if (!trigger && /^\/admin\//.test(location.pathname)) trigger = event.target.closest('.add-btn,.edit-btn,.delete-btn,.save-btn,[onclick^="pullBangumi"]')
    if (trigger) { event.preventDefault(); event.stopImmediatePropagation(); desktopGuide(trigger); return }
    groups.forEach(function (g) { if (!g.details.contains(event.target)) g.details.open = false })
  }, true)
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return
    groups.forEach(function (g) { if (g.details.open) { g.details.open = false; g.details.querySelector('summary').focus() } })
  })
  narrow.addEventListener('change', function () { refresh(); optionalDesktop() })
  window.addEventListener('biko:assistant-ready', refresh)
  document.addEventListener('pjax:complete', refresh)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, {once:true}); else refresh()
  function optionalDesktop() {
    if (narrow.matches || document.hidden) return
    if (document.documentElement.classList.contains('biko-home-pending') || document.querySelector('#biko-hub.show')) return
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) ensure('model').catch(function () {})
  }
  document.addEventListener('biko:home-entered', optionalDesktop)
  document.addEventListener('pjax:complete', optionalDesktop)
  document.addEventListener('visibilitychange', function () { if (!document.hidden) optionalDesktop() })
  if (window.requestIdleCallback) window.requestIdleCallback(optionalDesktop,{timeout:2500})
  else setTimeout(optionalDesktop,1200)
})()
