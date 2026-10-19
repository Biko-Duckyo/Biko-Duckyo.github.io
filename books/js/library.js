/* ============================================================
 *  /books/ 书斋 —— 书架（文献库总览）
 *
 *  为什么单开一个模块：
 *    reader.js 已经近 3000 行，负责「读」；书架负责「找 / 管 / 比较」。
 *    两边只通过 window.BOOKS_LIBRARY 暴露的少量接口通信：
 *      library.refresh()     → 阅读器保存后回调，重算统计
 *      library.show()/hide() → 视图切换
 *      library.markCurrent() → 高亮当前在读的那本
 *
 *  书架做的事：
 *    1) 全局统计条（篇数 / 阅读时长 / 标注 / 笔记 / 在读 / 已读完 / 读过天数）
 *    2) 搜索（标题 / 作者 / DOI / 摘要 / 标签）＋ 状态快捷筛选 ＋ 年份 / 多标签
 *    3) 四种排序 ＋ 两种密度（卡片 / 表格）
 *    4) 星标、标签、阅读状态就地编辑；批量星标 / 打标签 / 导出 / 删除
 * ============================================================ */
(() => {
  'use strict'

  const store = window.BOOKS_STORE
  const exporter = window.BOOKS_EXPORT
  if (!store) return

  const $ = id => document.getElementById(id)
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  const STATUS_LABEL = { unread: '待读', reading: '在读', read: '已读完' }
  const STATUS_CYCLE = { unread: 'reading', reading: 'read', read: 'unread' }
  const VIEW_KEY = 'shelfView'

  const state = {
    docs: [],
    tags: [],
    stats: null,
    q: '',
    status: 'all',
    filterTags: [],
    year: '',
    sort: 'recent',
    view: 'grid',
    selectMode: false,
    selected: new Set(),
    currentId: null
  }

  /* ---------------- 工具 ---------------- */

  const durText = ms => {
    const min = Math.round((Number(ms) || 0) / 60000)
    if (min < 1) return '0 分钟'
    if (min < 60) return min + ' 分钟'
    const h = Math.floor(min / 60)
    return h + ' 小时' + (min % 60 ? ' ' + (min % 60) + ' 分' : '')
  }

  const agoText = ts => {
    if (!ts) return '尚未阅读'
    const diff = Date.now() - Number(ts)
    if (diff < 60000) return '刚刚阅读'
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前'
    if (diff < 86400000 * 30) return Math.floor(diff / 86400000) + ' 天前'
    return new Date(Number(ts)).toLocaleDateString('zh-CN')
  }

  const toast = (msg, type = 'ok') => {
    if (window.BOOKS_READER && typeof window.BOOKS_READER.toast === 'function') {
      window.BOOKS_READER.toast(msg, type)
      return
    }
    const box = $('bk-toast')
    if (!box) return
    box.textContent = msg
    box.dataset.kind = type
    box.classList.add('is-on')
    clearTimeout(toast._t)
    toast._t = setTimeout(() => box.classList.remove('is-on'), 3200)
  }

  const hueOf = text => {
    const s = String(text || '')
    let h = 0
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 360
    return h
  }

  const initials = doc => {
    const authors = String(doc.authors || '').split(/[,;，；]/).map(s => s.trim()).filter(Boolean)
    if (!authors.length) return ''
    if (authors.length === 1) return authors[0].slice(0, 14)
    const last = authors[0].split(/\s+/).pop()
    return last + ' 等'
  }

  const statusOf = doc => {
    if (doc.progress >= 0.995) return 'read'
    if (doc.progress > 0) return 'reading'
    return doc.status || 'unread'
  }

  /* ---------------- 读取 / 过滤 ---------------- */

  const load = async () => {
    try {
      const snap = await store.librarySnapshot()
      state.docs = snap.list
      state.tags = snap.tags
      state.stats = snap.stats
    } catch (err) {
      toast(err && err.message ? err.message : '读取文献库失败', 'error')
    }
    state.selected.forEach(id => {
      if (!state.docs.some(d => d.id === id)) state.selected.delete(id)
    })
  }

  const matchQuery = (doc, q) => {
    if (!q) return true
    const hay = [
      doc.title, doc.authors, doc.doi, doc.abstract, doc.venue, doc.source,
      (doc.tags || []).join(' '), (doc.keywords || []).join(' '), doc.year
    ].join(' ').toLowerCase()
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(word => hay.includes(word))
  }

  const matchStatus = (doc, status) => {
    if (status === 'all') return true
    if (status === 'starred') return !!doc.star
    return statusOf(doc) === status
  }

  const filtered = () => {
    const q = state.q.trim()
    const list = state.docs.filter(d =>
      matchQuery(d, q) &&
      matchStatus(d, state.status) &&
      (!state.year || String(d.year || '') === state.year) &&
      (!state.filterTags.length || state.filterTags.every(t => (d.tags || []).includes(t)))
    )
    const by = {
      recent: (a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0) || (b.updatedAt || 0) - (a.updatedAt || 0),
      created: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
      title: (a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'zh-CN'),
      progress: (a, b) => b.progress - a.progress
    }
    return list.slice().sort(by[state.sort] || by.recent)
  }


  /* ---------------- 渲染：统计条 ---------------- */

  const renderStats = () => {
    const box = $('bk-lib-stats')
    if (!box || !state.stats) return
    const s = state.stats
    const cells = [
      { k: 'docs', label: '文献', value: s.docs, icon: 'fa-book' },
      { k: 'reading', label: '在读', value: s.reading, icon: 'fa-book-open' },
      { k: 'finished', label: '已读完', value: s.finished, icon: 'fa-circle-check' },
      { k: 'msRead', label: '阅读时长', value: durText(s.msRead), icon: 'fa-clock' },
      { k: 'annotations', label: '标注', value: s.annotations, icon: 'fa-highlighter' },
      { k: 'notes', label: '笔记', value: s.notes, icon: 'fa-pen' },
      { k: 'days', label: '读过天数', value: s.readingDays, icon: 'fa-calendar-day' }
    ]
    box.innerHTML = cells.map(c => `
      <button type="button" class="bk-stat" data-kind="${c.k}" title="${esc(c.label)}">
        <i class="fas ${c.icon}"></i>
        <b>${esc(c.value)}</b>
        <span>${esc(c.label)}</span>
      </button>`).join('')
  }

  /* ---------------- 渲染：筛选栏 ---------------- */

  const renderFilters = () => {
    const box = $('bk-lib-filters')
    if (!box) return
    const s = state.stats || { docs: 0, reading: 0, finished: 0, starred: 0 }
    const items = [
      { k: 'all', label: '全部', count: s.docs },
      { k: 'reading', label: '在读', count: s.reading },
      { k: 'unread', label: '待读', count: Math.max(0, s.docs - s.reading - s.finished) },
      { k: 'read', label: '已读完', count: s.finished },
      { k: 'starred', label: '星标', count: s.starred }
    ]
    box.innerHTML = items.map(it => {
      const on = state.status === it.k ? ' is-on' : ''
      return '<button type="button" class="bk-chip' + on + '" data-status="' + it.k + '">'
        + esc(it.label) + '<em>' + it.count + '</em></button>'
    }).join('')

    const years = Array.from(new Set(state.docs.map(d => String(d.year || '')).filter(Boolean)))
      .sort((a, b) => b.localeCompare(a))
    const yearBox = $('bk-lib-year')
    if (yearBox) {
      yearBox.innerHTML = '<option value="">全部年份</option>' + years.map(y => {
        const sel = state.year === y ? ' selected' : ''
        return '<option value="' + esc(y) + '"' + sel + '>' + esc(y) + '</option>'
      }).join('')
    }

    const tagBox = $('bk-lib-tags')
    if (tagBox) {
      if (!state.tags.length) {
        tagBox.innerHTML = '<p class="bk-shelf-hint">给文献打上标签（如 综述 / 方法 / 待复现），这里会出现快捷筛选。</p>'
      } else {
        let html = state.tags.slice(0, 24).map(t => {
          const on = state.filterTags.includes(t.name) ? ' is-on' : ''
          return '<button type="button" class="bk-tag-chip' + on + '" data-tag="' + esc(t.name) + '" title="'
            + esc(t.count) + ' 篇"><i class="fas fa-tag"></i>' + esc(t.name) + '<em>' + t.count + '</em></button>'
        }).join('')
        if (state.filterTags.length) {
          html += '<button type="button" class="bk-tag-chip is-clear" id="bk-lib-clear-tags">清除标签筛选</button>'
        }
        tagBox.innerHTML = html
      }
    }
  }

  /* ---------------- 渲染：卡片 / 表格 ---------------- */

  const cardHtml = doc => {
    const pct = Math.round((doc.progress || 0) * 100)
    const hue = hueOf(doc.title || doc.id)
    const on = state.selected.has(doc.id)
    const meta = [initials(doc), doc.year, doc.venue || doc.source].filter(Boolean).join(' · ')
    const status = statusOf(doc)
    const cls = ['bk-book']
    if (on) cls.push('is-selected')
    if (state.currentId === doc.id) cls.push('is-current')
    const absTxt = doc.abstract
      ? '<p class="bk-book-abstract">' + esc(doc.abstract) + '</p>'
      : '<p class="bk-book-abstract is-empty">还没有摘要——读完在阅读器里补一段，书架检索会更快。</p>'
    const moreTags = (doc.tags || []).length > 4
      ? '<span class="bk-tag">+' + (doc.tags.length - 4) + '</span>' : ''
    const openTxt = doc.lastPage > 1 && doc.progress < 0.995 ? '继续 P' + doc.lastPage : '打开'
    const starBtn = state.selectMode
      ? '<span class="bk-book-check' + (on ? ' is-on' : '') + '"><i class="fas fa-check"></i></span>'
      : '<button type="button" class="bk-book-star' + (doc.star ? ' is-on' : '') + '" data-act="star"'
        + ' title="' + (doc.star ? '取消星标' : '加星标') + '" aria-label="星标"><i class="fas fa-star"></i></button>'
    return `
      <article class="${cls.join(' ')}" data-id="${esc(doc.id)}" tabindex="0" role="button"
               aria-label="${esc(doc.title || '未命名文献')}">
        <div class="bk-book-top" style="--hue:${hue}">
          <span class="bk-book-cover">${esc(String(doc.title || '?').slice(0, 2))}</span>
          <div class="bk-book-topact">${starBtn}</div>
          <span class="bk-book-status" data-status="${status}">${STATUS_LABEL[status] || ''}</span>
        </div>
        <h3 class="bk-book-title" title="${esc(doc.title)}">${esc(doc.title || '未命名文献')}</h3>
        <p class="bk-book-meta">${esc(meta || '—')}${doc.pageCount ? ' · ' + doc.pageCount + ' 页' : ''}</p>
        ${absTxt}
        <div class="bk-book-tags">
          ${(doc.tags || []).slice(0, 4).map(t => '<span class="bk-tag" data-tag="' + esc(t) + '">' + esc(t) + '</span>').join('')}
          ${moreTags}
          <button type="button" class="bk-tag-add" data-act="tags" title="编辑标签"><i class="fas fa-plus"></i>标签</button>
        </div>
        <div class="bk-book-progress" title="阅读进度 ${pct}%"><span style="width:${pct}%"></span></div>
        <footer class="bk-book-foot">
          <span class="bk-book-counts" title="标注数 / 笔记数 / 最近阅读">
            <i class="fas fa-highlighter"></i>${doc.annCount}
            <i class="fas fa-pen"></i>${doc.noteCount}
            <span class="bk-book-time">${esc(agoText(doc.lastReadAt))}</span>
          </span>
          <button type="button" class="bk-btn bk-btn-sm bk-btn-primary bk-book-open" data-act="open">${openTxt}</button>
        </footer>
      </article>`
  }



  const rowHtml = doc => {
    const pct = Math.round((doc.progress || 0) * 100)
    const on = state.selected.has(doc.id)
    const status = statusOf(doc)
    const starColor = doc.star ? 'var(--bk-amber)' : 'var(--bk-fg-mute)'
    return `
      <tr class="bk-row${on ? ' is-selected' : ''}" data-id="${esc(doc.id)}" tabindex="0">
        <td class="bk-row-check"><span class="bk-book-check${on ? ' is-on' : ''}"><i class="fas fa-check"></i></span></td>
        <td class="bk-row-title">
          <button type="button" class="bk-link" data-act="open">${esc(doc.title || '未命名文献')}</button>
          <span class="bk-row-sub">${esc([doc.authors, doc.venue || doc.source].filter(Boolean).join(' · '))}</span>
        </td>
        <td>${esc(doc.year || '—')}</td>
        <td><button type="button" class="bk-book-status" data-act="status" data-status="${status}">${STATUS_LABEL[status] || '—'}</button></td>
        <td><div class="bk-row-progress"><span style="width:${pct}%"></span><em>${pct}%</em></div></td>
        <td>${doc.annCount}</td>
        <td>${doc.noteCount}</td>
        <td>${esc(durText(doc.msRead))}</td>
        <td>
          <button type="button" class="bk-ic" data-act="star" title="星标">
            <i class="fas fa-star" style="color:${starColor}"></i>
          </button>
        </td>
      </tr>`
  }

  const renderList = () => {
    const box = $('bk-lib-grid')
    if (!box) return
    const list = filtered()
    const countEl = $('bk-lib-count-text')
    if (countEl) countEl.textContent = list.length + ' / ' + state.docs.length + ' 篇'

    if (!state.docs.length) {
      box.innerHTML = ''
      box.hidden = true
      return
    }
    box.hidden = false
    if (!list.length) {
      box.classList.remove('is-list')
      box.innerHTML = '<div class="bk-shelf-empty">'
        + '<i class="fas fa-filter-circle-xmark"></i>'
        + '<h4>没有符合条件的文献</h4>'
        + '<p>换个关键词，或者重置筛选条件。</p>'
        + '<button type="button" class="bk-btn bk-btn-sm" id="bk-lib-reset">重置筛选</button>'
        + '</div>'
      return
    }
    box.classList.toggle('is-list', state.view === 'list')
    if (state.view === 'list') {
      box.innerHTML = '<table class="bk-table"><thead><tr>'
        + '<th></th><th>标题 / 作者</th><th>年份</th><th>状态</th><th>进度</th>'
        + '<th>标注</th><th>笔记</th><th>时长</th><th></th>'
        + '</tr></thead><tbody>' + list.map(rowHtml).join('') + '</tbody></table>'
    } else {
      box.innerHTML = list.map(cardHtml).join('')
    }
  }

  /* ---------------- 渲染：批量操作条 ---------------- */

  const renderSelection = () => {
    const bar = $('bk-lib-bulk')
    if (!bar) return
    bar.classList.toggle('is-on', state.selectMode)
    const num = $('bk-bulk-count')
    if (num) num.textContent = state.selected.size ? '已选 ' + state.selected.size + ' 篇' : '未选文献'
    document.body.classList.toggle('is-selecting', state.selectMode)
    bar.querySelectorAll('button[data-bulk]').forEach(btn => {
      const act = btn.dataset.bulk
      if (act !== 'cancel' && act !== 'all') btn.disabled = !state.selected.size
    })
  }

  /* ---------------- 视图 / 选择 ---------------- */

  const setStatus = status => {
    state.status = status
    renderFilters()
    renderList()
  }

  const setView = view => {
    state.view = view === 'list' ? 'list' : 'grid'
    store.saveSetting(VIEW_KEY, state.view).catch(() => {})
    document.querySelectorAll('[data-shelf-view]').forEach(btn => {
      btn.classList.toggle('is-on', btn.dataset.shelfView === state.view)
    })
    renderList()
  }

  const enterSelect = on => {
    state.selectMode = !!on
    if (!on) state.selected.clear()
    renderList()
    renderSelection()
  }

  const toggleSelect = id => {
    if (state.selected.has(id)) state.selected.delete(id)
    else state.selected.add(id)
    renderList()
    renderSelection()
  }

  /* ---------------- 操作：星标 / 标签 / 状态 ---------------- */

  const toggleStar = async id => {
    const doc = state.docs.find(d => d.id === id)
    if (!doc) return
    const star = !doc.star
    await store.updateDoc(id, { star })
    await load()
    renderStats()
    renderFilters()
    renderList()
    toast(star ? '已加星标' : '已取消星标')
  }

  const editTags = async id => {
    const doc = state.docs.find(d => d.id === id)
    if (!doc) return
    const input = window.prompt('标签（用逗号分隔，例如：综述, 方法, 待复现）', (doc.tags || []).join(', '))
    if (input == null) return
    const tags = Array.from(new Set(String(input).split(/[,，;；\s]+/).map(s => s.trim()).filter(Boolean)))
    await store.updateDoc(id, { tags })
    await load()
    renderStats()
    renderFilters()
    renderList()
    toast(tags.length ? '标签已保存：' + tags.join('、') : '已清空标签')
  }

  const cycleStatusOf = async id => {
    const doc = state.docs.find(d => d.id === id)
    if (!doc) return
    const next = STATUS_CYCLE[statusOf(doc)] || 'unread'
    await store.updateDocs([id], { status: next })
    await load()
    renderStats()
    renderFilters()
    renderList()
    toast('状态：' + STATUS_LABEL[next])
  }


  /* ---------------- 操作：批量 ---------------- */

  const afterBulk = async () => {
    await load()
    renderStats()
    renderFilters()
    renderList()
    renderSelection()
  }

  const bulkPatch = async (patch, tip) => {
    const ids = Array.from(state.selected)
    if (!ids.length) return
    await store.updateDocs(ids, patch)
    await afterBulk()
    toast(tip)
  }

  const bulkTag = async () => {
    const ids = Array.from(state.selected)
    if (!ids.length) return
    const input = window.prompt('给选中的文献追加标签（逗号分隔）', '')
    if (input == null) return
    const extra = Array.from(new Set(String(input).split(/[,，;；\s]+/).map(s => s.trim()).filter(Boolean)))
    if (!extra.length) return
    for (const id of ids) {
      const doc = state.docs.find(d => d.id === id)
      if (!doc) continue
      await store.updateDoc(id, { tags: Array.from(new Set([...(doc.tags || []), ...extra])) })
    }
    await afterBulk()
    toast('已给 ' + ids.length + ' 篇添加标签：' + extra.join('、'))
  }

  const bulkDelete = async () => {
    const ids = Array.from(state.selected)
    if (!ids.length) return
    if (!window.confirm('删除选中的 ' + ids.length + ' 篇文献？PDF 副本、标注、笔记与进度会一并清除，不可恢复。')) return
    for (const id of ids) await store.removeDoc(id)
    enterSelect(false)
    await afterBulk()
    toast('已删除 ' + ids.length + ' 篇文献')
    window.BOOKS_READER.notifyLibraryChange()
  }

  const bulkExport = kind => {
    const docs = state.docs.filter(d => state.selected.has(d.id))
    if (!docs.length) return
    const stamp = new Date().toISOString().slice(0, 10)
    if (kind === 'bib') {
      exporter.download(exporter.toBibtexBundle(docs), 'library-' + stamp + '.bib', 'text/plain;charset=utf-8')
    } else if (kind === 'ris') {
      exporter.download(exporter.toRisBundle(docs), 'library-' + stamp + '.ris', 'text/plain;charset=utf-8')
    } else if (kind === 'json') {
      exporter.download(exporter.toLibraryBackup(docs), 'library-' + stamp + '.json', 'application/json')
    }
    toast('已导出 ' + docs.length + ' 篇 · ' + kind.toUpperCase())
  }

  /* ---------------- 打开 ---------------- */

  const openDoc = id => {
    if (state.selectMode) { toggleSelect(id); return }
    if (window.BOOKS_READER && typeof window.BOOKS_READER.open === 'function') {
      window.BOOKS_READER.open(id)
    } else {
      toast('阅读器还没准备好，请稍后再试', 'warn')
    }
  }



  /* ---------------- 事件（委托在 #bk-shelf 上，只绑一次） ---------------- */

  const onClick = e => {
    const root = $('bk-shelf')
    if (!root || !root.contains(e.target)) return

    const statusChip = e.target.closest('#bk-lib-filters [data-status]')
    if (statusChip) { setStatus(statusChip.dataset.status); return }

    const statCard = e.target.closest('.bk-stat')
    if (statCard) {
      const map = { reading: 'reading', finished: 'read', docs: 'all' }
      setStatus(map[statCard.dataset.kind] || 'all')
      return
    }

    const tagChip = e.target.closest('.bk-tag-chip')
    if (tagChip) {
      if (tagChip.id === 'bk-lib-clear-tags') {
        state.filterTags = []
        renderFilters()
        renderList()
        return
      }
      const name = tagChip.dataset.tag
      state.filterTags = state.filterTags.includes(name)
        ? state.filterTags.filter(t => t !== name)
        : state.filterTags.concat(name)
      renderFilters()
      renderList()
      return
    }

    const viewBtn = e.target.closest('[data-shelf-view]')
    if (viewBtn) { setView(viewBtn.dataset.shelfView); return }

    if (e.target.closest('#bk-lib-reset')) {
      state.q = ''
      state.filterTags = []
      state.year = ''
      state.status = 'all'
      const search = $('bk-lib-search')
      if (search) search.value = ''
      const yearSel = $('bk-lib-year')
      if (yearSel) yearSel.value = ''
      renderFilters()
      renderList()
      return
    }

    if (e.target.closest('#bk-lib-select')) { enterSelect(!state.selectMode); return }

    const bulkBtn = e.target.closest('[data-bulk]')
    if (bulkBtn && !bulkBtn.disabled) {
      const act = bulkBtn.dataset.bulk
      if (act === 'cancel') enterSelect(false)
      else if (act === 'all') {
        filtered().forEach(d => state.selected.add(d.id))
        renderList()
        renderSelection()
      } else if (act === 'star') bulkPatch({ star: true }, '已给选中文献加星标')
      else if (act === 'read') bulkPatch({ status: 'read' }, '已标记为已读完')
      else if (act === 'tag') bulkTag()
      else if (act === 'delete') bulkDelete()
      else if (act === 'bib') bulkExport('bib')
      else if (act === 'ris') bulkExport('ris')
      else if (act === 'json') bulkExport('json')
      return
    }

    const card = e.target.closest('.bk-book, .bk-row')
    if (!card) return
    const id = card.dataset.id
    const actBtn = e.target.closest('[data-act]')
    if (actBtn) {
      const act = actBtn.dataset.act
      if (act === 'star') toggleStar(id)
      else if (act === 'tags') editTags(id)
      else if (act === 'status') cycleStatusOf(id)
      else if (act === 'open') openDoc(id)
      return
    }
    const tagEl = e.target.closest('.bk-tag')
    if (tagEl && tagEl.dataset.tag) {
      state.filterTags = [tagEl.dataset.tag]
      renderFilters()
      renderList()
      return
    }
    openDoc(id)
  }


  const onKeydown = e => {
    const shelf = $('bk-shelf')
    if (!shelf || shelf.hidden) return
    const typing = e.target.closest('input, textarea, select')
    if (e.key === 'Escape') {
      if (state.selectMode) enterSelect(false)
      else if (typing) e.target.blur()
      return
    }
    if (typing) return
    if (e.key === '/') {
      e.preventDefault()
      const search = $('bk-lib-search')
      if (search) search.focus()
      return
    }
    if ((e.key === 'a' || e.key === 'A') && state.selectMode) {
      e.preventDefault()
      filtered().forEach(d => state.selected.add(d.id))
      renderList()
      renderSelection()
      return
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('bk-book')) {
      e.preventDefault()
      openDoc(e.target.dataset.id)
    }
  }

  const wire = () => {
    const shelf = $('bk-shelf')
    if (!shelf) return
    shelf.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeydown)

    const search = $('bk-lib-search')
    if (search) {
      search.addEventListener('input', () => { state.q = search.value; renderList() })
      search.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          search.value = ''
          state.q = ''
          renderList()
          search.blur()
        }
      })
    }
    const yearSel = $('bk-lib-year')
    if (yearSel) yearSel.addEventListener('change', e => { state.year = e.target.value; renderList() })
    const sortSel = $('bk-lib-sort')
    if (sortSel) sortSel.addEventListener('change', e => { state.sort = e.target.value; renderList() })
  }

  /* ---------------- 对外接口 ---------------- */

  const show = async () => {
    const shelf = $('bk-shelf')
    const work = $('bk-workspace')
    if (!shelf) return
    shelf.hidden = false
    if (work) work.classList.add('is-hidden')
    document.body.classList.add('is-shelf')
    await refresh()
    if (window.innerWidth > 900) {
      const search = $('bk-lib-search')
      if (search) search.focus()
    }
  }

  const hide = () => {
    const shelf = $('bk-shelf')
    const work = $('bk-workspace')
    if (shelf) shelf.hidden = true
    if (work) work.classList.remove('is-hidden')
    document.body.classList.remove('is-shelf')
    enterSelect(false)
  }

  const refresh = async () => {
    await load()
    renderStats()
    renderFilters()
    renderList()
    renderSelection()
  }

  const init = async () => {
    if (!document.body.classList.contains('bk-page-body')) return
    try {
      const saved = await store.getSetting(VIEW_KEY, 'grid')
      state.view = saved === 'list' ? 'list' : 'grid'
    } catch (_) { /* 设置读不到就用默认网格 */ }
    document.querySelectorAll('[data-shelf-view]').forEach(btn => {
      btn.classList.toggle('is-on', btn.dataset.shelfView === state.view)
    })
    wire()
    await refresh()
  }

  window.BOOKS_LIBRARY = Object.freeze({
    init,
    show,
    hide,
    refresh,
    isOpen: () => {
      const shelf = $('bk-shelf')
      return !!shelf && !shelf.hidden
    },
    /** 阅读器切换当前文献时调用：只更新「当前」高亮，不重排书架 */
    markCurrent: id => {
      state.currentId = id || null
      if (window.BOOKS_LIBRARY.isOpen()) renderList()
    },
    open: openDoc
  })
})()

