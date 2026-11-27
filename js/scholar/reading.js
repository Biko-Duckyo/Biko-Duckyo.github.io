(() => {
  const form = document.getElementById('scholar-reading-access')
  const list = document.getElementById('scholar-reading-list')
  const detail = document.getElementById('scholar-reading-detail')
  const status = document.getElementById('scholar-reading-status')
  const more = document.getElementById('scholar-reading-more')
  const panel = detail.closest('#panel-reader')
  const contract = window.SCHOLAR_CONTRACT
  let token = ''
  let cursor = ''
  let busy = false
  const synced = new Map()
  const archive = window.SCHOLAR_ARCHIVE
  const add = (parent, tag, text) => {
    const element = document.createElement(tag)
    element.textContent = text
    parent.append(element)
    return element
  }
  const button = (parent, label, action) => {
    const element = add(parent, 'button', label)
    element.type = 'button'
    element.className = 'hs-btn scholar-control'
    element.addEventListener('click', action)
    return element
  }
  const icon = (element, name) => {
    const symbol = document.createElement('i')
    symbol.className = 'fas fa-' + name
    symbol.setAttribute('aria-hidden', 'true')
    element.prepend(symbol)
  }
  const request = async params => {
    const url = new URL(contract.routes.privatePapers, location.origin)
    url.search = new URLSearchParams(params)
    const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token }, redirect: 'error',
      signal: AbortSignal.timeout(30000) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || '此站点暂未启用研思同步')
    return data
  }
  const run = async task => {
    if (busy) return
    busy = true
    status.textContent = '正在读取…'
    try {
      status.textContent = await task() || ''
    } catch (error) {
      status.textContent = error.message
    } finally { busy = false }
  }
  const archiveGroups = () => {
    const groups = new Map()
    for (const item of archive.list()) {
      if (!item.verifiedDoi) continue
      if (!groups.has(item.verifiedDoi)) groups.set(item.verifiedDoi, [])
      groups.get(item.verifiedDoi).push(item)
    }
    return groups
  }
  const showArchive = item => {
    panel.dataset.paperDoi = item.verifiedDoi || ''
    const wasDetail = panel.classList.contains('has-paper-detail')
    panel.classList.remove('has-paper-detail')
    archive.open(item.id, () => {
      document.querySelector('[data-readerview="annot"]').click()
      panel.classList.toggle('has-paper-detail', wasDetail)
    })
  }
  const addArchiveVersions = (parent, versions) => {
    if (!versions?.length) return
    const versionsList = add(parent, 'details', '')
    add(versionsList, 'summary', '旧版译文（' + versions.length + '）')
    for (const item of versions) {
      button(versionsList, [item.title || '未命名译文', item.created_at].filter(Boolean).join(' · '), () => showArchive(item))
    }
  }
  const renderList = () => {
    const versions = archiveGroups()
    list.replaceChildren()
    for (const [doi, paper] of synced) {
      const row = add(list, 'article', '')
      row.dataset.doi = doi
      button(row, paper.title, () => run(() => showPaper(doi)))
      add(row, 'p', [paper.year, 'DOI ' + doi, paper.translated ? paper.translated + ' 段译文' : '仅正文',
        versions.has(doi) ? '含旧版译文' : ''].filter(Boolean).join(' · '))
    }
    for (const [doi, items] of versions) {
      if (synced.has(doi)) continue
      const row = add(list, 'article', '')
      row.dataset.doi = doi
      button(row, items[0].title || doi, () => showArchive(items[0]))
      add(row, 'p', 'DOI ' + doi + ' · 旧译文')
      if (items.length > 1) addArchiveVersions(row, items)
    }
  }
  window.addEventListener('scholar:archive-updated', renderList)

  const showPaper = async doi => {
    const { paper } = await request({ doi })
    panel.dataset.paperDoi = paper.doi
    detail.replaceChildren()
    list.hidden = more.hidden = true
    detail.hidden = false
    panel.classList.add('has-paper-detail')

    const header = add(detail, 'header', '')
    header.className = 'scholar-paper-head'
    const back = button(header, '返回同步文献', () => run(loadList))
    const title = add(header, 'h2', paper.title)
    icon(back, 'arrow-left')
    title.className = 'scholar-title'
    title.tabIndex = -1
    const desktop = add(header, 'a', '在桌面端编辑')
    desktop.className = 'hs-btn scholar-control'
    desktop.href = contract.desktopLink(paper.doi)
    icon(desktop, 'desktop')
    const chineseOnly = button(header, '只看中文', () => {
      const enabled = chineseOnly.getAttribute('aria-pressed') !== 'true'
      chineseOnly.setAttribute('aria-pressed', String(enabled))
      detail.classList.toggle('is-chinese-only', enabled)
    })
    icon(chineseOnly, 'language')
    chineseOnly.setAttribute('aria-pressed', 'false')
    chineseOnly.hidden = !paper.blocks.some(block => block.translation)
    detail.classList.remove('is-chinese-only')

    const info = add(header, 'details', '')
    info.className = 'scholar-paper-info'
    icon(add(info, 'summary', '文献信息'), 'circle-info')
    add(info, 'p', [paper.authors, paper.year, 'DOI ' + paper.doi,
      paper.translated ? paper.translated + ' 段译文' : '等待桌面端译文'].filter(Boolean).join(' · '))

    archive.load().then(() => {
      if (info.isConnected) addArchiveVersions(info, archiveGroups().get(doi))
    })

    const layout = add(detail, 'div', '')
    layout.className = 'scholar-paper-layout'
    const contents = add(layout, 'details', '')
    contents.className = 'scholar-paper-contents'
    icon(add(contents, 'summary', '页码与章节'), 'list-ul')
    const nav = add(contents, 'nav', '')
    nav.setAttribute('aria-label', '文献页码与章节')
    const pages = add(nav, 'div', '')
    pages.className = 'scholar-paper-pages'
    const sections = add(nav, 'ul', '')
    const body = add(layout, 'div', '')
    body.className = 'scholar-reading-body scholar-prose'
    const lastPage = paper.blocks.reduce((last, block) => Math.max(last, block.page), 0)
    const jump = target => {
      if (window.matchMedia('(max-width: 960px)').matches) contents.open = false
      target.focus({ preventScroll: true })
      target.scrollIntoView({ block: 'start' })
    }
    let page
    for (const block of paper.blocks) {
      if (page !== block.page) {
        page = block.page
        const label = add(body, 'h3', '')
        const counter = add(label, 'span', page + ' / ' + lastPage)
        counter.className = 'scholar-page-counter'
        label.setAttribute('aria-label', '第 ' + page + ' 页，共 ' + lastPage + ' 页')
        label.tabIndex = -1
        const pageButton = button(pages, String(page), () => jump(label))
        pageButton.setAttribute('aria-label', '跳到第 ' + page + ' 页')
      }
      const pair = add(body, 'div', '')
      if (block.translation) pair.className = 'scholar-reading-pair'
      if (block.type === 'caption') pair.classList.add('is-caption')
      const tag = block.type === 'heading' ? 'h4' : 'p'
      const source = add(pair, tag, block.text)
      source.className = 'scholar-paper-source'
      if (tag === 'h4') source.classList.add('scholar-section-title')
      if (block.translation) {
        const translation = add(pair, tag, block.translation)
        translation.className = 'scholar-paper-translation'
        if (tag === 'h4') translation.classList.add('scholar-section-title')
        translation.lang = 'zh'
      }
      if (block.type === 'heading' || block.type === 'caption') {
        pair.tabIndex = -1
        const caption = block.type === 'caption' && block.text.match(/^(?:(?:Fig(?:ure)?\.?|Table|Scheme)\s*\d+[a-z]?|[图表]\s*\d+)/i)
        const label = caption ? caption[0] : block.text
        const entry = add(sections, 'li', '')
        button(entry, label + ' · P' + page, () => jump(pair))
      }
    }
    back.focus({ preventScroll: true })
    detail.scrollIntoView({ block: 'start' })
  }
  const loadList = async (append = false) => {
    const data = await request(append ? { cursor } : {})
    if (!Array.isArray(data.papers)) throw new Error('此站点暂未启用研思同步')
    if (!append) synced.clear()
    detail.hidden = true
    delete panel.dataset.paperDoi
    panel.classList.remove('has-paper-detail')
    list.hidden = false
    cursor = data.cursor
    more.hidden = !cursor
    for (const paper of data.papers) {
      const doi = contract.normalizeDoi(paper.doi)
      if (doi) synced.set(doi, paper)
    }
    await archive.load()
    renderList()
    return !list.children.length ? '还没有同步文献。请先在桌面端书架同步。' : ''
  }
  form.addEventListener('submit', event => {
    event.preventDefault()
    run(async () => {
      token = form.elements.token.value.trim()
      detail.hidden = list.hidden = more.hidden = true
      panel.classList.remove('has-paper-detail')
      detail.replaceChildren()
      synced.clear()
      renderList()
      const doi = contract.normalizeDoi(new URLSearchParams(location.search).get('doi'))
      const message = await (doi ? showPaper(doi) : loadList())
      form.elements.token.value = ''
      return message
    })
  })
  more.addEventListener('click', () => run(() => loadList(true)))
})()
