/* ============================================================
 *  /books/ 书斋 —— 笔记：Markdown 编辑器 + 预览
 *
 *  为什么不用 marked / 第三方编辑器：
 *    本页是静态站里的 standalone 页，多一个 CDN 就多一处可用性风险；
 *    阅读笔记实际只会用到标题 / 列表 / 引用 / 代码 / 强调 / 表格 / 引用块，
 *    自己写一个 120 行的渲染器足够，而且能把 [[P12]] 这类引用做成可点的。
 *
 *  对外接口（window.BOOKS_NOTES）：
 *    init()                       绑定事件（只绑一次）
 *    setDoc(doc)                  切换到某篇文献的笔记
 *    setFocus(record | null)      打开/关闭编辑器
 *    create(preset)               新建一条笔记并打开编辑器
 *    refresh()                    从 IndexedDB 重新读取
 *    render()                     只重绘列表
 *    renderMarkdown(text)         供其他模块复用（导出预览 / 长图）
 * ============================================================ */
(() => {
  'use strict'

  const store = window.BOOKS_STORE
  if (!store) return

  const $ = id => document.getElementById(id)
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  /** 笔记类型：决定徽章颜色与导出时的分节标题 */
  const TYPES = [
    { k: '', label: '随手', icon: 'fa-pen' },
    { k: 'summary', label: '摘要', icon: 'fa-align-left' },
    { k: 'method', label: '方法', icon: 'fa-flask' },
    { k: 'question', label: '疑问', icon: 'fa-circle-question' },
    { k: 'idea', label: '想法', icon: 'fa-lightbulb' },
    { k: 'quote', label: '摘录', icon: 'fa-quote-left' },
    { k: 'todo', label: '待办', icon: 'fa-list-check' }
  ]
  const TYPE_MAP = new Map(TYPES.map(t => [t.k, t]))

  const state = {
    doc: null,
    notes: [],
    filter: 'all',      // all | star | todo
    type: '',           // 按类型筛选（'' = 全部类型）
    focusId: null,
    preview: true,
    dirty: false
  }

  /* ---------------- Markdown 渲染 ---------------- */

  /**
   * 行内标记。先转义，再替换，避免用户输入变成 HTML。
   * 顺序很重要：代码 > 链接 > 粗体 > 斜体 > 页码引用。
   */
  const inline = raw => {
    let s = esc(raw)
    const codes = []
    s = s.replace(/`([^`\n]+)`/g, (_, code) => {
      codes.push(code)
      return '\u0000' + (codes.length - 1) + '\u0000'
    })
    s = s.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
      '<img src="$2" alt="$1" loading="lazy">')
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    s = s.replace(/(^|[\s(（])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>')
    // 文献内引用：[[P12]] / [[P12#annId]] → 可点击，交给 reader 跳转
    s = s.replace(/\[\[P(\d+)(?:#([\w-]+))?\]\]/g, (_, page, ann) => {
      const attr = ann ? ' data-ann="' + ann + '"' : ''
      return '<button type="button" class="bk-cite" data-page="' + page + '"' + attr +
        ' title="跳到第 ' + page + ' 页"><i class="fas fa-bookmark"></i>P' + page + '</button>'
    })
    // 单条标注引用：[[A:annId]]
    s = s.replace(/\[\[A:([\w-]+)\]\]/g, (_, id) =>
      '<button type="button" class="bk-cite" data-ann="' + id +
      '" title="跳到这条标注"><i class="fas fa-highlighter"></i>标注</button>')
    s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => '<code>' + codes[Number(i)] + '</code>')
    return s
  }

  const isTableDivider = line => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line)
  const splitRow = line => line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim())

  /**
   * 极简 Markdown → HTML（块级）。
   * 支持：# 标题、- / 1. 列表、[ ] 任务、> 引用、``` 代码、| 表格 |、--- 分隔线、段落。
   */
  const renderMarkdown = src => {
    const lines = String(src == null ? '' : src).replace(/\r\n?/g, '\n').split('\n')
    const out = []
    let i = 0
    const ul = []
    const ol = []
    const flush = (tag, buf) => {
      if (!buf.length) return
      out.push('<' + tag + '>' + buf.map(t => '<li>' + t + '</li>').join('') + '</' + tag + '>')
      buf.length = 0
    }
    const flushAll = () => { flush('ul', ul); flush('ol', ol) }

    while (i < lines.length) {
      const line = lines[i]

      // 代码块
      if (/^\s*```/.test(line)) {
        flushAll()
        const lang = line.replace(/^\s*```/, '').trim()
        const body = []
        i += 1
        while (i < lines.length && !/^\s*```/.test(lines[i])) { body.push(lines[i]); i += 1 }
        i += 1
        out.push('<pre class="bk-md-code"' + (lang ? ' data-lang="' + esc(lang) + '"' : '') +
          '><code>' + esc(body.join('\n')) + '</code></pre>')
        continue
      }

      if (!line.trim()) { flushAll(); i += 1; continue }

      // 表格：表头 + 分隔行
      if (line.includes('|') && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
        flushAll()
        const head = splitRow(line)
        i += 2
        const rows = []
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
          rows.push(splitRow(lines[i]))
          i += 1
        }
        out.push('<div class="bk-md-tablewrap"><table class="bk-md-table"><thead><tr>' +
          head.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
          rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
          '</tbody></table></div>')
        continue
      }

      // 标题：笔记里正文用 h3 起步（h1/h2 留给文档头）
      const h = /^(#{1,6})\s+(.*)$/.exec(line)
      if (h) {
        flushAll()
        const level = Math.min(6, h[1].length + 2)
        out.push('<h' + level + '>' + inline(h[2]) + '</h' + level + '>')
        i += 1
        continue
      }

      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flushAll(); out.push('<hr>'); i += 1; continue }

      // 引用
      if (/^\s*>\s?/.test(line)) {
        flushAll()
        const buf = []
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          buf.push(inline(lines[i].replace(/^\s*>\s?/, '')))
          i += 1
        }
        out.push('<blockquote>' + buf.join('<br>') + '</blockquote>')
        continue
      }

      // 任务列表
      const task = /^\s*[-*+]\s+\[( |x|X)\]\s+(.*)$/.exec(line)
      if (task) {
        flush('ol', ol)
        const done = task[1].toLowerCase() === 'x'
        ul.push('<span class="bk-md-task' + (done ? ' is-done' : '') + '">' +
          '<i class="fas ' + (done ? 'fa-square-check' : 'fa-square') + '"></i>' +
          '<span>' + inline(task[2]) + '</span></span>')
        i += 1
        continue
      }

      const bullet = /^\s*[-*+]\s+(.*)$/.exec(line)
      if (bullet) { flush('ol', ol); ul.push(inline(bullet[1])); i += 1; continue }

      const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line)
      if (ordered) { flush('ul', ul); ol.push(inline(ordered[1])); i += 1; continue }

      // 段落：连续非空行合并，遇到其他块级语法就收
      flushAll()
      const buf = [inline(line)]
      i += 1
      while (i < lines.length && lines[i].trim() &&
        !/^\s*(#{1,6}\s|>|```|[-*+]\s|\d+[.)]\s|([-*_])(\s*\2){2,}\s*$)/.test(lines[i]) &&
        !(lines[i].includes('|') && isTableDivider(lines[i + 1] || ''))) {
        buf.push(inline(lines[i]))
        i += 1
      }
      out.push('<p>' + buf.join('<br>') + '</p>')
    }
    flushAll()
    return out.join('')
  }

  /** 纯文本摘要：列表预览 / 书架卡片用 */
  const plain = (text, max = 120) => {
    const s = String(text || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[\[(?:P\d+|A:[\w-]+)(?:#[\w-]+)?\]\]/g, ' ')
      .replace(/[#>*_~`|-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return s.length > max ? s.slice(0, max) + '…' : s
  }


  /* ---------------- 读取 / 保存 ---------------- */

  const toast = (msg, type = 'ok') => {
    if (window.BOOKS_READER && typeof window.BOOKS_READER.toast === 'function') {
      window.BOOKS_READER.toast(msg, type)
    }
  }

  const typeOf = k => TYPE_MAP.get(k) || TYPES[0]

  /** 只保留与「文献笔记」相关的记录（对照结果另存，不进笔记流） */
  const isNote = n => n && n.kind !== 'translation'

  const load = async () => {
    if (!state.doc) { state.notes = []; return }
    try {
      const list = await store.listNotes(state.doc.id)
      state.notes = list.filter(isNote)
    } catch (_) {
      state.notes = []
    }
  }

  const visible = () => state.notes.filter(n => {
    if (state.type && (n.type || '') !== state.type) return false
    if (state.filter === 'todo') return n.type === 'todo' && !n.done
    if (state.filter === 'star') return !!n.star
    return true
  })

  const countByType = () => {
    const map = new Map()
    state.notes.forEach(n => map.set(n.type || '', (map.get(n.type || '') || 0) + 1))
    return map
  }



  /* ---------------- 渲染：筛选条 / 列表 ---------------- */

  const renderFilters = () => {
    const box = $('bk-note-filters')
    if (!box) return
    const counts = countByType()
    const done = state.notes.filter(n => n.type === 'todo' && !n.done).length
    const starred = state.notes.filter(n => n.star).length
    const chip = (key, label, num, on) =>
      '<button type="button" class="bk-chip' + (on ? ' is-on' : '') + '" data-note-filter="' + key + '">' +
      label + (num ? '<em>' + num + '</em>' : '') + '</button>'
    let html = chip('all', '全部', state.notes.length, state.filter === 'all') +
      chip('todo', '待办', done, state.filter === 'todo') +
      chip('star', '星标', starred, state.filter === 'star')

    const types = TYPES.filter(t => counts.get(t.k))
    if (types.length > 1) {
      html += '<span class="bk-chip-sep"></span>' +
        types.map(t => '<button type="button" class="bk-tag-chip' +
          (state.type === t.k ? ' is-on' : '') + '" data-note-type="' + t.k + '">' +
          '<i class="fas ' + t.icon + '"></i>' + t.label +
          '<em>' + counts.get(t.k) + '</em></button>').join('')
    }
    box.innerHTML = html
  }

  const noteHtml = n => {
    const t = typeOf(n.type || '')
    const body = state.preview ? renderMarkdown(n.text) : '<pre class="bk-md-raw">' + esc(n.text) + '</pre>'
    const empty = !String(n.text || '').trim()
    const meta = [n.page ? 'P' + n.page : '', n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('zh-CN') : '']
      .filter(Boolean).join(' · ')
    return `
      <article class="bk-md" data-id="${esc(n.id)}" data-type="${esc(n.type || '')}">
        <header class="bk-md-head">
          <button type="button" class="bk-md-type" data-note-act="type" title="切换类型">
            <i class="fas ${t.icon}"></i><span>${esc(t.label)}</span>
          </button>
          <h4 class="bk-md-title">${esc(n.title || '未命名笔记')}</h4>
          <span class="bk-md-time">${esc(meta)}</span>
          <button type="button" class="bk-md-star${n.star ? ' is-on' : ''}" data-note-act="star"
                  title="星标笔记" aria-label="星标笔记"><i class="fas fa-star"></i></button>
          <button type="button" class="bk-md-edit" data-note-act="edit" title="编辑（Enter）" aria-label="编辑">
            <i class="fas fa-pen"></i>
          </button>
          <button type="button" class="bk-md-del" data-note-act="del" title="删除笔记" aria-label="删除">×</button>
        </header>
        ${empty ? '<p class="bk-md-empty">空笔记——点右上角的笔开始写。</p>'
          : '<div class="bk-md-body">' + body + '</div>'}
      </article>`
  }

  const render = () => {
    const box = $('bk-note-list')
    if (!box) return
    const badge = $('bk-note-count')
    if (badge) badge.textContent = state.notes.length ? String(state.notes.length) : ''
    renderFilters()

    if (!state.doc) {
      box.innerHTML = '<p class="bk-empty">先打开一篇文献，再写笔记。</p>'
      return
    }
    if (!state.notes.length) {
      box.innerHTML = '<div class="bk-notes-empty">' +
        '<i class="fas fa-feather-pointed"></i>' +
        '<h4>还没有笔记</h4>' +
        '<p>读到哪里想到什么，就写一句。支持 Markdown，<code>Ctrl/⌘ + Enter</code> 保存，' +
        '输入 <code>[[P12]]</code> 可以直接引用第 12 页。</p>' +
        '<button type="button" class="bk-btn bk-btn-sm bk-btn-primary" data-note-act="create">' +
        '<i class="fas fa-plus"></i>写第一条</button></div>'
      return
    }
    const list = visible()
    if (!list.length) {
      box.innerHTML = '<p class="bk-empty">这个筛选下没有笔记。换个条件，或新建一条。</p>'
      return
    }
    box.innerHTML = list.map(noteHtml).join('')
  }

  /* ---------------- 编辑器 ---------------- */

  const find = id => state.notes.find(n => n.id === id) || null

  const renderPreview = () => {
    const ta = $('bk-note-edit-text')
    const box = $('bk-note-preview')
    if (!ta || !box) return
    const text = ta.value
    box.innerHTML = text.trim() ? renderMarkdown(text) : '<p class="bk-md-empty">预览会出现在这里。</p>'
    box.hidden = !state.preview
    const body = box.parentElement
    if (body) body.classList.toggle('is-split', state.preview)
    const wc = $('bk-note-words')
    if (wc) {
      const chars = text.replace(/\s/g, '').length
      wc.textContent = chars + ' 字'
    }
  }

  /** 预览开关：面板与编辑器里各有一个按钮，状态保持同步 */
  const syncPreviewBtns = () => {
    document.querySelectorAll('[data-note-preview]').forEach(btn => {
      btn.classList.toggle('is-on', state.preview)
      btn.setAttribute('aria-pressed', state.preview ? 'true' : 'false')
    })
  }

  /** 类型 chip（编辑器底部）：点一下切换这条笔记的类型 */
  const renderTypeChips = () => {
    const box = $('bk-note-types')
    if (!box || box.dataset.ready === '1') return
    box.innerHTML = TYPES.map(t =>
      '<button type="button" class="bk-md-type" data-pick-type="' + esc(t.k) + '">' +
      '<i class="fas ' + t.icon + '"></i>' + esc(t.label) + '</button>').join('')
    box.dataset.ready = '1'
  }

  const syncTypeChips = () => {
    const box = $('bk-note-types')
    if (!box) return
    const on = $('bk-note-edit-type') ? $('bk-note-edit-type').value : ''
    box.querySelectorAll('[data-pick-type]').forEach(btn => {
      btn.classList.toggle('is-on', btn.dataset.pickType === on)
    })
  }

  /** 打开编辑器；null → 关闭 */
  const setFocus = (record) => {
    const card = $('bk-note-editor')
    if (!card) return
    if (!record) {
      state.focusId = null
      card.classList.remove('is-on')
      card.setAttribute('aria-hidden', 'true')
      return
    }
    state.focusId = record.id
    const title = $('bk-note-edit-title')
    const ta = $('bk-note-edit-text')
    const type = $('bk-note-edit-type')
    if (title) title.value = record.title || ''
    if (ta) ta.value = record.text || ''
    if (type) type.value = record.type || ''
    const pageLabel = $('bk-note-edit-page')
    if (pageLabel) pageLabel.textContent = record.page ? 'P' + record.page : '—'
    card.classList.add('is-on')
    card.setAttribute('aria-hidden', 'false')
    syncTypeChips()
    renderPreview()
    if (ta) {
      ta.focus()
      // 光标放到末尾，接着上次写
      ta.setSelectionRange(ta.value.length, ta.value.length)
    }
  }

  const create = async (preset = {}) => {
    if (!state.doc) { toast('请先打开一篇文献', 'warn'); return null }
    const record = await store.saveNote({
      docId: state.doc.id,
      kind: 'note',
      type: preset.type || '',
      title: preset.title || '',
      text: preset.text || '',
      page: preset.page || 0,
      star: false
    })
    state.notes.push(record)
    state.filter = 'all'
    state.type = ''
    render()
    setFocus(record)
    return record
  }

  /** 保存编辑中的笔记；返回是否真的保存了 */
  const commit = async () => {
    const record = find(state.focusId)
    if (!record) return false
    const title = $('bk-note-edit-title')
    const ta = $('bk-note-edit-text')
    const type = $('bk-note-edit-type')
    const next = {
      ...record,
      title: title ? title.value.trim() : record.title,
      text: ta ? ta.value : record.text,
      type: type ? type.value : record.type
    }
    const changed = next.title !== record.title || next.text !== record.text || next.type !== record.type
    Object.assign(record, next)
    if (!changed) { render(); return false }
    await store.saveNote(record)
    render()
    if (window.BOOKS_READER && typeof window.BOOKS_READER.onNoteSaved === 'function') {
      window.BOOKS_READER.onNoteSaved(record)
    }
    return true
  }

  /** 在光标处插入一段文本（引用 / 标注） */
  const insertAtCaret = (snippet, { inline: isInline = false } = {}) => {
    const ta = $('bk-note-edit-text')
    if (!ta) return
    const start = ta.selectionStart == null ? ta.value.length : ta.selectionStart
    const end = ta.selectionEnd == null ? ta.value.length : ta.selectionEnd
    const before = ta.value.slice(0, start)
    const after = ta.value.slice(end)
    let text = snippet
    if (!isInline) {
      const lead = before && !/\n$/.test(before) ? '\n\n' : ''
      const tail = after && !/^\n/.test(after) ? '\n\n' : after ? '' : '\n'
      text = lead + snippet + tail
    }
    ta.value = before + text + after
    const caret = (before + text).length
    ta.focus()
    ta.setSelectionRange(caret, caret)
    renderPreview()
  }

  /* ---------------- 事件 ---------------- */

  const onClick = async e => {
    // 1) 编辑器工具条
    const typeBtn = e.target.closest('[data-pick-type]')
    if (typeBtn) {
      const sel = $('bk-note-edit-type')
      if (sel) sel.value = typeBtn.dataset.pickType
      syncTypeChips()
      const ta = $('bk-note-edit-text')
      if (ta) ta.focus()
      return
    }
    if (e.target.closest('#bk-note-save')) {
      const saved = await commit()
      setFocus(null)
      toast(saved ? '笔记已保存' : '没有改动需要保存')
      return
    }
    if (e.target.closest('#bk-note-cancel')) {
      // 放弃未保存的改动：从库里重读这一条
      const record = find(state.focusId)
      if (record && state.doc) {
        const fresh = (await store.listNotes(state.doc.id)).find(n => n.id === record.id)
        if (fresh) Object.assign(record, fresh)
      }
      render()
      setFocus(null)
      return
    }
    if (e.target.closest('[data-note-preview]')) {
      state.preview = !state.preview
      syncPreviewBtns()
      store.saveSetting('notePreview', state.preview).catch(() => {})
      renderPreview()
      return
    }
    if (e.target.closest('#bk-note-cite')) {
      insertAtCaret('[[' + 'P' + currentPage() + ']]', { inline: true })
      return
    }
    if (e.target.closest('#bk-note-wrap')) {
      const ta = $('bk-note-edit-text')
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const picked = ta.value.slice(start, end)
      const wrap = '**' + picked + '**'
      ta.value = ta.value.slice(0, start) + wrap + ta.value.slice(end)
      const caret = picked ? start + wrap.length : start + 2
      ta.focus()
      ta.setSelectionRange(caret, caret)
      renderPreview()
      return
    }
    if (e.target.closest('#bk-note-list-bullet')) { insertAtCaret('- '); return }

    // 2) 列表：筛选
    const filterBtn = e.target.closest('[data-note-filter]')
    if (filterBtn) {
      state.filter = filterBtn.dataset.noteFilter
      state.type = ''
      render()
      return
    }
    const typeChip = e.target.closest('[data-note-type]')
    if (typeChip) {
      const k = typeChip.dataset.noteType
      state.type = state.type === k ? '' : k
      state.filter = 'all'
      render()
      return
    }

    // 3) 预览里的引用标记：交给 reader 跳页
    const cite = e.target.closest('.bk-cite')
    if (cite) {
      e.preventDefault()
      if (window.BOOKS_READER && typeof window.BOOKS_READER.jump === 'function') {
        window.BOOKS_READER.jump(Number(cite.dataset.page) || 0, cite.dataset.ann || '')
      }
      return
    }

    // 4) 单条笔记上的操作
    const actBtn = e.target.closest('[data-note-act]')
    if (!actBtn) return
    const act = actBtn.dataset.noteAct
    if (act === 'create') { create(); return }

    const card = actBtn.closest('.bk-md')
    const record = card ? find(card.dataset.id) : null
    if (!record) return

    if (act === 'edit') { setFocus(record); return }
    if (act === 'star') {
      record.star = !record.star
      await store.saveNote(record)
      render()
      return
    }
    if (act === 'type') {
      // 点类型徽章 = 循环切换
      const idx = TYPES.findIndex(t => t.k === (record.type || ''))
      record.type = TYPES[(idx + 1) % TYPES.length].k
      await store.saveNote(record)
      render()
      return
    }
    if (act === 'del') {
      if (!window.confirm('删除这条笔记？')) return
      await store.removeNote(record.id)
      state.notes = state.notes.filter(n => n.id !== record.id)
      if (state.focusId === record.id) setFocus(null)
      render()
      toast('笔记已删除')
    }
  }

  /** 当前阅读页（由 reader 提供；没有就退回编辑记录自带的页） */
  const currentPage = () => {
    if (window.BOOKS_READER && typeof window.BOOKS_READER.activePage === 'function') {
      const n = window.BOOKS_READER.activePage()
      if (n) return n
    }
    const record = find(state.focusId)
    return (record && record.page) || 1
  }

  const onKeydown = async e => {
    const card = $('bk-note-editor')
    if (!card || !card.classList.contains('is-on')) return
    if (e.key === 'Escape') {
      // 编辑器的 Esc 只管编辑器：先提交再关，不让 reader 的 Esc 抢走
      e.preventDefault()
      e.stopPropagation()
      const saved = await commit()
      setFocus(null)
      toast(saved ? '笔记已保存' : '没有改动需要保存')
      return
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      const saved = await commit()
      setFocus(null)
      toast(saved ? '笔记已保存' : '没有改动需要保存')
      return
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault()
      const wrap = $('bk-note-wrap')
      if (wrap) wrap.click()
      return
    }
    // 正文里的 Tab 用缩进，而不是跳走焦点
    const ta = $('bk-note-edit-text')
    if (e.key === 'Tab' && e.target === ta) {
      e.preventDefault()
      const start = ta.selectionStart
      ta.value = ta.value.slice(0, start) + '  ' + ta.value.slice(ta.selectionEnd)
      ta.setSelectionRange(start + 2, start + 2)
      renderPreview()
    }
  }

  /** 点击页面空白处：关掉编辑（先保存） */
  const onDocMouseDown = e => {
    const card = $('bk-note-editor')
    if (!card || !card.classList.contains('is-on')) return
    if (card.contains(e.target)) return
    if (e.target.closest && e.target.closest('[data-note-act="edit"]')) return
    e.stopPropagation()
    commit().then(saved => {
      if (saved) toast('笔记已保存')
      setFocus(null)
    })
  }

  const wire = () => {
    const list = $('bk-note-list')
    if (list) list.addEventListener('click', onClick)
    const filters = $('bk-note-filters')
    if (filters) filters.addEventListener('click', onClick)
    const editor = $('bk-note-editor')
    if (editor) {
      editor.addEventListener('click', onClick)
      editor.addEventListener('input', e => {
        if (e.target && e.target.id === 'bk-note-edit-text') renderPreview()
      })
      editor.addEventListener('keydown', onKeydown)
    }
    // 面板工具栏（新建 / 预览开关）不在 #bk-note-list 里
    const pane = document.querySelector('.bk-pane[data-pane="notes"]')
    if (pane) pane.addEventListener('click', onClick)
    // 笔记面板开着、编辑器关着时，Ctrl/⌘ + Enter 直接新建
    document.addEventListener('keydown', e => {
      if (!state.doc) return
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter') return
      const pane = document.querySelector('.bk-pane[data-pane="notes"]')
      if (!pane || !pane.classList.contains('is-on')) return
      if (editor && editor.classList.contains('is-on')) return
      const tag = (e.target && e.target.tagName) || ''
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (e.target && e.target.isContentEditable)) return
      e.preventDefault()
      create()
    })
  }

  /* ---------------- 对外接口 ---------------- */

  const setDoc = async doc => {
    state.doc = doc || null
    state.filter = 'all'
    state.type = ''
    setFocus(null)
    await load()
    render()
  }

  const refresh = async () => {
    await load()
    if (state.focusId && !find(state.focusId)) setFocus(null)
    render()
  }

  const init = async () => {
    if (!document.body.classList.contains('bk-page-body')) return
    try {
      const saved = await store.getSetting('notePreview', true)
      state.preview = saved !== false
    } catch (_) { /* 读不到就用默认：开预览 */ }
    syncPreviewBtns()
    renderTypeChips()
    // 类型存在隐藏域里，值由 .bk-md-type 按钮写入
    const type = $('bk-note-edit-type')
    if (type && type.tagName === 'SELECT') {
      type.innerHTML = TYPES.map(t => '<option value="' + esc(t.k) + '">' + esc(t.label) + '</option>').join('')
    }
    wire()
    render()
  }

  window.BOOKS_NOTES = Object.freeze({
    init,
    setDoc,
    refresh,
    render,
    create,
    setFocus,
    insertAtCaret,
    renderMarkdown,
    plain,
    TYPES,
    /** 给 reader 用：当前笔记条数（不含对照） */
    count: () => state.notes.length,
    /** 当前对话的笔记快照（导出 / 摘要用） */
    list: () => state.notes.slice()
  })
})()
