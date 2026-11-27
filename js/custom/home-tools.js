/* One persistent home modal for the heavier, lazily loaded tool workspaces. */
;(function () {
  'use strict'
  if (window.BikoHomeTools) return
  const registry = {
    images: ['图片工具', '水印、去底、转换与人像精修'],
    qrcode: ['二维码', '网址、文字与 Wi-Fi'],
    knowledge: ['知识图谱', '同一份笔记，导图与星图'],
    math: ['原理实验', '函数与磁共振，调整参数看变化'],
    periodic: ['元素周期表', '118 种元素 · 热力图与 3D 原子模型'],
    translate: ['翻译', '百度与有道双引擎 · 文本多语互译']
  }
  let layer, panel, current, trigger
  const frames = new Map()
  const pending = new Map()
  function renderLoading() {
    const frame = frames.get(current), loading = layer.querySelector('.home-tool-loading')
    loading.hidden = frame?.dataset.loaded === 'true'
    const failed = frame?.dataset.loadState === 'failed'
    loading.querySelector('span').textContent = failed ? '工具未能及时打开，请检查网络后重试' : '正在准备工具…'
    loading.querySelector('button').hidden = !failed
  }
  function watchLoad(frame, name) {
    clearTimeout(pending.get(frame))
    frame.dataset.loaded = 'false'; frame.dataset.loadState = 'loading'
    pending.set(frame, setTimeout(() => failLoad(frame, name), 15000))
  }
  function failLoad(frame, name) {
    clearTimeout(pending.get(frame)); pending.delete(frame)
    frame.dataset.loadState = 'failed'
    if (current === name) renderLoading()
  }
  function syncTheme() {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    for (const frame of frames.values()) {
      if (frame.dataset.loaded === 'true') {
        frame.contentWindow.postMessage({ type: 'biko-tools:theme', theme }, location.origin)
        frame.contentWindow.postMessage({ type: 'biko-tools:visibility', visible: !document.hidden && !layer.hidden && frame === frames.get(current) }, location.origin)
      }
    }
  }
  function close(restoreFocus) {
    if (!layer || layer.hidden) return
    layer.hidden = true
    window.BikoToolElectric?.hide(layer)
    syncTheme()
    window.BikoToolBackground('workspace', false)
    if (restoreFocus !== false && trigger?.isConnected) trigger.focus({ preventScroll: true })
  }
  function edgeControl(root, last) {
    const nodes = []
    root.querySelectorAll('a[href],button,input,select,textarea,iframe,[tabindex]').forEach(node => {
      if (node.classList.contains('tool-focus-boundary') || node.tabIndex < 0 || node.matches(':disabled') || node.closest('[hidden],[inert]') || !node.getClientRects().length) return
      if (node.ownerDocument.defaultView.getComputedStyle(node).visibility === 'hidden') return
      if (node.tagName === 'IFRAME') {
        try { nodes.push(edgeControl(node.contentDocument, last) || node) } catch (_) { nodes.push(node) }
      } else nodes.push(node)
    })
    return last ? nodes[nodes.length - 1] : nodes[0]
  }
  function ensure() {
    if (layer) return
    layer = document.createElement('div')
    layer.className = 'home-tool-layer'; layer.hidden = true
    layer.innerHTML = '<section class="home-tool-window" role="dialog" aria-modal="true" aria-labelledby="home-tool-title">' +
      '<header class="home-tool-head"><div><h2 id="home-tool-title"></h2><p id="home-tool-hint"></p></div>' +
      '<button type="button" class="home-tool-expand" aria-pressed="false">展开工作区</button>' +
      '<button type="button" class="home-tool-close" aria-label="关闭工具">×</button></header>' +
      '<div class="home-tool-stage"><div class="home-tool-loading"><span role="status">正在准备工具…</span><button type="button" hidden>重新加载</button></div></div></section>'
    document.body.append(layer)
    panel = layer.querySelector('[role=dialog]')
    layer.querySelector('.home-tool-loading button').onclick = () => {
      const frame = frames.get(current)
      if (!frame || frame.dataset.loadState !== 'failed') return
      const url = new URL(frame.src); url.searchParams.set('_retry', Date.now())
      watchLoad(frame, current); renderLoading(); frame.src = url.href
      layer.querySelector('.home-tool-close').focus({ preventScroll: true })
    }
    // Native Tab moves through nested same-origin frames and reaches these guards.
    // Resolve the real first/last control at focus time, including tools loaded later.
    for (const edge of ['start', 'end']) {
      const guard = document.createElement('span')
      guard.className = 'tool-focus-boundary'; guard.tabIndex = 0
      guard.dataset.edge = edge; guard.setAttribute('aria-hidden', 'true')
      guard.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none'
      guard.addEventListener('focus', () => {
        if (layer.hidden) return
        const target = edgeControl(panel, edge === 'start') || layer.querySelector('.home-tool-close')
        target.focus({ preventScroll: edge === 'end' })
      })
      if (edge === 'start') panel.prepend(guard); else panel.append(guard)
    }
    layer.querySelector('.home-tool-close').onclick = close
    layer.addEventListener('click', e => { if (e.target === layer) close() })
    const expand = layer.querySelector('.home-tool-expand')
    expand.onclick = () => {
      const full = panel.classList.toggle('is-expanded')
      expand.setAttribute('aria-pressed', String(full)); expand.textContent = full ? '还原窗口' : '展开工作区'
      window.BikoToolElectric?.place(layer)
    }
    document.addEventListener('keydown', e => {
      if (layer.hidden) return
      if (e.key === 'Escape' && !e.defaultPrevented && panel.contains(document.activeElement)) { e.preventDefault(); close() }
    })
    document.addEventListener('pjax:send', () => close(false))
    document.addEventListener('visibilitychange', syncTheme)
    window.addEventListener('pagehide', () => close(false))
    new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('message', e => {
      if (layer.hidden || e.origin !== location.origin || e.source !== frames.get(current)?.contentWindow) return
      if (e.data?.type === 'biko-tools:escape') close()
    })
  }
  function open(name, opener) {
    if (!registry[name]) return
    ensure()
    current = name
    if (opener || layer.hidden) trigger = opener || document.activeElement
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    layer.querySelector('h2').textContent = registry[name][0]
    layer.querySelector('#home-tool-hint').textContent = registry[name][1]
    layer.querySelector('.home-tool-close').setAttribute('aria-label', '关闭' + registry[name][0])
    for (const [id, frame] of frames) frame.hidden = id !== name
    let frame = frames.get(name)
    if (!frame) {
      frame = document.createElement('iframe'); frame.title = registry[name][0] + '工作区'
      frame.src = '/tools/' + name + '/?embed=1&theme=' + theme
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-downloads allow-modals allow-popups')
      watchLoad(frame, name)
      frame.onerror = () => failLoad(frame, name)
      frame.onload = () => {
        // A server error page also emits load; only our workspace is a successful open.
        try { if (!frame.contentDocument?.querySelector('.tool-body')) { failLoad(frame, name); return } } catch (_) { failLoad(frame, name); return }
        clearTimeout(pending.get(frame)); pending.delete(frame)
        frame.dataset.loaded = 'true'; frame.dataset.loadState = 'ready'
        syncTheme(); if (current === name) renderLoading()
      }
      frames.set(name, frame); layer.querySelector('.home-tool-stage').append(frame)
    } else {
      frame.contentWindow.postMessage({ type: 'biko-tools:theme', theme }, location.origin)
    }
    renderLoading()
    layer.hidden = false
    window.BikoToolElectric?.show(layer, panel)
    syncTheme()
    window.BikoToolBackground('workspace', true)
    layer.querySelector('.home-tool-close').focus({ preventScroll: true })
  }
  window.BikoHomeTools = { open, close }
})()
