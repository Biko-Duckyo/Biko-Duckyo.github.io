;(function () {
  'use strict'
  const app = location.pathname.split('/').filter(Boolean).at(-1)
  document.documentElement.dataset.bikoTool = app
  function setTheme(theme) {
    theme = theme === 'dark' ? 'dark' : 'light'
    // Keep the original renderers' state in step with CSS, without reloading
    // a user's selected image or edited note when the site theme changes.
    if (app === 'atlas') {
      const action = theme === 'dark' ? '切换暗色主题' : '切换亮色主题'
      document.querySelector('.g-topbar button[aria-label="' + action + '"]')?.click()
    } else if (app === 'image' && document.documentElement.dataset.theme !== theme) {
      document.querySelector('.ib-header button[aria-label="切换明暗主题"]')?.click()
    }
    document.documentElement.dataset.theme = theme
  }
  try {
    const theme = parent.document.documentElement.dataset.theme || 'light'
    setTheme(theme)
    if (app === 'atlas') localStorage.setItem('knowledge-atlas:theme', theme)
    if (app === 'image') localStorage.setItem('kit-theme', theme)
  } catch {}
  window.addEventListener('message', e => {
    if (e.source === parent && e.origin === location.origin && e.data?.type === 'biko-tools:theme') setTheme(e.data.theme)
  })
  if (app === 'atlas') {
    let note
    try { note = localStorage.getItem(BikoKnowledge.key) } catch {}
    window.BikoToolGraph = BikoKnowledge.graph(note || BikoKnowledge.sample)
  }
  // Atlas and the diagram editor share one note, rather than separate libraries.
  if (app === 'mindmap') {
    try { if (!localStorage.getItem(BikoKnowledge.key)) localStorage.setItem(BikoKnowledge.key, BikoKnowledge.sample) } catch {}
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !e.defaultPrevented && !document.querySelector('[role=dialog]:not([hidden])')) parent.postMessage({ type: 'biko-tools:escape' }, location.origin)
  })
})()
