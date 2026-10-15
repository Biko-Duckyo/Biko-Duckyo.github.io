/* 娜娜莉的聊天小屋：独立管理窗口尺寸与布局，不读取聊天内容。 */
(() => {
  'use strict'
  if (window.NANALY_SHELL) return
  const KEY = 'nanaly-shell-v1'
  const MODES = ['dock', 'float', 'focus']
  const number = (value, fallback) => Number.isFinite(value) ? value : fallback
  const clamp = (value, min, max) => Math.min(Math.max(number(value, min), min), Math.max(min, max))
  const normalize = value => ({
    mode: MODES.includes(value?.mode) ? value.mode : 'dock',
    dockWidth: clamp(value?.dockWidth ?? 520, 400, 900),
    floatWidth: clamp(value?.floatWidth ?? 620, 400, 1200),
    floatHeight: clamp(value?.floatHeight ?? 740, 360, 1400),
    x: Number.isFinite(value?.x) ? value.x : null,
    y: Number.isFinite(value?.y) ? value.y : null
  })
  // Keep the whole shell within the visible viewport, including the mobile keyboard.
  const geometry = (preferences, viewport) => {
    const prefs = normalize(preferences)
    const vw = Math.max(1, number(viewport?.width, 1024))
    const vh = Math.max(1, number(viewport?.height, 768))
    const mobile = vw <= 640
    const gap = Math.min(mobile ? 6 : (vh < 480 ? 8 : 16), Math.max(0, (Math.min(vw, vh) - 1) / 2))
    const maxWidth = Math.max(1, vw - gap * 2), maxHeight = Math.max(1, vh - gap * 2)
    const minWidth = Math.min(400, maxWidth), minHeight = Math.min(360, maxHeight)
    let width, height, x, y
    if (mobile) { width = maxWidth; height = maxHeight; x = gap; y = gap }
    else if (prefs.mode === 'dock') {
      width = clamp(prefs.dockWidth, minWidth, Math.min(900, maxWidth))
      height = maxHeight; x = vw - gap - width; y = gap
    } else if (prefs.mode === 'focus') {
      width = Math.min(1160, maxWidth); height = maxHeight; x = (vw - width) / 2; y = gap
    } else {
      width = clamp(prefs.floatWidth, minWidth, Math.min(1200, maxWidth))
      height = clamp(prefs.floatHeight, minHeight, maxHeight)
      x = clamp(prefs.x ?? vw - width - 24, gap, vw - gap - width)
      y = clamp(prefs.y ?? vh - height - 24, gap, vh - gap - height)
    }
    return { x, y, width, height, minWidth, minHeight, maxWidth, maxHeight, gap, mobile }
  }
  const mount = ({ panel, launcher, input, onCloseDrawer } = {}) => {
    if (!panel) return null
    if (panel._nanalyShell) return panel._nanalyShell
    let preferences = normalize(), storage
    try { storage = window.localStorage; preferences = normalize(JSON.parse(storage.getItem(KEY) || 'null')) } catch (_) {}
    const save = () => { try { storage?.setItem(KEY, JSON.stringify(preferences)) } catch (_) {} }
    const doc = panel.ownerDocument || document
    const head = panel.querySelector('.nanaly-head')
    const workspaceBar = panel.querySelector('.nanaly-workspace-bar')
    const drawer = panel.querySelector('.nanaly-workspace-drawer')
    const originalButtons = head ? [...head.querySelectorAll('.nanaly-head__btn')] : []
    const make = (tag, className, text) => {
      const element = doc.createElement(tag)
      element.className = className
      if (text) element.textContent = text
      return element
    }
    const listen = (target, event, handler, options) => {
      target?.addEventListener(event, handler, options)
      cleanup.push(() => target?.removeEventListener(event, handler, options))
    }
    const cleanup = [], added = []
    const controls = make('div', 'nanaly-head__actions')
    if (head) { originalButtons.forEach(button => controls.appendChild(button)); head.appendChild(controls) }
    const toolbar = make('div', 'nanaly-shell-toolbar nanaly-shell-bar')
    toolbar.setAttribute('role', 'group'); toolbar.setAttribute('aria-label', '聊天窗口布局')
    const modes = make('div', 'nanaly-shell-modes')
    const labels = { dock: '靠边', float: '浮窗', focus: '专注' }
    const modeButtons = MODES.map(mode => {
      const button = make('button', 'nanaly-shell-mode', labels[mode])
      button.type = 'button'; button.dataset.mode = mode
      button.title = { dock: '靠在右侧，边看文章边聊天', float: '自由调整窗口大小和位置', focus: '宽敞地专心聊天' }[mode]
      button.setAttribute('aria-label', button.title)
      listen(button, 'click', () => { preferences.mode = mode; save(); refresh() })
      modes.appendChild(button)
      return button
    })
    const hint = make('span', 'nanaly-shell-hint', '拖动左边缘调宽')
    const actions = make('div', 'nanaly-shell-actions')
    toolbar.append(modes, hint, actions)
    panel.insertBefore(toolbar, head?.nextSibling || panel.firstChild)
    const scrim = make('button', 'nanaly-shell-scrim')
    scrim.type = 'button'; scrim.tabIndex = -1; scrim.setAttribute('aria-label', '收起侧栏')
    const drawerHeading = make('strong', 'nanaly-shell-drawer-heading')
    const drawerClose = make('button', 'nanaly-shell-drawer-close', '收起 ×')
    drawerClose.type = 'button'; drawerClose.setAttribute('aria-label', '收起话题与记忆侧栏')
    const widthHandle = make('div', 'nanaly-shell-resize nanaly-shell-resize--width')
    widthHandle.tabIndex = 0; widthHandle.setAttribute('role', 'separator')
    widthHandle.setAttribute('aria-label', '调整聊天窗口宽度，使用左右方向键')
    widthHandle.setAttribute('aria-orientation', 'vertical')
    widthHandle.title = '左右拖动调整宽度；也可以使用左右方向键，双击恢复默认'
    const heightHandle = make('div', 'nanaly-shell-resize nanaly-shell-resize--height')
    heightHandle.tabIndex = 0; heightHandle.setAttribute('role', 'separator')
    heightHandle.setAttribute('aria-label', '调整聊天窗口高度，使用上下方向键')
    heightHandle.setAttribute('aria-orientation', 'horizontal')
    heightHandle.title = '上下拖动调整高度；也可以使用上下方向键，双击恢复默认'
    panel.append(scrim, drawerHeading, drawerClose, widthHandle, heightHandle)
    added.push(toolbar, scrim, drawerHeading, drawerClose, widthHandle, heightHandle)
    panel.classList.add('nanaly-shell')
    panel.classList.remove('nanaly-expanded')
    const legacyExpand = panel.querySelector('[aria-label="切换宽屏聊天"]')
    if (legacyExpand) legacyExpand.hidden = true
    const viewport = () => ({
      width: window.visualViewport?.width || window.innerWidth || doc.documentElement.clientWidth,
      height: window.visualViewport?.height || window.innerHeight || doc.documentElement.clientHeight,
      left: window.visualViewport?.offsetLeft || 0, top: window.visualViewport?.offsetTop || 0
    })
    let destroyed = false, scheduled = 0, current, drag = null
    const setClass = (name, on) => { if (panel.classList.contains(name) !== on) panel.classList.toggle(name, on) }
    const refresh = () => {
      if (destroyed) return
      const view = viewport()
      current = geometry(preferences, view)
      panel.dataset.nanalyLayout = preferences.mode
      panel.dataset.nanalyMobile = String(current.mobile)
      panel.dataset.nanalyWide = String(current.width >= 900)
      const actionsParent = current.mobile && workspaceBar ? workspaceBar : toolbar
      if (actions.parentNode !== actionsParent) actionsParent.appendChild(actions)
      for (const [name, value] of Object.entries({ x: current.x + view.left, y: current.y + view.top, width: current.width, height: current.height })) {
        panel.style.setProperty('--nanaly-shell-' + name, value + 'px')
      }
      modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === preferences.mode)))
      hint.textContent = preferences.mode === 'focus' ? '留一点空间，慢慢聊' : preferences.mode === 'float' ? '拖动标题移动 · 边缘调大小' : '拖动左边缘调宽'
      widthHandle.hidden = current.mobile || preferences.mode === 'focus'
      heightHandle.hidden = current.mobile || preferences.mode !== 'float'
      for (const [handle, kind] of [[widthHandle, 'Width'], [heightHandle, 'Height']]) {
        handle.setAttribute('aria-valuemin', String(current['min' + kind]))
        const max = kind === 'Width'
          ? Math.min(current.maxWidth, preferences.mode === 'dock' ? 900 : current.x + current.width - current.gap)
          : viewport().height - current.y - current.gap
        handle.setAttribute('aria-valuemax', String(max))
        handle.setAttribute('aria-valuenow', String(Math.round(current[kind.toLowerCase()])))
      }
      const opened = panel.classList.contains('is-open')
      const drawerOpen = Boolean(opened && drawer && !drawer.hidden)
      setClass('nanaly-shell--drawer', drawerOpen)
      drawerClose.hidden = drawerHeading.hidden = !drawerOpen
      scrim.hidden = !drawerOpen || current.width >= 900
      if (drawerOpen) {
        const top = workspaceBar ? workspaceBar.offsetTop + workspaceBar.offsetHeight + 8 : toolbar.offsetTop + toolbar.offsetHeight + 8
        panel.style.setProperty('--nanaly-drawer-top', top + 'px')
        const memory = workspaceBar?.querySelector('[aria-expanded="true"]')?.textContent?.includes('记忆')
        drawerHeading.textContent = memory ? '记忆小本子' : '我们的对话'
      }
      if (launcher) launcher.classList.toggle('nanaly-shell-launcher-hidden', opened && (current.mobile || preferences.mode === 'focus' || preferences.mode === 'float'))
      setClass('nanaly-shell--sleeping', doc.hidden === true)
    }
    const schedule = () => {
      if (scheduled || destroyed) return
      scheduled = window.requestAnimationFrame(() => { scheduled = 0; refresh() })
    }
    const closeDrawer = () => {
      if (typeof onCloseDrawer === 'function') onCloseDrawer()
      else workspaceBar?.querySelector('[aria-expanded="true"]')?.click()
      refresh()
    }
    listen(scrim, 'click', closeDrawer); listen(drawerClose, 'click', closeDrawer)
    listen(panel, 'keydown', event => {
      if (event.key === 'Escape' && drawer && !drawer.hidden) {
        event.preventDefault(); event.stopPropagation(); closeDrawer(); input?.focus()
      }
    }, true)
    const resize = (kind, amount, origin = current) => {
      if (current.mobile || preferences.mode === 'focus') return
      if (kind === 'width') {
        const max = Math.min(current.maxWidth, preferences.mode === 'dock' ? 900 : origin.x + origin.width - current.gap)
        const width = clamp(origin.width + amount, current.minWidth, max)
        if (preferences.mode === 'dock') preferences.dockWidth = width
        else { preferences.floatWidth = width; preferences.x = origin.x + origin.width - width; preferences.y = origin.y }
      } else if (preferences.mode === 'float') {
        preferences.floatHeight = clamp(origin.height + amount, current.minHeight, viewport().height - origin.y - current.gap)
        preferences.x = origin.x; preferences.y = origin.y
      }
      refresh()
    }
    for (const [handle, kind] of [[widthHandle, 'width'], [heightHandle, 'height']]) {
      listen(handle, 'pointerdown', event => {
        if (event.button !== 0 || handle.hidden) return
        event.preventDefault(); handle.focus(); handle.setPointerCapture?.(event.pointerId)
        drag = { kind, origin: { ...current }, x: event.clientX, y: event.clientY, id: event.pointerId }
        setClass('nanaly-shell--resizing', true)
      })
      listen(handle, 'keydown', event => {
        const direction = kind === 'width' ? { ArrowLeft: 1, ArrowRight: -1 } : { ArrowDown: 1, ArrowUp: -1 }
        if (!Object.hasOwn(direction, event.key)) return
        event.preventDefault(); resize(kind, direction[event.key] * (event.shiftKey ? 64 : 16)); save()
      })
      listen(handle, 'dblclick', () => {
        if (kind === 'width') { preferences.dockWidth = 520; preferences.floatWidth = 620; preferences.x = null }
        else { preferences.floatHeight = 740; preferences.y = null }
        save(); refresh()
      })
    }
    listen(head, 'pointerdown', event => {
      if (event.button !== 0 || preferences.mode !== 'float' || current.mobile || event.target.closest('button, a, input, select')) return
      event.preventDefault(); head.setPointerCapture?.(event.pointerId)
      drag = { kind: 'move', origin: { ...current }, x: event.clientX, y: event.clientY, id: event.pointerId }
      setClass('nanaly-shell--resizing', true)
    })
    listen(panel, 'pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return
      if (drag.kind === 'move') {
        preferences.x = drag.origin.x + event.clientX - drag.x
        preferences.y = drag.origin.y + event.clientY - drag.y
        refresh()
      } else resize(drag.kind, drag.kind === 'width' ? drag.x - event.clientX : event.clientY - drag.y, drag.origin)
    })
    const endDrag = () => { if (drag) { drag = null; setClass('nanaly-shell--resizing', false); save() } }
    listen(panel, 'pointerup', endDrag); listen(panel, 'pointercancel', endDrag); listen(panel, 'lostpointercapture', endDrag)
    listen(window, 'resize', schedule)
    listen(window.visualViewport, 'resize', schedule); listen(window.visualViewport, 'scroll', schedule)
    listen(doc, 'visibilitychange', schedule)
    let observer, sizeObserver
    if (window.MutationObserver) {
      observer = new window.MutationObserver(schedule)
      observer.observe(panel, { attributes: true, attributeFilter: ['class', 'aria-hidden'] })
      if (drawer) observer.observe(drawer, { attributes: true, attributeFilter: ['hidden'] })
    }
    if (window.ResizeObserver) {
      sizeObserver = new window.ResizeObserver(schedule)
      for (const element of [head, toolbar, workspaceBar]) if (element) sizeObserver.observe(element)
    }
    const api = {
      refresh,
      setMode(mode) { if (!MODES.includes(mode)) return false; preferences.mode = mode; save(); refresh(); return true },
      getLayout: () => ({ ...current, mode: preferences.mode }),
      destroy() {
        destroyed = true; observer?.disconnect(); sizeObserver?.disconnect()
        if (scheduled) window.cancelAnimationFrame(scheduled)
        cleanup.forEach(fn => fn()); added.forEach(node => node.remove())
        // On mobile this node lives in workspaceBar, outside the removed toolbar.
        actions.remove()
        for (const key of ['nanalyLayout', 'nanalyMobile', 'nanalyWide']) delete panel.dataset[key]
        for (const name of ['x', 'y', 'width', 'height']) panel.style.removeProperty('--nanaly-shell-' + name)
        panel.style.removeProperty('--nanaly-drawer-top')
        if (head) { originalButtons.forEach(button => head.appendChild(button)); controls.remove() }
        panel.classList.remove('nanaly-shell', 'nanaly-shell--drawer', 'nanaly-shell--resizing', 'nanaly-shell--sleeping')
        launcher?.classList.remove('nanaly-shell-launcher-hidden')
        if (legacyExpand) legacyExpand.hidden = false
        delete panel._nanalyShell
      }
    }
    panel._nanalyShell = api
    refresh()
    return api
  }
  window.NANALY_SHELL = { mount, geometry }
})()
