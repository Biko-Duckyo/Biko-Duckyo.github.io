;(function () {
  'use strict'

  const LANGUAGES = [
    ['auto', '自动检测'],
    ['zh', '中文（简体）'],
    ['en', '英语'],
    ['ja', '日语'],
    ['ko', '韩语'],
    ['fr', '法语'],
    ['es', '西班牙语'],
    ['ru', '俄语'],
    ['de', '德语'],
    ['pt', '葡萄牙语'],
    ['it', '意大利语'],
    ['ar', '阿拉伯语'],
    ['zh-TW', '中文（繁体）']
  ]
  const ENGINE_LABEL = { baidu: '百度翻译', youdao: '有道翻译' }
  const ENGINE_KEY = 'translate:engine'

  const $ = sel => document.querySelector(sel)
  const fromSelect = $('#from-lang')
  const toSelect = $('#to-lang')
  const swapBtn = $('#swap-lang')
  const source = $('#source')
  const result = $('#result')
  const counter = $('#counter')
  const resultMeta = $('#result-meta')
  const translateBtn = $('#translate-btn')
  const copyBtn = $('#copy-btn')
  const toastEl = $('#toast')

  let toastTimer = null
  function toast(message) {
    toastEl.textContent = message
    toastEl.hidden = false
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastEl.hidden = true }, 2600)
  }

  /* ---------- 主题 ---------- */

  const params = new URLSearchParams(location.search)
  let initialTheme = params.get('theme')
  if (initialTheme !== 'dark' && initialTheme !== 'light') {
    try { initialTheme = parent.document.documentElement.dataset.theme || 'light' } catch { initialTheme = 'light' }
  }
  document.documentElement.dataset.theme = initialTheme === 'dark' ? 'dark' : 'light'
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || e.data?.type !== 'biko-tools:theme') return
    document.documentElement.dataset.theme = e.data.theme === 'dark' ? 'dark' : 'light'
  })

  /* ---------- 语言选择 ---------- */

  function fillSelect(select, selected) {
    select.innerHTML = LANGUAGES.map(([code, name]) =>
      '<option value="' + code + '"' + (code === selected ? ' selected' : '') + '>' + name + '</option>'
    ).join('')
  }
  fillSelect(fromSelect, 'auto')
  fillSelect(toSelect, 'en')

  function updateSwapState() { swapBtn.disabled = fromSelect.value === 'auto' }
  fromSelect.addEventListener('change', updateSwapState)
  updateSwapState()

  swapBtn.addEventListener('click', () => {
    if (fromSelect.value === 'auto') return
    const prevFrom = fromSelect.value
    fromSelect.value = toSelect.value
    toSelect.value = prevFrom
    updateSwapState()
  })

  /* ---------- Tab 切换 ---------- */

  document.querySelectorAll('.tr-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tr-tab').forEach(t => {
        t.classList.toggle('is-active', t === tab)
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false')
      })
      const name = tab.dataset.tab
      document.querySelectorAll('.tr-panel').forEach(panel => {
        const active = panel.dataset.panel === name
        panel.classList.toggle('is-active', active)
        panel.hidden = !active
      })
    })
  })

  /* ---------- 引擎切换 ---------- */

  let engine = 'baidu'
  try {
    const saved = localStorage.getItem(ENGINE_KEY)
    if (saved === 'youdao' || saved === 'baidu') engine = saved
  } catch {}

  function renderEngine() {
    document.querySelectorAll('.tr-engine-btn').forEach(btn => {
      const active = btn.dataset.engine === engine
      btn.classList.toggle('is-active', active)
      btn.setAttribute('aria-pressed', active ? 'true' : 'false')
    })
  }
  renderEngine()

  document.querySelectorAll('.tr-engine-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      engine = btn.dataset.engine
      try { localStorage.setItem(ENGINE_KEY, engine) } catch {}
      renderEngine()
    })
  })

  /* ---------- 文本翻译（仅手动触发） ---------- */

  source.addEventListener('input', () => {
    counter.textContent = source.value.length + ' / 5000'
  })

  async function runTranslate() {
    const text = source.value.trim()
    if (!text) { toast('请输入要翻译的文字'); source.focus(); return }

    result.classList.remove('is-error')
    result.textContent = ''
    resultMeta.textContent = ''
    copyBtn.hidden = true
    translateBtn.disabled = true
    translateBtn.textContent = '翻译中…'

    try {
      const res = await fetch('/api/translate/text', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: engine,
          text,
          from: fromSelect.value,
          to: toSelect.value
        })
      })
      const data = await res.json()
      if (data.ok) {
        result.textContent = data.text
        resultMeta.textContent = ENGINE_LABEL[engine] + ' · ' + data.from + ' → ' + data.to
        copyBtn.hidden = false
      } else {
        result.classList.add('is-error')
        result.textContent = data.message || '翻译失败，请稍后再试'
      }
    } catch {
      result.classList.add('is-error')
      result.textContent = '网络异常，请检查连接后重试'
    } finally {
      translateBtn.disabled = false
      translateBtn.textContent = '翻译'
    }
  }

  translateBtn.addEventListener('click', runTranslate)
  source.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runTranslate() }
  })

  /* ---------- 复制 ---------- */

  copyBtn.addEventListener('click', async () => {
    const text = result.textContent
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      toast('译文已复制')
    } catch {
      toast('复制失败，请手动选择文本')
    }
  })

  /* ---------- 上传占位：不发起任何请求 ---------- */

  document.querySelectorAll('.tr-upload').forEach(zone => {
    zone.addEventListener('click', e => {
      if (e.target.closest('button')) toast('该能力即将上线，当前仅开放文本翻译')
    })
  })
})()
