/* ============================================================
 *  /books/ 文献阅读工作台 —— 主控制器
 *
 *  职责：
 *    1) 文献库管理（本地文件 / DOI / URL 三种打开方式）
 *    2) 左右分栏：左 PDF（PDF.js + 高亮层），右 笔记 / 对照 / 标注列表
 *    3) 划词 → 高亮 / 划线 / 批注，锚点写回 IndexedDB
 *    4) 中英对照（调 bilingual.js，复用站点模型接口）
 *    5) 导出 Markdown（Hexo 可直接用，分类「知识进阶之路」）/ 长图 / JSON
 *    6) pjax 安全：重复进入时彻底解绑，不残留监听器
 * ============================================================ */
(() => {
  'use strict'

  const {
    BOOKS_STORE: store, BOOKS_ANCHOR: anchor, BOOKS_PDF: pdfLib,
    BOOKS_BILINGUAL: bilingual, BOOKS_EXPORT: exporter
  } = window

  if (!store || !anchor || !pdfLib || !bilingual || !exporter) {
    console.warn('[books] deps missing, reader init skipped')
    return
  }

  /* ---------------- 状态 ---------------- */
  const state = {
    doc: null,            // 当前文献记录（含 blob）
    pdf: null,            // PDF.js 文档对象
    pageCount: 0,
    scale: 1,
    fit: 'width',         // width | page | custom
    activePage: 1,
    activeAnnotation: null,
    selection: null,
    annotations: [],
    notes: [],
    translation: [],
    measured: null,       // 首页在 scale=1 下的尺寸 {width,height}
    // 目录
    outline: [],
    // 虚拟化渲染
    rendered: new Set(),  // 已渲染完成的页码
    pageTasks: new Map(), // 正在渲染中的页码 → Promise
    idleTask: null,
    keepRange: 6,         // 可视页前后保留多少页位图
    // 搜索
    fullText: null,       // 整篇文本缓存
    textTask: null,
    hits: [],
    hitIndex: -1,
    // 划词菜单与翻译
    menuAnchor: null,
    focus: 0,
    abort: null,          // 翻译 AbortController
    busy: false,
    // 图区预览（超高分辨率局部放大）
    regionMode: false,    // 是否处于「框选放大」模式
    regionHot: [],        // 当前页自动识别出的图区（页面基础坐标）
    regionHotPage: 0,
    regionDrag: null,
    regionScale: 8,       // 目标放大倍率
    regionPage: 0,
    regionRect: null,
    regionCanvas: null,
    regionTask: null,     // 预览渲染的 RenderTask（关闭时取消）
    regionUrl: null,
    listeners: []         // pjax 清理用
  }


  const el = {}
  const cache = id => { el[id] = el[id] || document.getElementById(id); return el[id] }

  const on = (target, type, fn, opts) => {
    if (!target) return
    target.addEventListener(type, fn, opts)
    state.listeners.push([target, type, fn, opts])
  }

  const cleanup = () => {
    state.listeners.forEach(([t, type, fn, opts]) => t.removeEventListener(type, fn, opts))
    state.listeners = []
  }

  const qs = (scope, sel) => (scope || document).querySelector(sel)
  const qsa = (scope, sel) => Array.from((scope || document).querySelectorAll(sel))

  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")


  /* fetch + 超时（校外下载经常挂死，必须有超时） */
  const fetchWithTimeout = async (url, opts = {}, ms = 30000) => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), ms)
    try {
      return await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }))
    } finally {
      clearTimeout(timer)
    }
  }

  const DOI_RE = /10\.\d{4,9}\/[-._;()/:\uFF1C-\uFF1E\w]+/i
  const extractDoi = s => {
    const m = String(s || '').match(DOI_RE)
    return m ? m[0].replace(/[.,;)\]\u3002\uFF0C\uFF1B\uFF09]+$/, '') : ''
  }

  const isUrl = s => /^(https?:)?\/\//i.test(String(s || '').trim())
  const isPdfUrl = s => /\.pdf(\?|#|$)/i.test(String(s || ''))

  const guessTitleFromUrl = url => {
    try {
      const u = new URL(url, location.href)
      const last = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || '')
      return last.replace(/\.pdf$/i, '').replace(/[_+]+/g, ' ').trim()
    } catch (_) {
      return ''
    }
  }


  const lookupByDoi = async doi => {
    if (!doi) return null
    try {
      const res = await fetchWithTimeout('https://api.crossref.org/works/' + encodeURIComponent(doi), {}, 12000)
      if (!res.ok) return null
      const data = await res.json()
      const m = data && data.message
      if (!m) return null
      const authors = (m.author || [])
        .map(a => [a.family, a.given].filter(Boolean).join(' '))
        .filter(Boolean)
      const year = (m.issued && m.issued['date-parts'] && m.issued['date-parts'][0][0]) || ''
      return {
        title: (m.title && m.title[0]) || '',
        authors: authors.join(', '),
        year: year || '',
        container: (m['container-title'] && m['container-title'][0]) || '',
        doi
      }
    } catch (_) {
      return null
    }
  }


  const resolveInput = async raw => {
    const input = String(raw || '').trim()
    if (!input) throw new Error('\u8bf7\u5148\u586b\u5199 PDF \u94fe\u63a5\u6216 DOI\u3002\u4f8b\uff1a10.1038/nature12373\u3002')

    const doi = extractDoi(input)
    if (doi && !isUrl(input)) {
      const meta = await lookupByDoi(doi)
      return {
        kind: 'doi',
        doi,
        url: '',
        title: (meta && meta.title) || doi,
        meta: meta || {},
        source: 'DOI'
      }
    }

    if (isUrl(input)) {
      if (isPdfUrl(input)) {
        return { kind: 'pdf', url: input, doi: extractDoi(input), title: guessTitleFromUrl(input), source: '\u7f51\u5740' }
      }
      return { kind: 'page', url: input, doi: extractDoi(input), title: guessTitleFromUrl(input), source: '\u7f51\u9875' }
    }
    if (/^[\w.-]+\/\S+$/.test(input)) {
      const meta = await lookupByDoi(input)
      return { kind: 'doi', doi: input, url: '', title: (meta && meta.title) || input, meta: meta || {}, source: 'DOI' }
    }

    throw new Error('\u65e0\u6cd5\u8bc6\u522b\u7684\u8f93\u5165\uff1a\u8bf7\u7c98\u8d34 PDF \u94fe\u63a5\u6216 DOI\uff08\u5982 10.1038/nature12373\uff09\u3002')
  }


  /* 重排时取消尚未画完的页，避免旧任务画到新容器上 */
  const cancelPageRender = async pageNo => {
    const node = qs(scroller(), `.bk-page[data-page="${pageNo}"]`)
    if (!node) return
    node.dataset.rendered = 'cancel'
    const running = node.__bkTask
    if (running && running.cancel) {
      try { running.cancel() } catch (_) { /* 已结束 */ }
    }
    node.__bkTask = null
  }

  /** 把当前 RenderTask 挂到页容器上，供重排时真正 cancel */
  const attachTask = node => task => { node.__bkTask = task }


  /* ---------------- 下载 PDF（直链；失败给可操作提示） ---------------- */
  const fetchPdfBuffer = async url => {
    let res
    try {
      res = await fetchWithTimeout(url, { credentials: 'omit' }, 45000)
    } catch (err) {
      throw new Error('无法下载 PDF：' + (err && err.message) +
        '。常见原因：厂商监控限制（ScienceDirect / JSTOR），请先手动下载 PDF 后拖进来。')
    }
    if (!res.ok) {
      throw new Error(`下载 PDF 失败：HTTP ${res.status}。该地址可能需要登录或归属于厂商服务，请改用本地文件。`)
    }
    const buf = await res.arrayBuffer()
    if (!buf || buf.byteLength < 1024) throw new Error('下载内容异常，看起来并不是 PDF。')
    return buf
  }


  const scroller = () => cache('bk-scroller')


  /* 骨架尺寸同步到 CSS 变量：打印与占位都要用 */
  const syncMetrics = () => {
    const box = scroller()
    if (!box || !state.measured) return
    box.style.setProperty('--bk-page-w', state.measured.width + 'px')
    box.style.setProperty('--bk-page-h', state.measured.height + 'px')
  }


  /* ---------------- 缩放计算 ---------------- */
  const computeScale = () => {
    if (!state.measured) return state.scale
    const box = scroller()
    if (!box) return state.scale
    const avail = box.clientWidth - 32
    if (state.fit === 'width') return Math.max(0.2, avail / state.measured.width)
    if (state.fit === 'page') {
      const h = window.innerHeight - 180
      return Math.max(0.2, Math.min(avail / state.measured.width, h / state.measured.height))
    }
    return state.scale
  }


  /* ---------------- 骨架：只建占位，不画位图 ---------------- */
  const buildSkeleton = async () => {
    const box = scroller()
    if (!box) return
    box.innerHTML = ''
    box.scrollTop = 0
    const first = await state.pdf.getPage(1)
    const vp = first.getViewport({ scale: 1 })
    state.measured = { width: vp.width, height: vp.height }
    state.scale = computeScale()
    syncMetrics()

    const total = state.pageCount
    const w = Math.round(state.measured.width * state.scale)
    const h = Math.round(state.measured.height * state.scale)
    const frag = document.createDocumentFragment()
    for (let n = 1; n <= total; n += 1) {
      const page = document.createElement('div')
      page.className = 'bk-page'
      page.dataset.page = n
      page.dataset.rendered = '0'
      page.style.width = w + 'px'
      page.style.height = h + 'px'
      page.style.setProperty('--bk-page-w', w + 'px')
      page.style.setProperty('--bk-page-h', h + 'px')
      page.innerHTML = `<span class="bk-page-no">${n}</span>`
      frag.appendChild(page)
    }
    box.appendChild(frag)

    observePages()
  }


  /* 确保第 n 页已经画出来（去重 + 排队） */
  const ensurePage = pageNo => {
    const n = Math.min(Math.max(1, pageNo), state.pageCount)
    if (!state.pdf) return Promise.resolve()
    if (state.rendered.has(n)) return Promise.resolve(n)
    const running = state.pageTasks.get(n)
    if (running) return running
    const task = renderOne(n).catch(err => {
      console.warn('[books] page ' + n + ' render failed', err)
    }).finally(() => {
      state.pageTasks.delete(n)
    })
    state.pageTasks.set(n, task)
    return task
  }


  const renderOne = async n => {
    const node = qs(scroller(), `.bk-page[data-page="${n}"]`)
    if (!node || !state.pdf) return
    try {
      await pdfLib.renderPage(state.pdf, n, node, state.scale, {
        withText: true,
        onTask: attachTask(node)
      })
    } catch (err) {
      if (node.dataset.rendered === 'cancel') return
      node.innerHTML = `<div class="bk-page-error">第 ${n} 页渲染失败：${esc(err && err.message)}</div>`
      node.dataset.rendered = 'error'
      return
    } finally {
      node.__bkTask = null
    }
    if (node.dataset.rendered === 'cancel') return
    node.dataset.rendered = '1'
    state.rendered.add(n)
    paintHighlights(n)
    if (state.focus) flashMarks(n)
    return n
  }


  /* 预取：只画位图不建文本层，滚到再把文本层补上 */
  const prefetchPage = async n => {
    const node = qs(scroller(), `.bk-page[data-page="${n}"]`)
    if (!node || !state.pdf) return
    if (node.dataset.rendered !== '0') return
    node.dataset.rendered = 'pending'
    try {
      await pdfLib.renderPage(state.pdf, n, node, state.scale, {
        withText: false,
        onTask: attachTask(node)
      })
      if (node.dataset.rendered === 'pending') node.dataset.rendered = 'partial'
    } catch (err) {
      // 被重排取消过的页不要再退回 '0'，否则会和新骨架抢画同一个容器
      if (node.dataset.rendered !== 'cancel') node.dataset.rendered = '0'
    } finally {
      node.__bkTask = null
    }
  }


  /* 释放远离可视区的位图，控制内存 */
  const releaseFarPages = () => {
    const total = state.pageCount
    const keep = state.keepRange
    const active = state.activePage
    Array.from(state.rendered).forEach(n => {
      if (Math.abs(n - active) > keep) releaseOne(n)
    })
    for (let n = 1; n <= total; n += 1) {
      if (Math.abs(n - active) <= keep + 2) continue
      const node = qs(scroller(), `.bk-page[data-page="${n}"]`)
      if (node && node.dataset.rendered === 'partial') {
        pdfLib.releasePage(node)
        node.dataset.rendered = '0'
      }
    }
  }


  /* 可视区渲染调度：可视必画、前后预取、超范围释放 */
  const renderVisiblePages = () => {
    const box = scroller()
    if (!box || !state.pdf) return
    const active = state.activePage
    for (let n = active - 2; n <= active + 2; n += 1) {
      if (n < 1 || n > state.pageCount) continue
      ensurePage(n)
    }
    for (let n = active - 3; n <= active + 3; n += 1) {
      if (n < 1 || n > state.pageCount) continue
      if (state.rendered.has(n)) continue
      const node = qs(box, `.bk-page[data-page="${n}"]`)
      if (node && node.dataset.rendered === 'partial') ensurePage(n)
      else prefetchPage(n)
    }
    releaseFarPages()
    box.dataset.ready = '1'
  }

  let toastTimer = null
  const toast = (msg, type = 'ok', ms = 2600) => {
    const box = cache('bk-toast')
    if (!box) return
    box.textContent = msg
    box.className = 'bk-toast is-show' + (type ? ' is-' + type : '')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { box.className = 'bk-toast' }, ms)
  }

  const setBusy = (flag, label) => {
    state.busy = flag
    const box = cache('bk-busy')
    if (!box) return
    box.classList.toggle('is-show', !!flag)
    if (label) qs(box, '.bk-busy-text').textContent = label
  }

  /** 让某一页的高亮块闪烁一下（搜索命中 / 跳转定位用） */
  const flashMarks = pageNo => {
    const pageEl = document.getElementById(`bk-p${pageNo}`)
    if (!pageEl) return
    pageEl.querySelectorAll('.bk-hl, .bk-hit').forEach(mark => {
      mark.classList.remove('is-flash')
      // 强制回流，保证连续两次定位都能看到动画
      void mark.offsetWidth
      mark.classList.add('is-flash')
    })
  }

  /** 把某一页的标注画到它的高亮层上（锚点重新定位，缩放不丢） */
  const paintHighlights = pageNo => {
    const pageEl = document.getElementById(`bk-p${pageNo}`)
    if (!pageEl) return
    const wrap = pageEl.querySelector('.bk-canvas-wrap')
    const textLayer = wrap && wrap.querySelector('.textLayer')
    const hlLayer = wrap && wrap.querySelector('.bk-hl-layer')
    if (!textLayer || !hlLayer) return

    hlLayer.innerHTML = ''
    state.annotations
      .filter(a => Number(a.page) === Number(pageNo))
      .forEach(a => {
        const ranges = anchor.toRanges(a, textLayer)
        if (!ranges.length) {
          console.warn('[books] annotation anchor failed', a.id, String(a.quote).slice(0, 40))
          return
        }
        anchor.rectsOf(ranges, textLayer).forEach(rect => {
          const mark = document.createElement('div')
          mark.className = 'bk-hl'
          mark.dataset.id = a.id
          mark.dataset.type = a.type
          mark.style.left = rect.left + 'px'
          mark.style.top = rect.top + 'px'
          mark.style.width = rect.width + 'px'
          mark.style.height = rect.height + 'px'
          const color = a.color || '#ffd666'
          if (a.type === 'underline') {
            mark.style.borderBottom = `2px solid ${color}`
          } else if (a.type === 'strike') {
            mark.style.borderBottom = `2px solid ${color}`
            mark.style.transform = 'translateY(0.42em)'
          } else {
            mark.style.background = color
          }
          if (String(a.note || '').trim()) mark.classList.add('has-note')
          hlLayer.appendChild(mark)
        })
      })
  }

  const repaintAll = () => {
    state.rendered.forEach(n => paintHighlights(n))
  }

  /**
   * 滚动观察器：既更新页码，也驱动「按需渲染」。
 * 可视范围 ±3 页提前绘制（预渲染只画位图），离开太远就释放内存。
   */
  let pageObserver = null
  const prefetchObserver = null
  const observePages = () => {
    if (pageObserver) pageObserver.disconnect()
    const box = scroller()
    if (!box || !('IntersectionObserver' in window)) return
    pageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const n = Number(entry.target.dataset.page)
        if (!n) return
        if (entry.isIntersecting) {
          if (entry.intersectionRatio > 0.45) {
            const changed = n !== state.activePage
            state.activePage = n
            const label = cache('bk-page-label')
            if (label) label.textContent = `${n} / ${state.pageCount}`
            markActiveNote()
            renderVisiblePages()
            // 图区模式：换页要重新识别这一页的图区
            if (state.regionMode && state.regionHotPage !== n) paintHotzones()
            if (changed) { tabTick(); saveLastPage() }
          } else {
  // 兜底：PDF.js 在文本层就绪后才有文字，缩放后 old 页可能比例偏差
            const partial = document.getElementById(`bk-p${n}`)
            if (partial && partial.dataset.rendered === 'partial') ensurePage(n)
          }
        } else if (state.rendered.has(n)) {
          releaseFarPages()
        }
      })
    }, { root: box, threshold: [0, 0.45, 0.9] })
    box.querySelectorAll('.bk-page').forEach(p => pageObserver.observe(p))
    watchScrolled(box)
  }

  /** 记录滚动进度（用于续读） */
  const recordProgress = () => {
    const box = scroller()
    if (!box || !state.doc) return
    const ratio = box.scrollHeight > box.clientHeight
      ? box.scrollTop / (box.scrollHeight - box.clientHeight)
      : 0
    store.touchHistory(state.doc.id, {
      lastPage: state.activePage,
      scrollRatio: Math.min(1, Math.max(0, ratio))
    }).catch(() => {})
  }

  /** 滚动/停顿观察：记进度 + 触发画质降级 */
  let scrollWatcher = null
  const watchScrolled = box => {
    if (!('PerformanceObserver' in window)) return
    if (scrollWatcher) scrollWatcher.disconnect()
    try {
      scrollWatcher = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1]
        if (!last) return
        state.lastScrollAt = performance.now()
        releaseFarPages()
        clearTimeout(state.progressTimer)
        degradeQuality('页面高度变化')
      // 停顿超过 900ms 且布局剧烈变动 → 很可能是内存压力触发了重排
        if (last.duration > 90 && last.startTime - (state.lastScrollAt || 0) > 900) {
          degradeQuality('滚动变慢')
        }
      })
      scrollWatcher.observe({ type: 'layout-shift', buffered: false })
      } catch (_) { /* 尺寸读取失败忽略 */ }
  }

  /** 阅读时长统计：只在页面可见、且最近有滚动时才计入 */
  let session = { start: 0, ms: 0, timer: null }
  const startTimer = () => {
    if (session.timer || !state.doc) return
    session.start = Date.now()
    session.timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') {
        session.start = Date.now()
        return
      }
      const now = Date.now()
      const delta = now - session.start
      session.start = now
      // 单帧超过 2 分钟按空闲处理，不计入
      if (delta > 0 && delta < 120000) session.ms += delta
      if (session.ms >= 60000) {
        const add = session.ms
        session.ms = 0
        store.touchHistory(state.doc.id, { onMs: add, lastPage: state.activePage })
          .then(() => tabTick())
          .catch(() => {})
      }
    }, 15000)
  }
  const stopTimer = () => {
    if (!session.timer) return
    clearInterval(session.timer)
    session.timer = null
    if (session.ms > 2000 && state.doc && document.visibilityState === 'visible') {
      store.touchHistory(state.doc.id, { onMs: session.ms, lastPage: state.activePage }).catch(() => {})
    }
    session.ms = 0
  }

  /** 保存续读进度（防抖，避免滚动时频繁写库） */
  let lastPageTimer = null
  const saveLastPage = () => {
    if (!state.doc) return
    clearTimeout(lastPageTimer)
    lastPageTimer = setTimeout(() => {
      store.touchHistory(state.doc.id, { lastPage: state.activePage }).catch(() => {})
    }, 900)
  }

  /* ---------------- 划词 → 标注 ---------------- */

  /** 找出选区落在哪一页，并生成锚点 */
  const captureSelection = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null
    const range = sel.getRangeAt(0)
    const pageEl = range.startContainer.parentElement
      && range.startContainer.parentElement.closest('.bk-page')
    if (!pageEl) return null
    const textLayer = pageEl.querySelector('.textLayer')
    if (!textLayer || !textLayer.contains(range.startContainer)) return null

    const info = anchor.fromRange(range, textLayer)
    if (!info) return null

    const rect = range.getBoundingClientRect()
    return {
      page: Number(pageEl.dataset.page),
      ...info,
      // 弹出菜单的屏幕坐标
      x: rect.left + rect.width / 2,
      y: rect.top,
      bottom: rect.bottom
    }
  }

  const hideMenu = () => {
    const menu = cache('bk-menu')
    if (menu) menu.classList.remove('is-on')
    state.selectedAnchor = null
  }

  const showMenu = info => {
    const menu = cache('bk-menu')
    if (!menu) return
    state.selectedAnchor = info
    state.menuAnchor = { value: info.quote, page: info.page }
      // 菜单宽约 250，避免溢出视口
    const half = 130
    const left = Math.min(Math.max(info.x, half + 8), window.innerWidth - half - 8)
    menu.style.left = left + 'px'
    menu.style.top = Math.max(8, info.y - 52) + 'px'
    menu.classList.add('is-on')
  }

  const onSelectionChange = () => {
      // 鼠标在菜单里操作时不要抢走菜单
    const menu = cache('bk-menu')
    if (menu && menu.contains(document.activeElement)) return
    window.setTimeout(() => {
      const info = captureSelection()
      if (info) showMenu(info)
      else if (menu && !menu.matches(':hover')) hideMenu()
    }, 10)
  }

  /** 从当前选区创建一个标注 */
  const createAnnotation = async (type, color) => {
    const info = state.selectedAnchor
    if (!info || !state.doc) { toast('请先划选一段文字再标注', 'warn'); return }
    const record = await store.saveAnnotation({
      docId: state.doc.id,
      page: info.page,
      type,
      color,
      quote: info.quote,
      prefix: info.prefix,
      suffix: info.suffix,
      occurrence: info.occurrence,
      note: ''
    })
    state.annotations.push(record)
    state.annotations.sort((a, b) => a.page - b.page || a.createdAt - b.createdAt)
    paintHighlights(record.page)
    renderAnnotationList()
    hideMenu()
    window.getSelection().removeAllRanges()
    toast('已添加' + ({ highlight: '高亮', underline: '划线', strike: '删除线' }[type] || '标注'))
  }

  /** 划词后直接写批注 */
  const createAnnotationWithNote = async () => {
    const info = state.selectedAnchor
    if (!info || !state.doc) { toast('请先划选一段文字再标注', 'warn'); return }
    const note = window.prompt('给这条标注补充说明？', '')
    if (note === null) return
    const record = await store.saveAnnotation({
      docId: state.doc.id,
      page: info.page,
      type: 'highlight',
      color: '#7ee0c0',
      quote: info.quote,
      prefix: info.prefix,
      suffix: info.suffix,
      occurrence: info.occurrence,
      note: note.trim()
    })
    state.annotations.push(record)
    state.annotations.sort((a, b) => a.page - b.page || a.createdAt - b.createdAt)
    paintHighlights(record.page)
    renderAnnotationList()
    hideMenu()
    window.getSelection().removeAllRanges()
    toast('已复制选中的文字')
  }

  /** 复制选中的原文 */
  const copySelection = async () => {
    const info = state.selectedAnchor
    if (!info) return
    try {
      await navigator.clipboard.writeText(info.quote)
    toast('已复制译文')
    } catch (_) {
    toast('没有可复制的内容', 'warn')
    }
    hideMenu()
  }

  /** 把选中原文送去翻译 */
  const translateSelection = async () => {
    const info = state.selectedAnchor
    if (!info) return
    hideMenu()
    switchTab('bilingual')
    const box = cache('bk-bi-list')
    const block = document.createElement('div')
    block.className = 'bk-bi-row is-pending'
    block.innerHTML =
      `<p class="bk-bi-src">${esc(info.quote)}</p>` +
        '<p class="bk-bi-dst"><span class="bk-spin"></span> 翻译中…</p>'
    if (box) box.prepend(block)
    try {
      const cfg = await loadAiCfg()
      const [dst] = await bilingual.translate([info.quote], cfg)
      block.classList.remove('is-pending')
        block.querySelector('.bk-bi-dst').textContent = dst || '（暂无译文）'
      addTranslationPair(info.quote, dst || '', info.page)
    } catch (err) {
      block.classList.remove('is-pending')
      block.classList.add('is-error')
      block.querySelector('.bk-bi-dst').textContent = err.message
    }
  }

  /* ---------------- 侧栏：标签页 ---------------- */

  const switchTab = name => {
    state.tab = name
    document.querySelectorAll('.bk-tab').forEach(btn => {
    // 注意：变量名不叫 on，避免遮蔽上文的 on() 监听器注册函数
      const active = btn.dataset.tab === name
      btn.classList.toggle('is-on', active)
      btn.setAttribute('aria-selected', active ? 'true' : 'false')
    })
    document.querySelectorAll('.bk-pane').forEach(pane => {
      pane.classList.toggle('is-on', pane.dataset.pane === name)
    })
  }

  /* ---------------- 侧栏：标注列表 ---------------- */

  const ANNOT_LABEL = { highlight: '高亮', underline: '划线', strike: '删除线' }

  const renderAnnotationList = () => {
    const box = cache('bk-ann-list')
    if (!box) return
    const badge = cache('bk-ann-count')
    if (badge) badge.textContent = state.annotations.length ? String(state.annotations.length) : ''
    if (!state.annotations.length) {
    box.innerHTML = '<p class="bk-empty">还没有标注。在左侧选中文字，用浮动条标记后，这里会列出全部标注与批注。</p>'
      return
    }
    box.innerHTML = state.annotations.map((a, i) => `
      <article class="bk-ann" data-id="${esc(a.id)}" data-page="${a.page}">
        <header class="bk-ann-head">
          <span class="bk-ann-page">P${a.page}</span>
              <span class="bk-ann-type">${ANNOT_LABEL[a.type] || '标注'}</span>
          <span class="bk-ann-index">#${i + 1}</span>
              <button class="bk-ann-del" type="button" title="删除标注" aria-label="删除标注">✕</button>
        </header>
        <p class="bk-ann-quote">${esc(String(a.quote).slice(0, 400))}</p>
              <textarea class="bk-ann-note" rows="2" placeholder="补充说明…">${esc(a.note || '')}</textarea>
      </article>`).join('')
  }

  const markActiveNote = () => {
    document.querySelectorAll('.bk-ann').forEach(node => {
      node.classList.toggle('is-active', Number(node.dataset.page) === state.activePage)
    })
  }

  /* ---------------- 侧栏：随手笔记 ---------------- */

  const renderNotes = () => {
    const box = cache('bk-note-list')
    if (!box) return
    const list = state.notes.filter(n => n.kind !== 'summary' && n.kind !== 'translation')
    const badge = cache('bk-note-count')
    if (badge) badge.textContent = list.length ? String(list.length) : ''
    if (!list.length) {
    box.innerHTML = '<p class="bk-empty">还没有笔记。点击右侧的输入框写下理解，或对选中文字添加批注，都会在这里汇总。</p>'
      return
    }
    box.innerHTML = list.map(n => `
      <article class="bk-note" data-id="${esc(n.id)}">
        <header class="bk-note-head">
          <input class="bk-note-title" type="text" value="${esc(n.title || '')}"
              placeholder="写点想法…" aria-label="笔记内容">
            <span class="bk-note-page">${n.page ? 'P' + n.page : '—'}</span>
            <button class="bk-note-del" type="button" title="删除笔记" aria-label="删除笔记">✕</button>
        </header>
          <textarea class="bk-note-text" rows="4" placeholder="补充细节…">${esc(n.text || '')}</textarea>
      </article>`).join('')
  }

  const addNote = async (preset = {}) => {
    if (!state.doc) { toast('请先打开一篇文献', 'warn'); return }
    const record = await store.saveNote({
      docId: state.doc.id,
      kind: 'note',
      title: preset.title || '',
      text: preset.text || '',
      page: preset.page || state.activePage
    })
    state.notes.push(record)
    renderNotes()
    switchTab('notes')
    const box = cache('bk-note-list')
    const last = box && box.querySelector(`.bk-note[data-id="${record.id}"] .bk-note-text`)
    if (last) last.focus()
  }

  /* ---------------- 侧栏：中英对照 ---------------- */

  const renderBilingual = () => {
    const box = cache('bk-bi-list')
    if (!box) return
    if (!state.translation.length) {
    box.innerHTML = '<p class="bk-empty">还没有对照内容。有两种方式：' +
      '点上方按钮把整篇正文翻译成中文（已有对照会复用，只翻新增段落），' +
      '或在左侧选中一段文字后点「翻译」，做单段对照。</p>'
      return
    }
    box.innerHTML = state.translation.map((pair, i) => `
      <div class="bk-bi-row" data-bi="${i}">
        <p class="bk-bi-src">${esc(pair.src)}</p>
        <p class="bk-bi-dst">${esc(pair.dst)}</p>
      </div>`).join('')
  }

  /**
   * 追加/更新一条对照结果，并落到 notes（kind=translation）。
   * 同一段原文只保留一条，避免重复翻译越攒越多。
   */
  const addTranslationPair = async (src, dst, page) => {
    const text = String(src || '').trim()
    if (!text) return
    const index = state.translation.findIndex(p => p.src === text)
    if (index >= 0) {
      state.translation[index].dst = dst
    } else {
      state.translation.unshift({ src: text, dst })
    }
    renderBilingual()
    if (!state.doc) return
    try {
      const existing = state.notes.find(n => n.kind === 'translation' && n.src === text)
      if (existing) {
        existing.text = dst
        await store.saveNote(existing)
      } else {
        const record = await store.saveNote({
      docId: state.doc.id, kind: 'translation', title: '对照译文', text: dst, src: text, page: page || 0
        })
        state.notes.push(record)
      }
    } catch (_) { /* 单段翻译失败不阻塞正文 */ }
  }

  /** 读取模型配置（设置面板优先，缺省走 bilingual 默认值） */
  const loadAiCfg = async () => {
    const saved = await store.getSetting('ai', null)
    return { ...bilingual.DEFAULT_CFG, ...(saved || {}) }
  }

  /** 鏁寸瘒缈昏瘧 */
  const translateDocument = async () => {
    if (!state.pdf) { toast('请先打开一篇文献', 'warn'); return }
    if (state.busy) { toast('正在处理中，请稍候', 'warn'); return }
    const btn = cache('bk-bi-generate')
    try {
    setBusy(true, '提取正文…')
      const text = await pdfLib.docText(state.pdf, { withPageMark: false, maxPages: 40 })
      const paragraphs = bilingual.splitParagraphs(text)
    if (!paragraphs.length) throw new Error('这篇 PDF 提取不到可翻译的文字（可能是扫描版），请改用带文字层的文件。')

      const cfg = await loadAiCfg()
      if (!cfg.apiKey) {
        setBusy(false)
        switchTab('settings')
      toast('请先在「设置」里填写可用的 API Key', 'warn', 5000)
        return
      }

      state.abort = new AbortController()
      if (btn) btn.textContent = '翻译中…'

      // 已有对照的段落直接复用，只翻新的，省额度也省时间
      const pairs = []
      const todo = []
      paragraphs.forEach(src => {
        const cached = state.translation.find(p => p.src === src && String(p.dst || '').trim())
        if (cached) pairs.push({ src, dst: cached.dst })
        else todo.push(src)
      })
      if (!todo.length) {
        renderBilingual()
      toast('没有可翻译的新段落，界面已是最新', 'ok')
        return
      }

      const dsts = await bilingual.translate(todo, cfg, {
        signal: state.abort.signal,
          onProgress: (done, total) => setBusy(true, `翻译中… ${done}/${total} 段`)
      })

      const fresh = []
      todo.forEach((src, i) => {
        if (String(dsts[i] || '').trim()) fresh.push({ src, dst: dsts[i] })
      })
      // 只把新翻的写回内存与本地库，旧结果保持原样
      const keep = state.translation.filter(t => !paragraphs.includes(t.src))
      state.translation = fresh.concat(keep)
      renderBilingual()
      for (const pair of fresh) await addTranslationPair(pair.src, pair.dst, 0)
      toast(`完成：新增 ${fresh.length} 段对照${pairs.length ? `，复用 ${pairs.length} 段` : ''}`)
    } catch (err) {
      if (err && err.name === 'AbortError') toast('已取消翻译')
      else toast(err.message || '翻译失败', 'error', 6000)
    } finally {
      state.abort = null
      if (btn) btn.textContent = '生成中英对照'
      setBusy(false)
    }
  }

  /** 一键生成内容摘要（写进 notes 里 kind=summary） */
  const summarizeDocument = async () => {
    if (!state.pdf) { toast('请先打开一篇文献', 'warn'); return }
    const cfg = await loadAiCfg()
    if (!cfg.apiKey) {
      switchTab('settings')
    toast('请先在「设置」里填写 API Key', 'warn', 5000)
      return
    }
    try {
    setBusy(true, '提取原文…')
      const text = await pdfLib.docText(state.pdf, { withPageMark: false, maxPages: 20 })
      const clipped = text.slice(0, 24000)
    setBusy(true, '生成摘要…')

      const res = await fetchWithTimeout(bilingual.endpoint(cfg.baseURL), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.apiKey },
        body: JSON.stringify({
          model: cfg.model,
          temperature: 0.3,
          stream: false,
          messages: [
            {
              role: 'system',
      content: '你是学术文献精读助手。用简体中文输出，不要客套话。' +
        '格式：先 3-5 句话的「研究问题与结论」总述，再用 Markdown 无序列表给出关键点（每条不超过 40 字）。'
            },
        { role: 'user', content: '请总结这篇文献：\n\n' + clipped }
          ]
        }),
        redirect: 'error',
        credentials: 'omit',
        cache: 'no-store'
      }, 120000)
      if (!res.ok) throw new Error('摘要服务返回 ' + res.status)
      const data = await res.json()
      const summary = String(data.choices?.[0]?.message?.content || '').trim()
      if (!summary) throw new Error('模型没有返回内容')

      const existing = state.notes.find(n => n.kind === 'summary')
      if (existing) {
        existing.text = summary
        await store.saveNote(existing)
      } else {
        const record = await store.saveNote({
        docId: state.doc.id, kind: 'summary', title: '内容摘要', text: summary
        })
        state.notes.push(record)
      }
      switchTab('notes')
      toast('摘要已生成，可在「笔记」里修改')
    } catch (err) {
      toast(err.message || '生成摘要失败', 'error', 6000)
    } finally {
      setBusy(false)
    }
  }

  /* ---------------- 文献加载 ---------------- */

  /** 打开一篇文献：解析 → 存库 → 渲染 */
  const openDocument = async ({ buffer, meta, blob, id }) => {
    try {
    setBusy(true, '解析 PDF…')
      if (state.pdf) { try { state.pdf.destroy() } catch (_) {} state.pdf = null }
      state.rendered.clear()
      state.pageTasks.clear()
      state.regionHot = []
      state.regionHotPage = 0
      closeRegion()
      setRegionMode(false)
      const opened = await pdfLib.open(buffer instanceof ArrayBuffer ? buffer : { url: meta.url })
      state.pdf = opened.pdf
      state.pageCount = opened.pageCount
      state.outline = Array.isArray(opened.outline) ? opened.outline : []
      state.fullText = null; state.textTask = null

      const info = opened.meta || {}
      const previous = id ? await store.getDoc(id) : null
      const history = id ? await store.getHistory(id) : null
      const record = await store.saveDoc({
        id,
        title: meta.title || info.Title || guessTitleFromUrl(meta.url || '') || '未命名文献',
        doi: meta.doi || '',
        url: meta.url || '',
        authors: meta.authors || (Array.isArray(info.Author) ? info.Author.join(', ') : info.Author) || '',
        year: meta.year || (info.CreationDate ? String(info.CreationDate).slice(2, 6) : ''),
        source: meta.source || '',
        blob,
        pageCount: opened.pageCount,
        lastPage: (history && history.lastPage) || (previous && previous.lastPage) || 1
      })
      state.doc = record
      state.notes = await store.listNotes(record.id)
      state.annotations = await store.listAnnotations(record.id)
      state.translation = (await store.listNotes(record.id))
        .filter(n => n.kind === 'translation' && n.src)
        .map(n => ({ src: n.src, dst: n.text || '' }))
        .reverse()
      state.activePage = record.lastPage || 1
      state.hits = []
      state.hitIndex = -1
      state.fullText = null; state.textTask = null

      renderDocHeader()
      renderOutline()
      renderSearchResults()
      await layoutPages()
      renderAnnotationList()
      renderNotes()
      renderBilingual()
      renderLibrary()
      restorePosition(history || previous)

      cache('bk-workspace').classList.add('is-ready')
      startTimer()
      if (window.innerWidth > 1180) openOutlineOnWide()
      toast('已打开：' + record.title)
    } catch (err) {
      toast(err && err.message ? err.message : '打开失败', 'error', 7000)
    } finally {
      setBusy(false)
    }
  }

  /** 回到上次的位置：优先按滚动比例，其次按页码 */
  const restorePosition = saved => {
    const box = scroller()
    if (!box) return
    const page = (saved && saved.lastPage) || state.activePage || 1
    const ratio = saved ? Number(saved.scrollRatio) || 0 : 0
    state.activePage = page
    if (page > 1 || ratio > 0.02) {
      requestAnimationFrame(() => {
        const node = document.getElementById(`bk-p${page}`)
        if (!node) return
        box.scrollTop = Math.max(0, node.offsetTop + ratio * Math.max(0, node.offsetHeight - box.clientHeight))
        const label = cache('bk-page-label')
        if (label) label.textContent = `${page} / ${state.pageCount}`
        markActiveNote()
        renderVisiblePages()
      })
    } else {
      const label = cache('bk-page-label')
      if (label) label.textContent = `1 / ${state.pageCount}`
    }
  }

  /** 本地文件 */
  const openLocalFile = async file => {
    if (!file) return
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) {
      toast('目前只支持 PDF 文件', 'warn')
      return
    }
    const buffer = await file.arrayBuffer()
    await openDocument({
      buffer,
      blob: new Blob([buffer], { type: 'application/pdf' }),
      meta: { title: file.name.replace(/\.pdf$/i, ''), url: '', doi: '', source: '本地文件' }
    })
  }

  /** DOI / URL */
  const openFromInput = async raw => {
    try {
      setBusy(true, '解析地址…')
      const resolved = await resolveInput(raw)
      if (resolved.kind === 'page') {
        setBusy(false)
      toast('该地址不是 PDF 直链，已在新标签页打开原页面', 'warn', 5000)
        window.open(resolved.url, '_blank', 'noopener')
        return
      }
        setBusy(true, '下载 PDF…')
      const buffer = await fetchPdfBuffer(resolved.url)
      setBusy(false)
      await openDocument({
        buffer,
        blob: new Blob([buffer], { type: 'application/pdf' }),
        meta: {
          title: resolved.title,
          doi: resolved.doi,
          url: resolved.url,
          authors: resolved.authors,
          year: resolved.year,
        source: resolved.source || '在线'
        }
      })
    } catch (err) {
      setBusy(false)
      toast(err.message || '打开失败', 'error', 7000)
    }
  }

  /** 从库里重新打开 */
  const openFromLibrary = async id => {
    const doc = await store.getDoc(id)
    if (!doc) { toast('文献已不存在', 'warn'); return }
    const file = await store.getDocBlob(id)
    if (file) {
      await openDocument({ buffer: await file.arrayBuffer(), blob: file, meta: doc, id: doc.id })
    } else if (doc.url) {
      await openFromInput(doc.url)
    } else {
      toast('该记录没有可用的文件，请重新导入', 'warn')
    }
  }

  /** 打开文献库抽屉（顺带刷新列表） */
  const openLibrary = async () => {
    const box = cache('bk-library')
    if (!box) return
    await renderLibrary()
    box.classList.add('is-on')
    box.setAttribute('aria-hidden', 'false')
  }

  const closeLibrary = () => {
    const box = cache('bk-library')
    if (!box) return
    box.classList.remove('is-on')
    box.setAttribute('aria-hidden', 'true')
  }

  /* ---------------- 文档头 / 文献库 渲染 ---------------- */

  const renderDocHeader = () => {
    const box = cache('bk-dochead')
    if (!box) return
    const d = state.doc
    if (!d) {
    box.innerHTML = '<h1 class="bk-doc-title">未打开文献</h1>' +
      '<p class="bk-doc-meta">打开一篇 PDF 后，这里会显示文献信息。</p>'
      return
    }
    const bits = []
    if (d.authors) bits.push(esc(d.authors))
    if (d.year) bits.push(esc(d.year))
    if (d.source) bits.push(esc(d.source))
      bits.push(`${state.pageCount} 页`)
    box.innerHTML =
      `<h1 class="bk-doc-title" title="${esc(d.title)}">${esc(d.title)}</h1>` +
      `<p class="bk-doc-meta">${bits.join(' · ')}</p>` +
      (d.doi
        ? `<p class="bk-doc-doi">DOI: <a href="https://doi.org/${esc(d.doi)}" ` +
          `target="_blank" rel="noopener">${esc(d.doi)}</a></p>`
        : '')
  }

  const agoText = ts => {
    if (!ts) return ''
    const diff = Date.now() - Number(ts)
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前'
    if (diff < 86400000 * 30) return Math.floor(diff / 86400000) + ' 天前'
    return new Date(Number(ts)).toLocaleDateString('zh-CN')
  }

  const durText = ms => {
    const min = Math.round((Number(ms) || 0) / 60000)
    if (min < 1) return ''
    if (min < 60) return min + ' 分钟'
    const h = Math.floor(min / 60)
    return h + ' 小时' + (min % 60 ? ` ${min % 60} 分` : '')
  }

  const renderLibrary = async () => {
    const docs = await store.listDocs()
    const badge = cache('bk-lib-count')
    if (badge) badge.textContent = docs.length ? String(docs.length) : ''
    const box = cache('bk-lib-list')
    if (!box) return
    if (!docs.length) {
    box.innerHTML = '<p class="bk-empty">文献库还是空的。打开过的文献会自动存到这里' +
      '（含 PDF 副本），下次点一下继续读。</p>'
      return
    }
    box.innerHTML = docs.map(d => {
      const pct = d.pageCount && d.lastPage
        ? Math.min(100, Math.round((Number(d.lastPage) / Number(d.pageCount)) * 100))
        : 0
        const bits = [d.authors, d.year].filter(Boolean).join(' · ') || '—'
      const dur = durText(d.msRead)
      return `
      <article class="bk-lib-item${state.doc && state.doc.id === d.id ? ' is-active' : ''}" data-id="${esc(d.id)}">
            <h4 class="bk-lib-title">${esc(d.title || '未命名文献')}</h4>
        <p class="bk-lib-meta">
          ${esc(bits)}
            <span class="bk-lib-pages">${d.pageCount ? d.pageCount + ' 页' : ''}</span>
        </p>
        <p class="bk-lib-time">
          ${d.lastReadAt ? '上次阅读 ' + esc(agoText(d.lastReadAt)) : (d.updatedAt ? esc(new Date(d.updatedAt).toLocaleString('zh-CN')) : '')}
          ${dur ? ' · 累计 ' + esc(dur) : ''}
        </p>
        ${pct ? `<div class="bk-lib-progress"><span style="width:${pct}%"></span></div>` : ''}
        <div class="bk-lib-actions">
          <button class="bk-btn bk-btn-sm bk-lib-open" type="button">
            ${d.lastPage && d.lastPage > 1 ? `继续（P${d.lastPage}）` : '继续阅读'}
          </button>
            <button class="bk-btn bk-btn-sm bk-btn-ghost bk-lib-del" type="button" title="删除">删除</button>
        </div>
      </article>`
    }).join('')
  }

  /** 空态：放最近读过的文献，省得先翻文献库 */
  const renderRecent = async () => {
    const box = cache('bk-recent')
    if (!box) return
    const docs = (await store.listDocs()).slice(0, 3)
    if (!docs.length) {
    box.innerHTML = '<p class="bk-empty">还没有历史记录。打开一篇 PDF 后，这里会出现' +
      '「继续阅读」入口，并显示阅读进度与累计时长。</p>'
      return
    }
    const { msRead } = await store.stats()
    const total = durText(msRead)
    box.innerHTML =
      `<p class="bk-hint">最近在读 ${docs.length} 篇${total ? ' · 累计阅读 ' + esc(total) : ''}</p>` +
      docs.map(d => `
      <article class="bk-lib-item bk-recent-item" data-id="${esc(d.id)}">
            <h4 class="bk-lib-title">${esc(d.title || '未命名文献')}</h4>
        <p class="bk-lib-time">
            ${esc([d.authors, d.pageCount ? d.pageCount + ' 页' : ''].filter(Boolean).join(' · ') || '—')}
            ${d.lastReadAt ? ' · ' + esc(agoText(d.lastReadAt)) : ''}
        </p>
        <div class="bk-lib-actions">
          <button class="bk-btn bk-btn-sm bk-btn-primary bk-recent-open" type="button">
            ${d.lastPage && d.lastPage > 1 ? `继续阅读（P${d.lastPage}）` : '打开阅读'}
          </button>
        </div>
      </article>`).join('')
  }

  /* ---------------- 瀵煎嚭 ---------------- */

  const exportMarkdown = () => {
    if (!state.doc) { toast('请先打开一篇文献', 'warn'); return }
    const { content, filename } = exporter.toMarkdown(state.doc, state.annotations, state.notes, {
      withTranslation: state.translation.length > 0,
      translation: state.translation
    })
    exporter.download(content, filename)
      toast('已导出 Markdown，放进 source/_posts/ 即可发布')
  }

  const exportImage = async () => {
    if (!state.doc) { toast('请先打开一篇文献', 'warn'); return }
    try {
    setBusy(true, '生成长图…')
      const blob = await exporter.toLongImage(state.doc, state.annotations, state.notes)
      exporter.download(blob, exporter.safeName(state.doc.title) + '-阅读笔记.png', 'image/png')
      toast('长图已导出')
    } catch (err) {
      toast(err.message || '长图导出失败', 'error', 5000)
    } finally {
      setBusy(false)
    }
  }

  const exportJson = () => {
    if (!state.doc) { toast('请先打开一篇文献', 'warn'); return }
    const content = exporter.toBackup(state.doc, state.annotations, state.notes)
    exporter.download(content, exporter.safeName(state.doc.title) + '.json', 'application/json')
      toast('JSON 已导出')
  }

  /* ---------------- 设置 ---------------- */

  const fillSettings = async () => {
    const cfg = await loadAiCfg()
    const color = await store.getSetting('annotColor', '#ffd666')
    const mail = await store.getSetting('unpaywallEmail', '')
    const regionScale = await store.getSetting('regionScale', 8)
    state.regionScale = regionScale
    const set = (id, v) => { const n = cache(id); if (n) n.value = v }
    set('bk-cfg-base', cfg.baseURL || '')
    set('bk-cfg-model', cfg.model || '')
    set('bk-cfg-key', cfg.apiKey || '')
    set('bk-cfg-mail', mail || '')
    set('bk-cfg-color', color)
    set('bk-cfg-region', String(regionScale))
  }

  const saveSettings = async () => {
    const base = cache('bk-cfg-base').value.trim()
    const model = cache('bk-cfg-model').value.trim()
    const apiKey = cache('bk-cfg-key').value.trim()
    let normalized = ''
    try {
      normalized = bilingual.endpoint(base) // 顺手校验地址格式
    } catch (err) {
      toast(err.message, 'error', 5000)
      return
    }
    await store.saveSetting('ai', {
      baseURL: base,
      model: model || bilingual.DEFAULT_CFG.model,
      apiKey
    })
    await store.saveSetting('unpaywallEmail', cache('bk-cfg-mail').value.trim())
    await store.saveSetting('annotColor', cache('bk-cfg-color').value)
    const rs = Number(cache('bk-cfg-region').value) || 8
    state.regionScale = rs
    await store.saveSetting('regionScale', rs)
    toast('设置已保存（接口：' + new URL(normalized).host + '）')
  }

  const wipeAll = async () => {
    if (!window.confirm('这会清空本机保存的全部文献、标注、笔记与设置，且不可恢复。确定吗？')) return
    await store.clearAll()
    if (state.pdf) { try { state.pdf.destroy() } catch (_) {} state.pdf = null }
    if (pageObserver) { pageObserver.disconnect(); pageObserver = null }
    if (scrollWatcher) { scrollWatcher.disconnect(); scrollWatcher = null }
    stopTimer()
    state.doc = null
    state.annotations = []
    state.notes = []
    state.translation = []
    state.outline = []
    state.fullText = null; state.textTask = null
    state.hits = []
    state.hitIndex = -1
    state.pageCount = 0
    state.rendered.clear()
    state.pageTasks.clear()
    state.regionHot = []
    state.regionHotPage = 0
    closeRegion()
    setRegionMode(false)
    cache('bk-scroller').innerHTML = ''
    renderDocHeader()
    renderAnnotationList()
    renderNotes()
    renderBilingual()
    renderOutline()
    renderSearchResults()
    await renderLibrary()
    await renderRecent()
    fillSettings()
      toast('本地数据已清空')
  }

  /* ---------------- 页码 / 缩放 / 续读 ---------------- */

  /** 重新排布局：重建骨架 → 立刻渲染首屏 → 回到原页 */
  const layoutPages = async () => {
    state.rendered.clear()
    state.pageTasks.clear()
    state.idleTask = null
    await buildSkeleton()
    await renderVisiblePages()
  }

  const scrollToPage = n => {
    const target = Math.min(Math.max(1, n), state.pageCount || 1)
    state.activePage = target
    const node = document.getElementById(`bk-p${target}`)
    const box = scroller()
    if (node && box) {
    // 用滚动容器的相对位置滚动：比 scrollIntoView 更可控（不会连带动外层）
      box.scrollTo({ top: node.offsetTop - 12, behavior: 'smooth' })
    }
    const label = cache('bk-page-label')
    if (label) label.textContent = `${target} / ${state.pageCount}`
    markActiveNote()
    ensurePage(target)
    prefetchPage(target + 1)
    prefetchPage(target - 1)
    releaseFarPages()
    saveLastPage()
    recordProgress()
  }

  /** 上下翻页：优先用可视区内相邻页的高度，最后才回退到测量值，避免长文跳跃 */
  const nudge = dir => {
    const box = scroller()
    if (!box) return
    const next = state.activePage + dir
    if (next < 1) { toast('已经是第一页了'); return }
    if (next > state.pageCount) { toast('已经是最后一页了'); return }
    const cur = document.getElementById(`bk-p${state.activePage}`)
    const nxt = document.getElementById(`bk-p${next}`)
    const measuredH = state.measured ? state.measured.height + 22 : 0
    const delta = cur && nxt && cur.offsetHeight
      ? nxt.offsetTop - cur.offsetTop
      : (dir > 0 ? measuredH : -(nxt && nxt.offsetHeight ? nxt.offsetHeight + 22 : measuredH))
    box.scrollBy({ top: delta, behavior: 'smooth' })
    state.activePage = next
    ensurePage(next)
    prefetchPage(next + dir)
    const label = cache('bk-page-label')
    if (label) label.textContent = `${next} / ${state.pageCount}`
    markActiveNote()
    saveLastPage()
  }

  /** 内存不足时降级：缩小保留范围并重画可视页 */
  const degradeQuality = reason => {
    if (state.keepRange <= 2) return
    state.keepRange = Math.max(2, state.keepRange - 2)
    Array.from(state.rendered).forEach(n => releaseOne(n))
    renderVisiblePages()
      toast('为控制内存占用，已降低画质' + (reason ? '（' + reason + '）' : ''), 'warn', 4200)
  }

  const releaseOne = n => {
    const container = document.getElementById(`bk-p${n}`)
    if (container) {
      if (container.__bkTask && container.__bkTask.cancel) {
        try { container.__bkTask.cancel() } catch (_) {}
        container.__bkTask = null
      }
      pdfLib.releasePage(container)
      container.dataset.rendered = '0'
    }
    state.rendered.delete(n)
  }

  const zoomBy = delta => {
    state.fit = 'custom'
    state.fitMode = 'custom'
    state.scale = Math.min(4, Math.max(0.25, state.scale + delta))
    rerenderPages()
  }
  const setFit = mode => {
    state.fit = mode
    state.fitMode = mode
    rerenderPages()
  }

  let rerenderTimer = null
  const rerenderPages = () => {
    if (!state.pdf) return
    clearTimeout(rerenderTimer)
    rerenderTimer = setTimeout(async () => {
      try {
      setBusy(true, '重排页面…')
        const keepPage = state.activePage
    // 重建骨架前先真正取消旧任务：否则 PDF.js 还在后台画旧尺寸的位图，
    // 既浪费 CPU，画完又往已经重建的 DOM 上贴，快速缩放时会闪旧比例。
        state.pageTasks.forEach(promise => promise.catch(() => {}))
        state.pageTasks.forEach((_, n) => {
          const old = document.getElementById(`bk-p${n}`)
          if (!old) return
          old.dataset.rendered = 'cancel'
          if (old.__bkTask && old.__bkTask.cancel) {
            try { old.__bkTask.cancel() } catch (_) { /* 已结束 */ }
          }
          old.__bkTask = null
        })
        await layoutPages()
        requestAnimationFrame(() => scrollToPage(keepPage))
      } catch (err) {
      toast(err && err.message ? err.message : '重排失败', 'error')
      } finally {
        setBusy(false)
      }
    }, 150)
  }

  /* ---------------- 目录 ---------------- */

  /** 把 PDF.js 的 outline 拍平成带层级的数组 */
  const flattenOutline = () => {
    const out = []
    let seq = 0
    const walk = (nodes, depth) => {
      (nodes || []).forEach(node => {
        out.push({
          id: `ol_${seq++}`,
        title: String(node.title || '').trim() || '未命名章节',
          depth,
          dest: node.dest
        })
        if (node.items && node.items.length) walk(node.items, depth + 1)
      })
    }
    walk(state.outline, 0)
    return out
  }

  /** 章节 → 页码（解析一次后缓存，避免重复解析） */
  const resolveDest = async node => {
    if (node.page) return node.page
    try {
      let dest = node.dest
      if (typeof dest === 'string') dest = await state.pdf.getDestination(dest)
      if (Array.isArray(dest) && dest.length) {
        const index = await state.pdf.getPageIndex(dest[0])
        node.page = Math.max(1, index + 1)
      }
    } catch (_) { /* 目录解析失败不影响阅读 */ }
    return node.page || 0
  }

  const outlineIcon = depth => (depth >= 2 ? 'fa-angle-right' : 'fa-bookmark')

  const renderOutline = async () => {
    const box = cache('bk-outline-list')
    if (!box) return
    if (!state.outline || !state.outline.length) {
    box.innerHTML = '<p class="bk-empty">这份 PDF 没有内置书签目录。可以用顶栏的页码框直接跳页，' +
      '或者在「搜索」里按关键词定位。</p>'
      return
    }
    const flat = flattenOutline()
    box.innerHTML = flat.map(node => `
      <button class="bk-ol-item" type="button" data-oid="${node.id}"
              style="--d:${node.depth}" title="${esc(node.title)}">
        <i class="fas ${outlineIcon(node.depth)}"></i>
        <span class="bk-ol-title">${esc(node.title)}</span>
        <em class="bk-ol-page"></em>
      </button>`).join('')

      // 逐个解析页码，解析完直接补上，不阻塞渲染
    for (const node of flat) {
      const page = await resolveDest(node)
      if (!page) continue
      const label = box.querySelector(`.bk-ol-item[data-oid="${node.id}"] .bk-ol-page`)
      if (label) label.textContent = 'P' + page
    }
  }

  const openOutlineOnWide = () => {
    const panel = cache('bk-panel-outline')
    if (!panel || panel.dataset.auto) return
    panel.dataset.auto = '1'
    panel.classList.add('is-on')
    panel.setAttribute('aria-pressed', 'true')
    renderOutline()
  }

  const wireOutline = () => {
    const box = cache('bk-outline-list')
    on(box, 'click', async e => {
      const btn = e.target.closest('.bk-ol-item')
      if (!btn) return
      document.querySelectorAll('.bk-ol-item').forEach(node => node.classList.remove('is-on'))
      btn.classList.add('is-on')
      const node = flattenOutline().find(n => n.id === btn.dataset.oid)
      const page = node ? await resolveDest(node) : 0
      if (!page) { toast('这个目录项没有对应的页', 'warn'); return }
      // 目录是浮层，点完自动收起，避免挡住正文
      cache('bk-panel-outline').classList.remove('is-on')
      cache('bk-panel-outline').setAttribute('aria-pressed', 'false')
      scrollToPage(page)
      toast(`已跳到「${node.title}」第 ${page} 页`)
    })
  }

  /* ---------------- 鍏ㄦ枃鎼滅储 ---------------- */

  /** 取整篇文本并在内存里缓存，连续搜索不再重复向 worker 要文本 */
  const docTextCache = async () => {
    if (state.fullText != null) return state.fullText
    if (!state.pdf) return ''
    if (!state.textTask) {
      state.textTask = (async () => {
    // 超长文献只索引前 150 页，避免一次性把几十 MB 文本读进内存
        const text = await pdfLib.docText(state.pdf, { withPageMark: true, maxPages: 150 })
        state.fullText = text
        return text
      })().catch(() => '')
    }
    return state.textTask
  }

  const SNIPPET_CTX = 46

  const search = async query => {
    const kw = String(query || '').trim()
    if (!kw) { state.hits = []; state.hitIndex = -1; renderSearchResults(); return [] }
    if (!state.pdf) return []
      setBusy(true, '检索全文…')
    try {
      const text = await docTextCache()
      const lowerText = text.toLowerCase()
      const lowerKw = kw.toLowerCase()
      const found = []
      let at = lowerText.indexOf(lowerKw)
      while (at >= 0 && found.length < 400) {
      // 定位页码：往回找最近的 [Pn] 标记
        const before = text.slice(0, at)
        const mark = /\[P(\d+)\]/g
        let page = 1
        let m
        while ((m = mark.exec(before))) page = Number(m[1])
        found.push({
          page,
          snippet: text.slice(Math.max(0, at - SNIPPET_CTX), at + kw.length + SNIPPET_CTX)
            .replace(/\s+/g, ' ').trim()
        })
        at = lowerText.indexOf(lowerKw, at + Math.max(1, kw.length))
      }
      state.hits = found
      state.hitIndex = found.length ? 0 : -1
      renderSearchResults()
      if (found.length) goHit(0)
      return found
    } catch (err) {
        toast(err && err.message ? err.message : '搜索失败', 'error')
      return []
    } finally {
      setBusy(false)
    }
  }

  const renderSearchResults = () => {
    const box = cache('bk-search-results')
    if (!box) return
    if (!state.hits.length) {
    box.innerHTML = '<p class="bk-empty">输入关键词后回车，会在整篇文本里找出所有命中并跳到对应页，' +
      '打开命中列表后用 ↑ / ↓ 上下走，Esc 关闭。</p>'
      return
    }
    box.innerHTML =
      `<p class="bk-hint">共 ${state.hits.length} 处命中${state.hits.length >= 400 ? '（已截断）' : ''}</p>` +
      state.hits.map((hit, i) => `
        <button class="bk-hit${i === state.hitIndex ? ' is-on' : ''}" type="button" data-hi="${i}">
          <span class="bk-hit-page">P${hit.page}</span>
            <span class="bk-hit-text">…${esc(hit.snippet)}…</span>
        </button>`).join('')
  }

  /** 跳到第 i 个命中 */
  const goHit = i => {
    if (!state.hits.length) return
    const total = state.hits.length
    state.hitIndex = ((i % total) + total) % total
    renderSearchResults()
    const panel = cache('bk-panel-search')
    if (panel && !panel.classList.contains('is-on')) {
      panel.classList.add('is-on')
      panel.setAttribute('aria-pressed', 'true')
    }
    const hit = state.hits[state.hitIndex]
    scrollToPage(hit.page)
    if (state.rendered.has(hit.page)) flashMarks(hit.page)
  }

  let searchTimer = null
  const wireSearch = () => {
    const input = cache('bk-search-input')
    on(input, 'input', () => {
      clearTimeout(searchTimer)
      const value = input.value
      if (!String(value).trim()) {
        state.hits = []
        state.hitIndex = -1
        renderSearchResults()
        return
      }
      searchTimer = setTimeout(() => { search(value) }, 320)
    })
    on(input, 'keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault()
        clearTimeout(searchTimer)
        if (e.shiftKey) goHit(state.hitIndex - 1)
        else search(input.value)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        input.blur()
        cache('bk-panel-search').classList.remove('is-on')
      }
    })
    on(cache('bk-search-prev'), 'click', () => goHit(state.hitIndex - 1))
    on(cache('bk-search-next'), 'click', () => goHit(state.hitIndex + 1))
    on(cache('bk-search-results'), 'click', e => {
      const btn = e.target.closest('.bk-hit')
      if (!btn) return
      goHit(Number(btn.dataset.hi))
    })
  }

  /* ---------------- 閿洏蹇嵎閿?---------------- */

  const isTyping = target => {
    const tag = (target && target.tagName) || ''
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return true
    return !!(target && target.isContentEditable)
  }

  const zoomReset = () => {
    state.fit = 'width'
    state.fitMode = 'width'
    rerenderPages()
  }

  /** 让 j/k 按屏幕一屏地滚，而不是整页硬跳 */
  const screenScroll = dir => {
    const box = scroller()
    if (!box) return
    box.scrollBy({ top: dir * Math.round(box.clientHeight * 0.86), behavior: 'smooth' })
  }

  const closePanels = () => {
    hideMenu()
    cache('bk-library').classList.remove('is-on')
    cache('bk-helpbox').classList.remove('is-on')
    cache('bk-panel-outline').classList.remove('is-on')
    cache('bk-panel-search').classList.remove('is-on')
    cache('bk-toolbar-more').classList.remove('is-on')
  }

  const wireKeys = () => {
    on(document, 'keydown', e => {
      if (e.defaultPrevented) return
      const meta = e.ctrlKey || e.metaKey

      if (meta && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault()
        const panel = cache('bk-panel-search')
        panel.classList.add('is-on')
        panel.setAttribute('aria-pressed', 'true')
        const input = cache('bk-search-input')
        if (input) { input.focus(); input.select() }
        return
      }
      if (meta && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault()
        openLibrary()
        return
      }
      if (e.key === 'Escape') {
        // 预览浮层优先关（它是模式化的最上层）
        const region = cache('bk-region')
        if (region && region.classList.contains('is-on')) { closeRegion(); return }
        if (state.regionMode) { setRegionMode(false); return }
        closePanels()
        return
      }
    // 正在写笔记 / 批注 / 输入地址时不抢按键
      if (isTyping(e.target) || !state.pdf) return
    // 搜索面板开着时，上下键用来在命中之间走
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && state.hits.length &&
          cache('bk-panel-search').classList.contains('is-on')) {
        e.preventDefault()
        goHit(state.hitIndex + (e.key === 'ArrowDown' ? 1 : -1))
        return
      }
      switch (e.key) {
        case 'j': case 'J': case 'ArrowDown': e.preventDefault(); screenScroll(1); break
        case 'k': case 'K': case 'ArrowUp': e.preventDefault(); screenScroll(-1); break
        case 'n': case 'N': case 'PageDown': e.preventDefault(); nudge(1); break
        case 'p': case 'P': case 'PageUp': e.preventDefault(); nudge(-1); break
        case 'Home': e.preventDefault(); scrollToPage(1); break
        case 'End': e.preventDefault(); scrollToPage(state.pageCount); break
        case '+': case '=': e.preventDefault(); zoomBy(0.15); break
        case '-': case '_': e.preventDefault(); zoomBy(-0.15); break
        case '0': e.preventDefault(); zoomReset(); break
        case '1': e.preventDefault(); setFit('width'); break
        case '2': e.preventDefault(); setFit('page'); break
        case 'g': case 'G': e.preventDefault(); setRegionMode(!state.regionMode); break
        case '[':
          e.preventDefault()
          state.keepRange = Math.min(12, state.keepRange + 2)
      toast(`已提高渲染质量（前后各留 ${state.keepRange} 页）`)
          break
        case ']':
          e.preventDefault()
          state.keepRange = Math.max(2, state.keepRange - 2)
          releaseFarPages()
      toast(`已降低渲染质量（前后各留 ${state.keepRange} 页）`)
          break
        default: break
      }
    })
  }

  /* ---------------- 单页图片 / 标注长图 ---------------- */

  const renderDocumentImage = async () => {
    if (!state.pdf) return
    const answer = window.prompt(`把第几页导出成图片？（1 - ${state.pageCount}）`, String(state.activePage))
    if (answer === null) return
    const n = Number(String(answer).trim())
    if (!n || n < 1 || n > state.pageCount) { toast('页码超出范围', 'warn'); return }
    try {
    setBusy(true, `渲染第 ${n} 页…`)
      const page = await state.pdf.getPage(n)
      const scale = Math.min(2.5, Math.max(1.2, state.scale))
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: ctx, viewport }).promise
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('生成图片失败')
      const name = exporter.safeName((state.doc && state.doc.title) || 'page')
      exporter.download(blob, `${name}-P${n}.png`, 'image/png')
      canvas.width = 0
      canvas.height = 0
      toast(`第 ${n} 页已导出为图片`)
    } catch (err) {
      toast(err && err.message ? err.message : '导出图片失败', 'error')
    } finally {
      setBusy(false)
    }
  }

  const exportAnnotationCard = async () => {
    if (!state.doc) { toast('请先打开一篇文献', 'warn'); return }
    if (!state.annotations.length) { toast('还没有标注可以导出', 'warn'); return }
    try {
    setBusy(true, '生成长图…')
    // 只导出标注与批注：摘要与笔记在 Markdown 里已经有了
      const blob = await exporter.toLongImage(state.doc, state.annotations, [])
      exporter.download(blob, exporter.safeName(state.doc.title) + '-标注.png', 'image/png')
      toast('标注长图已导出')
    } catch (err) {
      toast(err && err.message ? err.message : '导出失败', 'error')
    } finally {
      setBusy(false)
    }
  }

  /* ============================================================
   *  图区预览：超高分辨率局部放大
   *
   *  两条入口：
   *    1) 点「看原图」按钮 → 自动识别当前页的位图区域，画成可点热区；
   *       点热区 = 用大倍率重渲染这一块（不是把位图放大，是真的重新光栅化，
   *       所以矢量文字、细线条都会重新清晰，而不是像素插值糊掉）。
   *    2) 直接在页面上拖一个矩形 → 只放大这一块。
   *
   *  倍率上限由 pdf-view.js 的像素预算兜底（MAX_REGION_PIXELS），
   *  这里只负责把「屏幕像素」翻译成「页面基础坐标」。
   * ============================================================ */

  /** 当前倍率上限（用户可调 4x ~ 16x） */
  const REGION_SCALES = [4, 8, 12, 16]

  /** 取某页的骨架节点 */
  const pageNode = n => document.getElementById(`bk-p${n}`)

  /**
   * 屏幕坐标（clientX/Y）→ 页面基础坐标（scale=1 的点）。
   * 关键点：CSS 上页面被缩放到 state.scale，所以要除掉它；
   * 用 canvas-wrap 的 rect 而不是整页 rect，避免被骨架的圆角/边框影响。
   */
  const clientToPagePoint = (node, clientX, clientY) => {
    const wrap = node.querySelector('.bk-canvas-wrap') || node
    const box = wrap.getBoundingClientRect()
    const k = state.scale || 1
    return {
      x: (clientX - box.left) / k,
      y: (clientY - box.top) / k
    }
  }

  /** 页面上某个基础坐标矩形 → 屏幕矩形（画选择框用） */
  const pageRectToClient = (node, rect) => {
    const wrap = node.querySelector('.bk-canvas-wrap') || node
    const box = wrap.getBoundingClientRect()
    const k = state.scale || 1
    return {
      left: box.left + rect.x * k,
      top: box.top + rect.y * k,
      width: rect.width * k,
      height: rect.height * k
    }
  }

  /** 把当前页识别出的图区画成可点热区（进入图区模式才画） */
  const paintHotzones = async () => {
    const n = state.activePage
    const box = scroller()
    if (!box) return
    const removeHotzones = () => box.querySelectorAll('.bk-hotzone').forEach(el => el.remove())

    if (state.regionHotPage !== n) {
      removeHotzones()
      state.regionHot = []
      state.regionHotPage = n
      if (!state.pdf) return
      setBusy(true, '识别图区…')
      try {
        state.regionHot = await pdfLib.scanImages(state.pdf, n)
      } catch (_) {
        state.regionHot = []
      } finally {
        setBusy(false)
      }
    }

    removeHotzones()
    const node = pageNode(n)
    if (!node) return
    state.regionHot.forEach((r, i) => {
      const pos = pageRectToClient(node, r)
      const wrap = node.querySelector('.bk-canvas-wrap')
      if (!wrap) return
      const wrapBox = wrap.getBoundingClientRect()
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'bk-hotzone'
      el.dataset.index = String(i)
      el.title = '点击放大这块图区'
      el.style.left = (pos.left - wrapBox.left) + 'px'
      el.style.top = (pos.top - wrapBox.top) + 'px'
      el.style.width = pos.width + 'px'
      el.style.height = pos.height + 'px'
      el.innerHTML = '<span class="bk-hotzone-tag"><i class="fas fa-magnifying-glass-plus"></i>看原图</span>'
      wrap.appendChild(el)
    })
    if (!state.regionHot.length) toast('这一页没有识别到独立的图片区域，可以直接拖框放大', 'warn', 3600)
  }

  /** 关闭预览浮层并回收画布 */
  const closeRegion = () => {
    const box = cache('bk-region')
    if (!box) return
    box.classList.remove('is-on')
    box.setAttribute('aria-hidden', 'true')
    const stage = cache('bk-region-stage')
    if (stage) stage.innerHTML = ''
    if (state.regionTask && state.regionTask.cancel) {
      try { state.regionTask.cancel() } catch (_) {}
    }
    state.regionTask = null
    state.regionRect = null
    if (state.regionUrl) { URL.revokeObjectURL(state.regionUrl); state.regionUrl = null }
  }

  /** 浮层里的缩放 / 平移状态（与阅读器的 state 分开，避免互相干扰） */
  const regionView = { fit: 1, zoom: 1, x: 0, y: 0 }

  /** 把当前 regionView 应用到画布上 */
  const applyRegionView = () => {
    const canvas = cache('bk-region-canvas')
    const stage = cache('bk-region-stage')
    if (!canvas || !stage) return
    const scale = regionView.fit * regionView.zoom
    canvas.style.width = Math.max(1, Math.round(canvas.width * scale)) + 'px'
    canvas.style.height = Math.max(1, Math.round(canvas.height * scale)) + 'px'
    canvas.style.transform = `translate(${regionView.x}px, ${regionView.y}px)`
    const label = cache('bk-region-zoom')
    if (label) label.textContent = Math.round(regionView.zoom * 100) + '%'
  }

  /** 让画布尽量完整地铺进舞台，然后回到居中 */
  const fitRegion = () => {
    const canvas = cache('bk-region-canvas')
    const stage = cache('bk-region-stage')
    if (!canvas || !stage) return
    const availW = stage.clientWidth - 32
    const availH = stage.clientHeight - 32
    regionView.fit = Math.min(1, availW / canvas.width, availH / canvas.height)
    regionView.zoom = 1
    regionView.x = 0
    regionView.y = 0
    applyRegionView()
  }

  /**
   * 核心：按倍率重渲染一块区域并显示。
   * @param {number} pageNo
   * @param {{x,y,width,height}} rect 页面基础坐标
   * @param {boolean} autoClose 是否在渲染完成后关掉遮罩提示
   */
  const showRegion = async (pageNo, rect, autoClose = true) => {
    if (!state.pdf) return
    const box = cache('bk-region')
    if (!box) return
    box.classList.add('is-on')
    box.setAttribute('aria-hidden', 'false')

    const stage = cache('bk-region-stage')
    const meta = cache('bk-region-meta')
    const scale = state.regionScale || 8
    if (stage) stage.innerHTML = '<span class="bk-spin"></span>'
    if (meta) meta.textContent = `P${pageNo} · ${scale}x 渲染中…`
    setBusy(true, `${scale}x 超清渲染…`)

    state.regionRect = rect
    state.regionPage = pageNo

    try {
      // 已经点过「更清晰」就沿用已经自动收敛的倍率，避免重复被预算砍
      const { canvas, scale: realScale, dpr } = await pdfLib.renderRegion(
        state.pdf, pageNo, rect, {
          scale,
          dpr: window.devicePixelRatio || 1,
          onTask: task => { state.regionTask = task }
        }
      )
      state.regionTask = null

      const old = cache('bk-region-canvas')
      if (old) { old.width = 0; old.height = 0 }
      canvas.id = 'bk-region-canvas'
      if (stage) { stage.innerHTML = ''; stage.appendChild(canvas) }
      state.regionCanvas = canvas

      fitRegion()
      const capped = realScale < scale - 0.01
      if (meta) {
        meta.textContent = `P${pageNo} · ${Math.round(rect.width)}×${Math.round(rect.height)}pt` +
          ` · ${canvas.width}×${canvas.height}px` +
          ` · ${realScale.toFixed(1)}x` + (dpr > 1 ? ` @${dpr}x DPR` : '') +
          (capped ? '（已按画布预算收敛）' : '')
      }
      if (state.regionUrl) { URL.revokeObjectURL(state.regionUrl); state.regionUrl = null }
      if (capped && autoClose) {
        toast('倍率已按画布像素预算自动收敛，画质仍是当前设备的最优解', 'warn', 4200)
      }
    } catch (err) {
      if (err && err.name !== 'RenderingCancelledException') {
        toast(err.message || '高清渲染失败', 'error', 5000)
      }
      if (stage) stage.innerHTML = '<p class="bk-region-empty">这一块渲染失败了，换小一点的范围再试。</p>'
    } finally {
      setBusy(false)
    }
  }

  /** 从事件目标反推是哪一页、哪一块 */
  const regionFromEvent = (node, x0, y0, x1, y1) => {
    const a = clientToPagePoint(node, x0, y0)
    const b = clientToPagePoint(node, x1, y1)
    const rect = {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      width: Math.abs(b.x - a.x),
      height: Math.abs(b.y - a.y)
    }
    // 太小的框按误触处理（防止一点击就弹窗）
    if (rect.width < 8 || rect.height < 8) return null
    return rect
  }

  /** 进入 / 退出「框选放大」模式 */
  const setRegionMode = flag => {
    state.regionMode = !!flag
    const box = scroller()
    if (box) box.classList.toggle('is-region', state.regionMode)
    const btn = cache('bk-region-toggle')
    if (btn) {
      btn.classList.toggle('is-on', state.regionMode)
      btn.setAttribute('aria-pressed', state.regionMode ? 'true' : 'false')
    }
    closePanels()
    if (state.regionMode) {
      toast('框选放大：在页面上拖一个矩形，或点蓝色「看原图」热区', 'ok', 4200)
      paintHotzones()
    } else {
      if (box) box.querySelectorAll('.bk-hotzone').forEach(el => el.remove())
      const marquee = cache('bk-marquee')
      if (marquee) marquee.classList.remove('is-on')
    }
  }

  const storeRegionScale = () => {
    store.saveSetting('regionScale', state.regionScale).catch(() => {})
  }

  /** 框选交互：pointer 事件统一鼠标与触屏 */
  const wireRegion = () => {
    const box = scroller()
    if (!box) return
    const marquee = cache('bk-marquee')

    const pageOf = target => (target && target.closest ? target.closest('.bk-page') : null)

    on(box, 'pointerdown', e => {
      // 1) 命中自动识别出的图区热区 → 直接放大，不用拖
      const hot = e.target.closest && e.target.closest('.bk-hotzone')
      if (hot) {
        e.preventDefault()
        e.stopPropagation()
        const pageEl = pageOf(hot)
        const rect = state.regionHot[Number(hot.dataset.index)]
        if (pageEl && rect) showRegion(Number(pageEl.dataset.page), rect)
        return
      }

      if (!state.regionMode || e.button !== 0) return
      const pageEl = pageOf(e.target)
      if (!pageEl) return
      e.preventDefault()
      // 拖框时不要顺便划词
      if (window.getSelection) window.getSelection().removeAllRanges()
      hideMenu()

      state.regionDrag = {
        page: Number(pageEl.dataset.page),
        node: pageEl,
        x0: e.clientX,
        y0: e.clientY
      }
      if (box.setPointerCapture) box.setPointerCapture(e.pointerId)
      if (marquee) {
        marquee.classList.add('is-on')
        marquee.style.left = e.clientX + 'px'
        marquee.style.top = e.clientY + 'px'
        marquee.style.width = '0px'
        marquee.style.height = '0px'
      }
    })

    on(box, 'pointermove', e => {
      const drag = state.regionDrag
      if (!drag || !marquee) return
      marquee.style.left = Math.min(drag.x0, e.clientX) + 'px'
      marquee.style.top = Math.min(drag.y0, e.clientY) + 'px'
      marquee.style.width = Math.abs(e.clientX - drag.x0) + 'px'
      marquee.style.height = Math.abs(e.clientY - drag.y0) + 'px'
    })

    const finish = e => {
      const drag = state.regionDrag
      state.regionDrag = null
      if (marquee) marquee.classList.remove('is-on')
      if (!drag) return
      const rect = regionFromEvent(drag.node, drag.x0, drag.y0, e.clientX, e.clientY)
      if (rect) showRegion(drag.page, rect)
      else if (state.regionMode) toast('框太小了，请拖一个大一点的范围', 'warn', 2600)
    }
    on(box, 'pointerup', finish)
    on(box, 'pointercancel', () => {
      state.regionDrag = null
      if (marquee) marquee.classList.remove('is-on')
    })
  }

  /** 预览浮层内部交互：滚轮缩放 / 拖动平移 / 保存复制 / 更清晰 */
  const wireRegionOverlay = () => {
    const stage = cache('bk-region-stage')

    on(stage, 'wheel', e => {
      if (!cache('bk-region-canvas')) return
      e.preventDefault()
      const step = e.deltaY < 0 ? 1.15 : 1 / 1.15
      regionView.zoom = Math.min(12, Math.max(0.2, regionView.zoom * step))
      applyRegionView()
    }, { passive: false })

    let panning = null
    on(stage, 'pointerdown', e => {
      const canvas = cache('bk-region-canvas')
      if (!canvas || (e.target.closest && e.target.closest('button'))) return
      panning = { x: e.clientX, y: e.clientY, ox: regionView.x, oy: regionView.y }
      canvas.classList.add('is-panning')
      e.preventDefault()
    })
    on(window, 'pointermove', e => {
      if (!panning) return
      regionView.x = panning.ox + (e.clientX - panning.x)
      regionView.y = panning.oy + (e.clientY - panning.y)
      applyRegionView()
    })
    on(window, 'pointerup', () => {
      panning = null
      const canvas = cache('bk-region-canvas')
      if (canvas) canvas.classList.remove('is-panning')
    })

    on(cache('bk-region-close'), 'click', closeRegion)
    on(cache('bk-region-fit'), 'click', fitRegion)
    on(cache('bk-region-out'), 'click', () => {
      regionView.zoom = Math.max(0.2, regionView.zoom / 1.25)
      applyRegionView()
    })
    on(cache('bk-region-in'), 'click', () => {
      regionView.zoom = Math.min(12, regionView.zoom * 1.25)
      applyRegionView()
    })

    // 「更清晰」：在当前倍率上再叠一档并重渲染（不是 CSS 放大）
    on(cache('bk-region-hd'), 'click', () => {
      if (!state.regionRect) return
      const idx = REGION_SCALES.indexOf(state.regionScale)
      state.regionScale = REGION_SCALES[Math.min(REGION_SCALES.length - 1, (idx < 0 ? 1 : idx) + 1)]
      storeRegionScale()
      showRegion(state.regionPage, state.regionRect, false)
    })

    on(cache('bk-region-save'), 'click', async () => {
      const canvas = state.regionCanvas
      if (!canvas) return
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        if (!blob) throw new Error('生成图片失败')
        const name = exporter.safeName((state.doc && state.doc.title) || 'region')
        exporter.download(blob, `${name}-P${state.regionPage}-图区.png`, 'image/png')
        toast('已保存 PNG')
      } catch (err) {
        toast(err.message || '保存失败', 'error')
      }
    })

    on(cache('bk-region-copy'), 'click', async () => {
      const canvas = state.regionCanvas
      if (!canvas) return
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        if (!blob) throw new Error('生成图片失败')
        // ClipboardItem 只在安全上下文（https / localhost）可用
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          toast('已复制到剪贴板')
        } else {
          throw new Error('当前环境不支持写剪贴板，请用「保存 PNG」')
        }
      } catch (err) {
        toast(err.message || '复制失败', 'error', 4200)
      }
    })

    // 点浮层空白处关闭
    on(cache('bk-region'), 'click', e => {
      if (e.target === cache('bk-region')) closeRegion()
    })
  }

  const wireHeader = () => {
    on(cache('bk-file'), 'change', e => {
      const file = e.target.files && e.target.files[0]
      e.target.value = ''   // 允许重复选同一个文件
      if (file) openLocalFile(file)
    })

    const submit = () => {
      const input = cache('bk-source')
      const value = input ? input.value.trim() : ''
      if (!value) { toast('请先输入 DOI 或 PDF 链接', 'warn'); return }
      openFromInput(value)
    }
    on(cache('bk-open'), 'click', submit)
    on(cache('bk-source'), 'keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); submit() }
    })

    on(cache('bk-library-toggle'), 'click', openLibrary)
    on(cache('bk-library-close'), 'click', closeLibrary)

    // 空态里的「继续阅读」入口
    on(cache('bk-recent'), 'click', e => {
      const card = e.target.closest('.bk-recent-item')
      if (!card) return
      openFromLibrary(card.dataset.id)
    })

    // 目录 / 搜索 面板
    on(cache('bk-panel-outline'), 'click', () => {
      const on_ = cache('bk-panel-outline').classList.toggle('is-on')
      cache('bk-panel-outline').setAttribute('aria-pressed', on_ ? 'true' : 'false')
      cache('bk-panel-search').classList.remove('is-on')
      if (on_) renderOutline()
      cache('bk-toolbar-more').classList.remove('is-on')
    })
    on(cache('bk-panel-search'), 'click', () => {
      const on_ = cache('bk-panel-search').classList.toggle('is-on')
      cache('bk-panel-search').setAttribute('aria-pressed', on_ ? 'true' : 'false')
      cache('bk-panel-outline').classList.remove('is-on')
      if (on_) {
        const input = cache('bk-search-input')
        if (input) input.focus()
        else renderSearchResults()
      }
      cache('bk-toolbar-more').classList.remove('is-on')
    })
    on(cache('bk-toolbar-more'), 'click', () => {
      cache('bk-toolbar-more').classList.toggle('is-on')
    })

    // 浮层面板的关闭按钮（目录 / 搜索）
    document.querySelectorAll('.bk-float-close').forEach(btn => {
      on(btn, 'click', () => {
        const box = cache(btn.dataset.close)
        if (box) box.classList.remove('is-on')
      })
    })

    on(cache('bk-export-md'), 'click', exportMarkdown)
    on(cache('bk-export-img'), 'click', exportImage)
    on(cache('bk-export-json'), 'click', exportJson)

    on(cache('bk-help'), 'click', () => {
      const box = cache('bk-helpbox')
      box.classList.add('is-on')
      box.setAttribute('aria-hidden', 'false')
    })
    on(cache('bk-help-close'), 'click', () => {
      const box = cache('bk-helpbox')
      box.classList.remove('is-on')
      box.setAttribute('aria-hidden', 'true')
    })
  }

  const wireToolbar = () => {
    on(cache('bk-prev'), 'click', () => nudge(-1))
    on(cache('bk-next'), 'click', () => nudge(1))
    on(cache('bk-zoom-in'), 'click', () => zoomBy(0.15))
    on(cache('bk-zoom-out'), 'click', () => zoomBy(-0.15))
    on(cache('bk-fit-width'), 'click', () => setFit('width'))
    on(cache('bk-fit-page'), 'click', () => setFit('page'))
    on(cache('bk-panel-toggle'), 'click', () => {
      cache('bk-workspace').classList.toggle('is-collapsed')
      // 布局变了要按新宽度重排
      if (state.pdf) rerenderPages()
      else renderRecent()
    })
    // 页码可以直接点进去跳
    on(cache('bk-page-label'), 'click', () => {
    if (!state.pdf) { toast('请先打开一篇文献', 'warn'); return }
    const answer = window.prompt(`跳到第几页？（1 - ${state.pageCount}）`, String(state.activePage))
      if (answer === null) return
      const n = Number(String(answer).trim())
    if (!n || n < 1 || n > state.pageCount) { toast('页码超出范围', 'warn'); return }
      scrollToPage(n)
    })
    on(cache('bk-toolbar-more'), 'click', () => cache('bk-toolbar-more').classList.toggle('is-on'))

    // 图区预览：切换「框选放大」模式
    on(cache('bk-region-toggle'), 'click', () => {
      if (!state.pdf) { toast('请先打开一篇文献', 'warn'); return }
      setRegionMode(!state.regionMode)
    })
  }

  const wireTabs = () => {
    document.querySelectorAll('.bk-tab').forEach(btn => {
      on(btn, 'click', () => switchTab(btn.dataset.tab))
    })
  }

  const wirePanes = () => {
    on(cache('bk-note-add'), 'click', () => addNote())
    on(cache('bk-summarize'), 'click', summarizeDocument)
    on(cache('bk-bi-generate'), 'click', translateDocument)
    on(cache('bk-bi-image'), 'click', () => { if (state.pdf) renderDocumentImage() })
    on(cache('bk-ann-export'), 'click', exportAnnotationCard)
    on(cache('bk-bi-clear'), 'click', async () => {
      if (!state.translation.length) return
    if (!window.confirm('清空右侧对照列表？已保存的对照记录也会一并删除。')) return
      const records = state.notes.filter(n => n.kind === 'translation')
      for (const record of records) await store.removeNote(record.id)
      state.notes = state.notes.filter(n => n.kind !== 'translation')
      state.translation = []
      renderBilingual()
      renderNotes()
      toast('已清空对照')
    })
    on(cache('bk-ann-clear'), 'click', async () => {
      if (!state.annotations.length) return
    if (!window.confirm(`确定删除全部 ${state.annotations.length} 条标注吗？`)) return
      for (const a of state.annotations) await store.removeAnnotation(a.id)
      state.annotations = []
      repaintAll()
      renderAnnotationList()
      toast('标注已清空')
    })

    on(cache('bk-cfg-save'), 'click', saveSettings)
    on(cache('bk-cfg-wipe'), 'click', wipeAll)

    // 笔记：输入即存（防抖）
    const list = cache('bk-note-list')
    on(list, 'input', e => {
      const card = e.target.closest('.bk-note')
      if (!card) return
      const record = state.notes.find(n => n.id === card.dataset.id)
      if (!record) return
      if (e.target.classList.contains('bk-note-title')) record.title = e.target.value
      if (e.target.classList.contains('bk-note-text')) record.text = e.target.value
      clearTimeout(list._t)
      list._t = setTimeout(() => store.saveNote(record).catch(() => {}), 600)
    })
    on(list, 'click', async e => {
      if (!e.target.closest('.bk-note-del')) return
      const card = e.target.closest('.bk-note')
      const id = card.dataset.id
    if (!window.confirm('删除这条笔记？')) return
      await store.removeNote(id)
      state.notes = state.notes.filter(n => n.id !== id)
      renderNotes()
    })

    // 标注列表：跳页 / 改批注 / 删除
    const annList = cache('bk-ann-list')
    on(annList, 'click', async e => {
      const card = e.target.closest('.bk-ann')
      if (!card) return
      if (e.target.closest('.bk-ann-del')) {
    if (!window.confirm('删除这条标注？')) return
        await store.removeAnnotation(card.dataset.id)
        state.annotations = state.annotations.filter(a => a.id !== card.dataset.id)
        repaintAll()
        renderAnnotationList()
        return
      }
      if (e.target.closest('.bk-ann-quote') || e.target.closest('.bk-ann-page')) {
        scrollToPage(Number(card.dataset.page))
      }
    })
    on(annList, 'input', e => {
      if (!e.target.classList.contains('bk-ann-note')) return
      const card = e.target.closest('.bk-ann')
      const record = state.annotations.find(a => a.id === card.dataset.id)
      if (!record) return
      record.note = e.target.value
      clearTimeout(annList._t)
      annList._t = setTimeout(() => store.saveAnnotation(record).catch(() => {}), 600)
    })
  }

  const wireSelection = () => {
    on(document, 'selectionchange', onSelectionChange)
    // 鐐瑰嚮绌虹櫧澶勬敹璧疯彍鍗?
    on(document, 'mousedown', e => {
      const menu = cache('bk-menu')
      if (!menu) return
      if (menu.contains(e.target)) return
      if (e.target.closest('.textLayer')) return
      hideMenu()
    })
    // 滚动时收起（避免菜单悬空）
    on(scroller(), 'scroll', hideMenu, { passive: true })

    // 触屏兜底:手机上远没有 selectionchange 的鼠标路径，靠长按+抬手唤起菜单
    on(scroller(), 'touchend', () => {
      window.setTimeout(() => {
        const info = captureSelection()
        if (info) showMenu(info)
      }, 60)
    }, { passive: true })

    const menu = cache('bk-menu')
    on(menu, 'mousedown', e => {
      // 别让点击菜单清掉选区
      if (e.target.closest('button')) e.preventDefault()
    })
    on(menu, 'click', e => {
      const btn = e.target.closest('button[data-act]')
      const dot = e.target.closest('.bk-dot')
      if (dot) {
        const color = dot.dataset.color
        menu.dataset.color = color
        store.saveSetting('annotColor', color).catch(() => {})
        if (state.selectedAnchor) createAnnotation('highlight', color)
        return
      }
      if (!btn) return
      const act = btn.dataset.act
      const color = menu.dataset.color || '#ffd666'
      if (act === 'highlight' || act === 'underline' || act === 'strike') {
        createAnnotation(act, color)
      } else if (act === 'note') {
        createAnnotationWithNote()
      } else if (act === 'translate') {
        translateSelection()
      } else if (act === 'copy') {
        copySelection()
      }
    })
  }

  const wireDrop = () => {
    const scrollerEl = scroller()
    const stop = e => { e.preventDefault(); e.stopPropagation() }
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(type => {
      on(scrollerEl, type, stop)
      on(document.body, type, stop)
    })
    on(scrollerEl, 'dragenter', () => cache('bk-workspace').classList.add('is-dragging'))
    on(scrollerEl, 'dragover', () => cache('bk-workspace').classList.add('is-dragging'))
    on(scrollerEl, 'dragleave', e => {
      if (!scrollerEl.contains(e.relatedTarget)) cache('bk-workspace').classList.remove('is-dragging')
    })
    const drop = e => {
      cache('bk-workspace').classList.remove('is-dragging')
      const dt = e.dataTransfer
      if (!dt) return
    // 拖进来的可能是文件，也可能是一段 URL 文本
      const file = dt.files && dt.files[0]
      if (file) { openLocalFile(file); return }
      const text = dt.getData('text/uri-list') || dt.getData('text/plain')
      if (text) openFromInput(text.trim())
    }
    on(scrollerEl, 'drop', drop)
    on(cache('bk-dropzone'), 'click', () => cache('bk-file').click())
  }

  /** 窗口尺寸变化时按当前适配模式重排 */
  const wireResize = () => {
    let timer = null
    on(window, 'resize', () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
    // 长文重排代价高：到很宽的屏幕上（>=1400）就不再跟着窗口抖动重排
        if (window.innerWidth >= 1400 && state.pageCount > 30) return
        if (!state.pdf) { renderRecent(); return }
        if (state.fit === 'width' || state.fit === 'page') rerenderPages()
      }, 260)
    })
  }

  /* ---------------- 初始化 ---------------- */

  const init = async () => {
    // 只在 /books/ 页面运行（pjax 切换时脚本可能仍在全局）
    if (!document.body.classList.contains('bk-page-body')) return

    wireHeader()
    wireToolbar()
    wireTabs()
    wirePanes()
    wireOutline()
    wireSearch()
    wireSelection()
    wireDrop()
    wireResize()
    wireKeys()
    wireRegion()
    wireRegionOverlay()

    await fillSettings()
    await renderLibrary()
    await renderRecent()
    renderAnnotationList()
    renderNotes()
    renderBilingual()
    renderOutline()
    renderDocHeader()

    // 首次进入自动弹说明
    try {
      const seen = await store.getSetting('helpSeen', false)
      if (!seen) {
        cache('bk-helpbox').classList.add('is-on')
        cache('bk-helpbox').setAttribute('aria-hidden', 'false')
        await store.saveSetting('helpSeen', true)
      }
    } catch (_) {}

    // 离开/切后台时把进度落盘
    on(document, 'visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        stopTimer()
        if (state.doc) {
          recordProgress()
          store.touchHistory(state.doc.id, { lastPage: state.activePage }).catch(() => {})
        }
      } else {
        startTimer()
      }
    })
    on(window, 'pagehide', () => {
      stopTimer()
      if (state.doc) recordProgress()
    })

    // 支持 ?doi=10.xxxx 或 ?url=https://... 直接打开
    const params = new URLSearchParams(window.location.search)
    const direct = params.get('doi') || params.get('url') || params.get('pdf')
    if (direct) {
      const input = cache('bk-source')
      if (input) input.value = direct
      openFromInput(direct)
    }
  }

  /** pjax 离开时清理，避免监听器泄漏 */
  const teardown = () => {
    stopTimer()
    if (state.doc) recordProgress()
    cleanup()
    closeRegion()
    if (pageObserver) { pageObserver.disconnect(); pageObserver = null }
    if (scrollWatcher) { scrollWatcher.disconnect(); scrollWatcher = null }
    if (state.degradeTimer) { clearTimeout(state.degradeTimer); state.degradeTimer = null }
    clearTimeout(searchTimer)
    clearTimeout(lastPageTimer)
    state.rendered.clear()
    state.pageTasks.clear()
    state.regionHot = []
    state.regionHotPage = 0
    document.querySelectorAll('.bk-note-list, .bk-ann-list').forEach(n => { n._t && clearTimeout(n._t) })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }

    // Butterfly 用 pjax；离开本页时收尾（无 pjax 时无害）
  window.addEventListener('pagehide', teardown)
  if (window.btf && typeof window.btf.addGlobalFn === 'function') {
    window.btf.addGlobalFn('pjaxSend', teardown, 'books_teardown')
  }
})()
