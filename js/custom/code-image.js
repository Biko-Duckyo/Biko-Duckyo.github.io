/* Shared entry points for article code and completed assistant replies. */
;(function () {
  'use strict'
  if (window.BikoCodeImage) return
  let articleObserver, scheduled = false, loading
  const asset = path => ((window.GLOBAL_CONFIG_SITE?.root || '/') + path).replace(/([^:])\/{2,}/g, '$1/')
  function read(block) {
    const code = block.querySelector('td.code pre, pre code, code') || block
    const lines = code.querySelectorAll('.line')
    let text
    if (lines.length) text = Array.from(lines, line => line.textContent).join('\n')
    else {
      const clone = code.cloneNode(true)
      clone.querySelectorAll('button, .highlight-tools, .line-numbers-rows').forEach(node => node.remove())
      clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'))
      text = clone.textContent
    }
    const languageClass = (code.className + ' ' + block.className).match(/(?:language-|lang-)([\w+-]+)/)
    const language = languageClass?.[1] || block.dataset.language ||
      Array.from(block.classList).find(name => !['highlight', 'hljs', 'prismjs', 'default', 'code-fullpage'].includes(name)) || 'text'
    return { code: text, language, title: block.closest('.nanaly-msg--her') ? '鸭喵 AI · ' + language : document.title.split(' | ')[0] }
  }
  function add(block, assistant) {
    const existing = block.querySelector('[data-code-image]')
    if (existing) {
      const toolbar = block.querySelector('.highlight-tools')
      if (toolbar && existing.parentNode !== toolbar) toolbar.append(existing)
      return
    }
    const button = document.createElement('button')
    button.type = 'button'; button.className = 'code-image-trigger'
    button.dataset.codeImage = ''; button.textContent = '生成分享图'
    button.setAttribute('aria-label', '将这段代码生成分享图')
    button.setAttribute('aria-haspopup', 'dialog')
    if (assistant) block.classList.add('has-code-image')
    const toolbar = block.querySelector('.highlight-tools')
    if (toolbar) toolbar.append(button)
    else block.append(button)
  }
  function attach(root, options = {}) {
    if (!root) return
    if (options.assistant) {
      root.querySelectorAll('pre').forEach(pre => { if (pre.querySelector('code')) add(pre, true) })
    } else {
      root.querySelectorAll('figure.highlight').forEach(block => add(block, false))
      root.querySelectorAll('pre').forEach(pre => {
        if (!pre.closest('figure.highlight') && pre.querySelector('code')) add(pre, false)
      })
    }
  }
  function init() {
    articleObserver?.disconnect()
    const article = document.querySelector('#article-container')
    if (article) {
      attach(article)
      articleObserver = new MutationObserver(() => {
        if (scheduled) return
        scheduled = true
        queueMicrotask(() => { scheduled = false; if (article.isConnected) attach(article) })
      })
      articleObserver.observe(article, { childList: true, subtree: true })
    }
    document.querySelectorAll('.nanaly-msg--her').forEach(root => attach(root, { assistant: true }))
  }
  function load() {
    if (window.BikoCodeImageEditor) return Promise.resolve()
    if (loading) return loading
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = asset('js/custom/code-image-editor.js')
      script.onload = () => {
        if (window.BikoCodeImageEditor) resolve()
        else { script.remove(); loading = null; reject(new Error('制图窗口加载失败')) }
      }
      script.onerror = () => { script.remove(); loading = null; reject(new Error('制图窗口加载失败，请重试')) }
      document.head.append(script)
    })
    return loading
  }
  async function open(data, trigger) { await load(); window.BikoCodeImageEditor.open(data, trigger) }
  document.addEventListener('click', async event => {
    const button = event.target.closest?.('[data-code-image]')
    if (!button) return
    event.preventDefault(); event.stopPropagation()
    const block = button.closest('figure.highlight, pre')
    if (!block) return
    button.disabled = true; button.textContent = '正在打开…'
    try { await open(read(block), button); button.textContent = '生成分享图' }
    catch (error) { button.textContent = '加载失败，点击重试'; button.title = error.message }
    finally { button.disabled = false }
  }, true)
  document.addEventListener('pjax:send', () => { articleObserver?.disconnect(); window.BikoCodeImageEditor?.close() })
  document.addEventListener('pjax:complete', init)
  window.BikoCodeImage = { attach, open, read }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()
