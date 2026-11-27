/* Browser-local code images. SVG text is escaped; PNG uses the same SVG. */
;(function () {
  'use strict'
  if (window.BikoCodeImageEditor) return
  const THEMES = {
    night: { card: '#182334', ink: '#e5edf7', muted: '#8296af', keyword: '#c4a6f2', string: '#a8d7ac', number: '#f0bd89', function: '#91c9ef', comment: '#8296af' },
    paper: { card: '#f8fafc', ink: '#243448', muted: '#64748b', keyword: '#8051a8', string: '#277249', number: '#98551d', function: '#23639a', comment: '#64748b' }
  }
  const LANGUAGES = ['text', 'javascript', 'typescript', 'python', 'bash', 'json', 'markup', 'css', 'sql', 'yaml', 'markdown', 'c', 'cpp', 'java', 'latex', 'r']
  const aliases = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', sh: 'bash', shell: 'bash', shellscript: 'bash', html: 'markup', xml: 'markup', yml: 'yaml', md: 'markdown', py: 'python', tex: 'latex', plain: 'text', plaintext: 'text', 'c++': 'cpp' }
  const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])
  let dialog, opener, previewUrl, syntaxPromise, revision = 0, opening = 0, timer, measureContext
  const asset = path => ((window.GLOBAL_CONFIG_SITE?.root || '/') + path).replace(/([^:])\/{2,}/g, '$1/')
  function syntax() {
    if (window.BikoCodePrism) return Promise.resolve()
    if (syntaxPromise) return syntaxPromise
    syntaxPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = asset('js/vendor/prism-code-image.js')
      script.onload = resolve
      script.onerror = () => { script.remove(); syntaxPromise = null; reject(new Error('语法配色未加载，已使用纯文本')) }
      document.head.append(script)
    })
    return syntaxPromise
  }
  function flatten(tokens, inherited = '') {
    return tokens.flatMap(token => {
      if (typeof token === 'string') return [{ text: token, type: inherited }]
      const type = ['comment', 'string', 'keyword', 'number', 'function'].includes(token.type) ? token.type : inherited
      return flatten(Array.isArray(token.content) ? token.content : [token.content], type)
    })
  }
  function buildSvg(input, options, measure) {
    const code = input.code.replace(/\r\n?/g, '\n')
    if (code.length > 60000) throw new Error('这段代码较长，请在编辑框中选取 60000 字以内的片段')
    const theme = THEMES[options.theme] || THEMES.night
    const fontSize = options.fontSize, padding = options.padding, width = options.width
    const font = `${fontSize}px Consolas, "Liberation Mono", Menlo, monospace`
    if (!measure) {
      measureContext ||= document.createElement('canvas').getContext('2d')
      if (!measureContext) throw new Error('此浏览器暂不支持图片绘制')
      measureContext.font = font
      measure = text => measureContext.measureText(text).width
    }
    const lineHeight = Math.ceil(fontSize * 1.65), inset = 24
    const numberWidth = options.numbers ? measure(String(code.split('\n').length)) + 20 : 0
    const startX = padding + inset + numberWidth, endX = width - padding - inset
    const language = aliases[input.language] || input.language
    const prism = window.BikoCodePrism, grammar = prism?.languages[language]
    const tokens = grammar ? flatten(prism.tokenize(code, grammar)) : [{ text: code, type: '' }]
    const rows = [{ number: 1, pieces: [] }]
    let row = rows[0], x = startX, logicalLine = 1, column = 0
    function put(text, type) {
      const charWidth = measure(text)
      if (x + charWidth > endX && row.pieces.length) {
        row = { number: null, pieces: [] }; rows.push(row); x = startX
      }
      const last = row.pieces[row.pieces.length - 1]
      if (last && last.type === type) last.text += text
      else row.pieces.push({ x, type, text })
      x += charWidth
    }
    for (const token of tokens) {
      for (const char of token.text) {
        if (char === '\n') {
          logicalLine++; column = 0; x = startX
          row = { number: logicalLine, pieces: [] }; rows.push(row)
        } else if (char === '\t') {
          const count = 4 - column % 4
          for (let i = 0; i < count; i++) put(' ', token.type)
          column += count
        } else { put(char, token.type); column++ }
      }
    }
    const header = 52, height = padding * 2 + header + inset * 2 + rows.length * lineHeight
    if (height > 12000) throw new Error('图片过高，请减少代码行数、字号或留白')
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${escape(input.title || '代码分享图')}</title>`
    if (options.background !== 'none') {
      const colors = options.background === 'violet' ? ['#c2b5ea', '#f3cfdb'] : ['#93bfc7', '#d4dced']
      svg += `<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/>`
    }
    svg += `<rect x="${padding}" y="${padding}" width="${width - padding * 2}" height="${height - padding * 2}" rx="14" fill="${theme.card}"/>`
    ;['#ee827c', '#e9c66d', '#8dbf98'].forEach((color, index) => { svg += `<circle cx="${padding + inset + index * 17}" cy="${padding + 26}" r="4.5" fill="${color}"/>` })
    // Keep user titles inside the window header even if they are very long.
    let title = (input.title || language || '代码片段').replace(/[\r\n]/g, ' ').slice(0, 120)
    const titleWidth = width - padding * 2 - 136
    if (measure(title) > titleWidth) {
      while (title && measure(title + '…') > titleWidth) title = title.slice(0, -1)
      title += '…'
    }
    svg += `<text x="${padding + 88}" y="${padding + 31}" fill="${theme.muted}" font-family="sans-serif" font-size="12">${escape(title)}</text>`
    svg += `<g xml:space="preserve" font-family="Consolas, Liberation Mono, Menlo, monospace" font-size="${fontSize}">`
    rows.forEach((line, index) => {
      const y = padding + header + inset + fontSize + index * lineHeight
      if (options.numbers && line.number !== null) svg += `<text x="${startX - 16}" y="${y}" text-anchor="end" fill="${theme.muted}">${line.number}</text>`
      for (const piece of line.pieces) svg += `<text x="${piece.x}" y="${y}" fill="${theme[piece.type] || theme.ink}">${escape(piece.text)}</text>`
    })
    svg += '</g></svg>'
    return { svg, width, height }
  }
  function settings() {
    const value = id => dialog.querySelector('#ci-' + id).value
    return { theme: value('theme'), background: value('background'), padding: Number(value('padding')), fontSize: Number(value('font')), width: Number(value('width')), numbers: dialog.querySelector('#ci-numbers').checked, scale: Number(value('scale')) }
  }
  function content() { return { code: dialog.querySelector('#ci-code').value, title: dialog.querySelector('#ci-title').value, language: dialog.querySelector('#ci-language').value } }
  function status(message) { dialog.querySelector('#ci-status').textContent = message }
  function revokePreview() { if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null } }
  function refresh() {
    clearTimeout(timer)
    try {
      const options = settings(), result = buildSvg(content(), options)
      revokePreview(); previewUrl = URL.createObjectURL(new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' }))
      dialog.querySelector('#ci-preview').src = previewUrl
      dialog.querySelector('#ci-dimensions').textContent = `${result.width} × ${result.height} · PNG ${options.scale}×`
      status('图片在本机生成，调整不会修改原代码')
      dialog.querySelectorAll('[data-ci-export]').forEach(button => { button.disabled = false })
    } catch (error) {
      revokePreview(); dialog.querySelector('#ci-preview').removeAttribute('src')
      dialog.querySelector('#ci-dimensions').textContent = ''
      status(error.message)
      dialog.querySelectorAll('[data-ci-export]').forEach(button => { button.disabled = true })
    }
    revision++
  }
  function close() {
    opening++; revision++; clearTimeout(timer); revokePreview()
    if (dialog?.open) dialog.close()
    document.documentElement.classList.remove('is-code-image-open')
    if (opener?.isConnected) opener.focus({ preventScroll: true })
    opener = null
  }
  function ensure() {
    if (dialog) return
    dialog = document.createElement('dialog'); dialog.className = 'code-image-dialog'
    dialog.setAttribute('aria-labelledby', 'ci-heading')
    dialog.innerHTML = '<header class="ci-head"><div><h2 id="ci-heading">代码分享图</h2><p>把这一段代码，整理成一张图片</p></div><button type="button" id="ci-close" aria-label="关闭代码分享图">关闭</button></header>' +
      '<div class="ci-layout"><div class="ci-preview"><img id="ci-preview" alt="代码分享图预览"><span id="ci-dimensions"></span></div>' +
      '<div class="ci-settings"><label>图片标题<input id="ci-title" maxlength="120"></label>' +
      '<div class="ci-pair"><label>配色<select id="ci-theme"><option value="night">深色</option><option value="paper">浅色</option></select></label>' +
      '<label>背景<select id="ci-background"><option value="sea">海盐蓝</option><option value="violet">浅紫</option><option value="none">透明</option></select></label></div>' +
      '<div class="ci-pair"><label>画布宽度<select id="ci-width"><option value="640">640 px</option><option value="800" selected>800 px</option><option value="1040">1040 px</option></select></label>' +
      '<label>留白<select id="ci-padding"><option value="24">紧凑 · 24</option><option value="48" selected>适中 · 48</option><option value="64">宽松 · 64</option></select></label></div>' +
      '<div class="ci-pair"><label>字号<select id="ci-font"><option value="14">14 px</option><option value="16" selected>16 px</option><option value="20">20 px</option></select></label>' +
      '<label>PNG 清晰度<select id="ci-scale"><option value="1">1×</option><option value="2" selected>2×</option><option value="3">3×</option></select></label></div>' +
      '<label>代码语言<select id="ci-language"></select></label><label class="ci-check"><input id="ci-numbers" type="checkbox" checked>显示行号</label>' +
      '<label>代码片段<textarea id="ci-code" rows="7" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea></label></div></div>' +
      '<footer class="ci-foot"><p id="ci-status" role="status" aria-live="polite"></p><button type="button" id="ci-svg" data-ci-export>导出 SVG</button><button type="button" id="ci-copy" data-ci-export>复制图片</button><button type="button" id="ci-png" data-ci-export>下载 PNG</button></footer>'
    document.body.append(dialog)
    for (const language of LANGUAGES) {
      const option = document.createElement('option'); option.value = language
      option.textContent = language === 'text' ? '纯文本' : language === 'markup' ? 'HTML / XML' : language
      dialog.querySelector('#ci-language').append(option)
    }
    dialog.querySelector('#ci-close').onclick = close
    dialog.addEventListener('cancel', event => { event.preventDefault(); close() })
    dialog.addEventListener('close', () => { document.documentElement.classList.remove('is-code-image-open'); revokePreview() })
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close() } })
    dialog.addEventListener('input', () => { revision++; clearTimeout(timer); timer = setTimeout(refresh, 100) })
    dialog.querySelector('#ci-svg').onclick = () => exportImage('svg')
    dialog.querySelector('#ci-png').onclick = () => exportImage('png')
    dialog.querySelector('#ci-copy').onclick = () => exportImage('copy')
    dialog.querySelector('#ci-copy').hidden = !(navigator.clipboard?.write && window.ClipboardItem)
  }
  async function png(result, scale) {
    const width = result.width * scale, height = result.height * scale
    if (width > 16000 || height > 16000 || width * height > 32000000) throw new Error('图片较大，请降低 PNG 清晰度，或导出 SVG')
    const url = URL.createObjectURL(new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' }))
    try {
      const image = new Image()
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error('图片绘制失败，请尝试导出 SVG')); image.src = url })
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('此浏览器暂不支持 PNG 绘制，请导出 SVG')
      ctx.drawImage(image, 0, 0, width, height)
      return await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG 生成失败，请导出 SVG')), 'image/png'))
    } finally { URL.revokeObjectURL(url) }
  }
  async function exportImage(kind) {
    clearTimeout(timer)
    const version = revision
    const buttons = dialog.querySelectorAll('[data-ci-export]')
    buttons.forEach(button => { button.disabled = true })
    try {
      const options = settings(), current = content(), result = buildSvg(current, options)
      const blobPromise = kind === 'svg' ? Promise.resolve(new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' })) : png(result, options.scale)
      status('正在生成图片…')
      if (kind === 'copy') {
        // Pass the promise immediately to retain Safari's user activation.
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })])
        if (dialog.open && version === revision) status('图片已复制')
      } else {
        const blob = await blobPromise
        if (!dialog.open || version !== revision) return
        const url = URL.createObjectURL(blob), link = document.createElement('a')
        link.href = url; link.download = (current.title || 'code-image').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').slice(0, 80) + '.' + kind
        document.body.append(link); link.click(); link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        status('图片已生成，下载已开始')
      }
    } catch (error) { if (dialog.open) status(error.name === 'NotAllowedError' ? '浏览器未允许复制图片，请下载 PNG' : error.message) }
    finally { buttons.forEach(button => { button.disabled = false }) }
  }
  async function open(input, trigger) {
    ensure(); const request = ++opening
    opener = trigger
    const language = aliases[(input.language || '').toLowerCase()] || (input.language || '').toLowerCase()
    dialog.querySelector('#ci-language').value = LANGUAGES.includes(language) ? language : 'text'
    dialog.querySelector('#ci-title').value = input.title || '代码片段'
    dialog.querySelector('#ci-code').value = input.code || ''
    if (!dialog.open) dialog.showModal()
    document.documentElement.classList.add('is-code-image-open')
    refresh(); dialog.querySelector('#ci-close').focus()
    try { await syntax(); if (request === opening && dialog.open) refresh() }
    catch (error) { if (request === opening && dialog.open) status(error.message) }
  }
  window.BikoCodeImageEditor = { open, close, buildSvg }
})()
