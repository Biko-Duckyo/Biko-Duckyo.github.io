;(function () {
  'use strict'
  const setups = {
    qrcode: { title: '二维码', tabs: [['qrcode', '二维码生成', '/tools/apps/qrcode/']] },
    images: { title: '图片工具', tabs: [['image', '图片处理', '/tools/apps/image/'], ['portrait', '人像与精修', '/tools/apps/portrait/']] },
    knowledge: { title: '知识图谱', tabs: [['mindmap', '笔记导图', '/tools/apps/mindmap/'], ['atlas', '知识星图', '/tools/apps/atlas/']] },
    math: { title: '原理实验', tabs: [['math', '函数实验', '/tools/apps/math/'], ['science', '磁共振原理', '/tools/apps/science/?embed=1']] },
    periodic: { title: '元素周期表', tabs: [['periodic', '周期表', '/tools/apps/periodic/']] },
    translate: { title: '翻译', tabs: [['translate', '文本翻译', '/tools/apps/translate/']] }
  }
  const setup = setups[document.body.dataset.workspace]
  const nav = document.querySelector('nav'), stage = document.querySelector('.tool-body'), loading = document.querySelector('.tool-loading')
  const frames = new Map()
  const pending = new Map()
  let current, theme, visible = true
  loading.replaceChildren()
  loading.removeAttribute('role')
  const status = document.createElement('span'), retry = document.createElement('button')
  status.setAttribute('role', 'status'); retry.type = 'button'; retry.className = 'tool-action'; retry.textContent = '重新加载'
  loading.append(status, retry)
  function renderLoading() {
    const frame = frames.get(current), failed = frame?.dataset.loadState === 'failed'
    loading.hidden = frame?.dataset.loaded === 'true'
    status.textContent = failed ? '工具未能及时打开，请检查网络后重试' : '正在准备工具…'
    retry.hidden = !failed
  }
  function failLoad(frame, id) {
    clearTimeout(pending.get(frame)); pending.delete(frame)
    frame.dataset.loadState = 'failed'
    if (current === id) renderLoading()
  }
  function watchLoad(frame, id) {
    clearTimeout(pending.get(frame))
    frame.dataset.loaded = 'false'; frame.dataset.loadState = 'loading'
    pending.set(frame, setTimeout(() => failLoad(frame, id), 15000))
  }
  function reload(frame, id, source) {
    watchLoad(frame, id)
    if (current === id) renderLoading()
    frame.src = source
  }
  retry.onclick = () => {
    const frame = frames.get(current)
    if (!frame || frame.dataset.loadState !== 'failed') return
    const url = new URL(frame.src); url.searchParams.set('_retry', Date.now())
    // Move focus before hiding Retry; keep keyboard users in the workspace.
    const target = nav.querySelector('[aria-current=page]') || stage
    if (target === stage) stage.tabIndex = -1
    target.focus({ preventScroll: true })
    reload(frame, current, url.href)
  }
  function syncVisibility() {
    for (const [key, frame] of frames) frame.contentWindow.postMessage({ type: 'biko-tools:visibility', visible: !document.hidden && visible && key === current }, location.origin)
  }
  try { theme = localStorage.getItem('theme'); if (theme?.startsWith('{')) theme = JSON.parse(theme).value } catch {}
  const options = new URLSearchParams(location.search)
  document.documentElement.dataset.theme = (options.get('theme') || theme) === 'dark' ? 'dark' : 'light'
  if (options.get('embed') === '1') document.body.classList.add('tool-embedded')
  if (setup.tabs.length === 1) nav.hidden = true
  document.querySelector('h1').textContent = setup.title
  function activate(id, update = true) {
    const tab = setup.tabs.find(t => t[0] === id) || setup.tabs[0]
    if (current === 'mindmap' && tab[0] === 'atlas') {
      // Flush the last keystroke before the editor's debounced persistence.
      const editor = frames.get('mindmap')?.contentDocument?.querySelector('textarea')
      try { if (editor) localStorage.setItem('doc-to-diagram:src', editor.value) } catch {}
    }
    current = tab[0]
    for (const [key, frame] of frames) frame.hidden = key !== current
    if (!frames.has(current)) {
      const frame = document.createElement('iframe')
      frame.title = tab[1]; frame.src = tab[2]
      if (current === 'atlas') {
        try { frame.dataset.note = localStorage.getItem('doc-to-diagram:src') || '' } catch {}
      }
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-downloads allow-modals allow-popups')
      frame.referrerPolicy = 'same-origin'
      watchLoad(frame, current)
      frame.addEventListener('error', () => failLoad(frame, tab[0]))
      frame.addEventListener('load', () => {
        // Browsers fire load for HTTP error pages too. Check the local app shell,
        // without claiming that every model or image inside it has finished loading.
        try {
          const shell = frame.contentDocument?.querySelector('script[src="/tools/app-bridge.js"],.lab,#app-content')
          if (!shell) { failLoad(frame, tab[0]); return }
        } catch (_) { failLoad(frame, tab[0]); return }
        clearTimeout(pending.get(frame)); pending.delete(frame)
        frame.dataset.loaded = 'true'
        frame.dataset.loadState = 'ready'
        frame.contentWindow.postMessage({ type: 'biko-tools:theme', theme: document.documentElement.dataset.theme }, location.origin)
        syncVisibility()
        if (current === tab[0]) renderLoading()
      })
      frame.addEventListener('load', () => {
        // The older portrait editor has its own nested modal: let it handle Esc first.
        if (tab[0] !== 'portrait' || frame.dataset.loaded !== 'true') return
        frame.contentDocument?.addEventListener('keydown', e => {
          if (e.key === 'Escape' && !e.defaultPrevented && !frame.contentDocument.querySelector('[role=dialog]:not([hidden])')) {
            parent.postMessage({ type: 'biko-tools:escape' }, location.origin)
          }
        })
      })
      frames.set(current, frame); stage.append(frame)
    } else {
      loading.hidden = true
      if (current === 'atlas') {
        let note
        try { note = localStorage.getItem('doc-to-diagram:src') } catch {}
        const frame = frames.get(current)
        if (note !== frame.dataset.note) { frame.dataset.note = note || ''; reload(frame, current, tab[2]) }
      }
    }
    renderLoading()
    for (const link of nav.querySelectorAll('a')) {
      if (link.dataset.tab === current) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    }
    const rebuild = document.querySelector('#rebuild-atlas')
    if (rebuild) rebuild.hidden = current !== 'atlas'
    if (update) history.replaceState(null, '', '#' + current)
    syncVisibility()
  }
  for (const tab of setup.tabs) {
    const link = document.createElement('a')
    link.href = '#' + tab[0]; link.textContent = tab[1]; link.dataset.tab = tab[0]
    link.addEventListener('click', e => { e.preventDefault(); activate(tab[0]) })
    nav.append(link)
  }
  if (setup === setups.knowledge) {
    const rebuild = document.createElement('button')
    rebuild.id = 'rebuild-atlas'; rebuild.className = 'tool-action'; rebuild.textContent = '更新星图'
    rebuild.title = '根据共同笔记重新生成知识星图，不上传资料'
    rebuild.onclick = () => {
      const frame = frames.get('atlas')
      if (frame) reload(frame, 'atlas', '/tools/apps/atlas/')
    }
    document.querySelector('.tool-header').append(rebuild)
  }
  window.addEventListener('message', e => {
    if (e.origin === location.origin && e.source === parent && e.data?.type === 'biko-tools:visibility') { visible = e.data.visible === true; syncVisibility(); return }
    if (e.origin === location.origin && e.source === parent && e.data?.type === 'biko-tools:theme') {
      document.documentElement.dataset.theme = e.data.theme === 'dark' ? 'dark' : 'light'
      for (const frame of frames.values()) frame.contentWindow.postMessage(e.data, location.origin)
      return
    }
    if (e.origin !== location.origin || !Array.from(frames.values()).some(f => f.contentWindow === e.source)) return
    if (e.source !== frames.get(current)?.contentWindow) return
    if (e.data?.type === 'biko-tools:notes' && setup === setups.knowledge) activate('mindmap')
    if (e.data?.type === 'biko-tools:escape') parent.postMessage(e.data, location.origin)
  })
  window.addEventListener('hashchange', () => activate(location.hash.slice(1), false))
  document.addEventListener('visibilitychange', syncVisibility)
  window.addEventListener('pagehide', () => { visible = false; syncVisibility() })
  window.addEventListener('pageshow', () => {
    if (parent === window) visible = true
    syncVisibility()
  })
  activate(location.hash.slice(1), false)
})()
