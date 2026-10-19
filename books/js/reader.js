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
    popAnnotation: null,
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
    lastScrollAt: 0,      // 上次滚动/layout-shift 的时间戳（用于「滚动变慢」判定）
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
    annotRegionMode: false, // 是否处于「框选图片写批注」模式（一次性）
    regionHot: [],        // 当前页自动识别出的图区（页面基础坐标）
    regionHotPage: 0,
    regionDrag: null,
    regionScale: 8,       // 目标放大倍率
    regionPage: 0,
    regionRect: null,
    regionCanvas: null,
    regionTask: null,     // 预览渲染的 RenderTask（关闭时取消）
    regionUrl: null,
    view: 'reader',       // reader | shelf（书架视图由 library.js 渲染）
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
    // 减去左右 padding（各 16px），再减掉竖直滚动条占掉的宽度：
    // 否则「适宽」算出来的页面正好等于可用宽度，滚动条一出现就横向溢出、底部冒出横向滚动条。
    const bar = Math.max(0, box.offsetWidth - box.clientWidth)
    const avail = box.clientWidth - 32 - bar
    if (state.fit === 'width') return Math.max(0.2, avail / state.measured.width)
    if (state.fit === 'page') {
      const h = window.innerHeight - 180
      return Math.max(0.2, Math.min(avail / state.measured.width, h / state.measured.height))
    }
    return state.scale
  }

  /**
   * 工具栏百分比。
   * 以前这个标签在 index.html 里写死 100%，JS 从不更新，放大缩小都显示 100%。
   * 注意：fit=width/page 时 state.scale 是「上次的值」，真实倍率要由 computeScale 算。
   */
  const syncZoomLabel = () => {
    const label = cache('bk-zoom-label')
    if (!label) return
    const scale = state.pdf ? computeScale() : state.scale
    label.textContent = Math.round(scale * 100) + '%'
  }


  /* ---------------- 骨架：只建占位，不画位图 ---------------- */
  const buildSkeleton = async () => {
    const box = scroller()
    if (!box) return
    // 清空 DOM 会让 scrollHeight 归零，浏览器随即把 scrollTop 钳到 0。
    // 即便调用方随后会 restoreAnchor，中间那一帧的「跳回顶部」也已经被用户看到了。
    // 所以先记下来，骨架一建好立刻写回，全程不出现 0。
    const keepScroll = box.scrollTop
    box.innerHTML = ''
    const first = await state.pdf.getPage(1)
    const vp = first.getViewport({ scale: 1 })
    state.measured = { width: vp.width, height: vp.height }
    state.scale = computeScale()
    syncMetrics()
    syncZoomLabel()

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
    // 新骨架的高度已就位，把清空期间被钳掉的滚动位置写回（同样压掉 smooth）
    const prevBehavior = box.style.scrollBehavior
    box.style.scrollBehavior = 'auto'
    box.scrollTop = keepScroll
    box.style.scrollBehavior = prevBehavior

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
    // 已经在正式渲染（或排队中）的页不要再开第二个 render：
    // PDF.js 对同一 canvas 并发两次 render，会互相打断，最后留下半张残图。
    if (state.pageTasks.has(n) || state.rendered.has(n)) return
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
    box.className = 'bk-toast is-on' + (type ? ' is-' + type : '')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { box.className = 'bk-toast' }, ms)
  }

  const setBusy = (flag, label) => {
    state.busy = flag
    const box = cache('bk-busy')
    if (!box) return
    box.classList.toggle('is-on', !!flag)
    if (label) qs(box, '.bk-busy-text').textContent = label
  }

  /** 让某一页的高亮块闪烁一下（搜索命中 / 跳转定位用） */
  const flashMarks = pageNo => {
    const pageEl = pageNode(pageNo)
    if (!pageEl) return
    pageEl.querySelectorAll('.bk-hl, .bk-hit').forEach(mark => {
      mark.classList.remove('is-flash')
      // 强制回流，保证连续两次定位都能看到动画
      void mark.offsetWidth
      mark.classList.add('is-flash')
    })
  }

  /**
   * 合并同一行里相邻的高亮矩形。
   *
   * 为什么需要：PDF 文本层用「绝对定位跳格」还原原文排版，词与词之间常常是
   * 跳过一段空白而不是打一个空格字符（实测本仓库那份双栏 PDF：`mediated`
   * 右边界 756，下一个词从 773 才开始，中间空出 17px）。于是 getClientRects()
   * 会为一个连续句子返回好几段矩形，画出来就是断断续续的碎块。
   * 这里只合并「同一行 + 间隙小于阈值」的矩形，绝不跨行合并（双栏会被粘在一起）。
   */
  const mergeRects = (rects, pageWidth = 0) => {
    if (rects.length < 2) return rects
    // 单段连续高亮的上限：页宽的一半。双栏 PDF 左右栏之间的留白通常更大，
    // 这条限制保证「双栏不会被粘成一整条横贯页面的色带」。
    // 传了 pageWidth 就用页宽（可靠），否则退化为本组矩形的跨度。
    const span = pageWidth > 0
      ? pageWidth
      : Math.max(...rects.map(r => r.left + r.width)) - Math.min(...rects.map(r => r.left))
    const maxRun = span * 0.55
    const rows = []
    // 先按 top 分行（容差 30% 行高，应对上下标造成的 1~2px 抖动）
    ;[...rects].sort((a, b) => a.top - b.top || a.left - b.left).forEach(rect => {
      const row = rows.find(r => Math.abs(r.top - rect.top) < Math.max(2, rect.height * 0.3))
      if (row) {
        row.items.push(rect)
        row.top = Math.min(row.top, rect.top)
        row.height = Math.max(row.height, rect.height)
      } else {
        rows.push({ top: rect.top, height: rect.height, items: [rect] })
      }
    })

    const out = []
    rows.forEach(row => {
      row.items.sort((a, b) => a.left - b.left)
      // 阈值用「本行矩形高度的中位数」，而不是随合并不断变化的 row.height
      const heights = row.items.map(r => r.height).sort((a, b) => a - b)
      const lineH = heights[Math.floor(heights.length / 2)] || row.height || 1
      const limit = lineH * 0.8
      let cur = { ...row.items[0] }
      row.items.slice(1).forEach(rect => {
        const gap = rect.left - (cur.left + cur.width)
        // 间隙为负（矩形重叠）或小于阈值 → 视为同一行的连续文字
        if (gap < limit) {
          const right = Math.max(cur.left + cur.width, rect.left + rect.width)
          if (right - cur.left <= maxRun) {
            cur.width = right - cur.left
            cur.height = Math.max(cur.height, rect.height)
            return
          }
        }
        out.push(cur)
        cur = { ...rect }
      })
      out.push(cur)
    })
    return out
  }

  /** 把某一页的标注画到它的高亮层上（锚点重新定位，缩放不丢） */
  const paintHighlights = pageNo => {
    const pageEl = pageNode(pageNo)
    if (!pageEl) return
    const wrap = pageEl.querySelector('.bk-canvas-wrap')
    const textLayer = wrap && wrap.querySelector('.textLayer')
    const hlLayer = wrap && wrap.querySelector('.bk-hl-layer')
    if (!textLayer || !hlLayer) return

    hlLayer.innerHTML = ''
    state.annotations
      .filter(a => Number(a.page) === Number(pageNo))
      .forEach(a => {
        // 图区标注没有文字，不能走锚点引擎：直接按存的点坐标 × 缩放画框
        if (isRegionAnn(a)) {
          if (!a.region) return
          const k = state.scale
          const r = a.region
          const box = document.createElement('div')
          box.className = 'bk-hl is-region has-note'
          box.dataset.id = a.id
          box.dataset.type = 'region'
          box.style.left = (r.x * k) + 'px'
          box.style.top = (r.y * k) + 'px'
          box.style.width = Math.max(0, r.width * k) + 'px'
          box.style.height = Math.max(0, r.height * k) + 'px'
          box.style.setProperty('--bk-region-color', a.color || '#7aa7ff')
          // 父层 .bk-hl-layer 是 pointer-events:none，子元素必须显式改回 auto
          // 才能接收鼠标（同为「可点开批注」，与文字高亮的规则一致）
          box.style.pointerEvents = 'auto'
          box.title = '点开批注'
          // 气泡要贴着框的左上角出（与文字高亮同一套定位）
          a._box = {
            left: r.x * k,
            top: r.y * k,
            right: (r.x + r.width) * k,
            bottom: (r.y + r.height) * k,
            page: Number(pageNo)
          }
          hlLayer.appendChild(box)
          return
        }
        const ranges = anchor.toRanges(a, textLayer)
        if (!ranges.length) {
          console.warn('[books] annotation anchor failed', a.id, String(a.quote).slice(0, 40))
          return
        }
        const merged = mergeRects(anchor.rectsOf(ranges, textLayer), pageEl.offsetWidth)
        // 记下这条标注的包围盒，气泡定位要用（多行时取并集）
        const box = merged.reduce((acc, r) => {
          if (!acc) return { left: r.left, top: r.top, right: r.left + r.width, bottom: r.top + r.height }
          return {
            left: Math.min(acc.left, r.left),
            top: Math.min(acc.top, r.top),
            right: Math.max(acc.right, r.left + r.width),
            bottom: Math.max(acc.bottom, r.top + r.height)
          }
        }, null)
        if (box) a._box = { ...box, page: Number(pageNo) }
        merged.forEach(rect => {
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
          if (String(a.note || '').trim()) {
            mark.classList.add('has-note')
            // 有批注的高亮才接收鼠标：点一下直接出气泡，不必去右侧列表里找
            // （纯高亮仍然穿透，选字交给 textLayer）
            mark.style.pointerEvents = 'auto'
            mark.title = '点开批注'
          }
          hlLayer.appendChild(mark)
        })
      })
  }

  const repaintAll = () => {
    state.rendered.forEach(n => paintHighlights(n))
  }

  /* ---------------- 随文批注气泡 ---------------- */

  /**
   * 气泡挂在 .bk-page 里，用页面内绝对坐标定位。
   * 这样它随页面滚动、随缩放重排一起动，不需要任何 position:fixed 的同步逻辑。
   */
  let popId = null            // 当前打开的标注 id
  let popEditing = false      // 是否处于编辑态

  const popNode = () => {
    const box = scroller()
    return box ? qs(box, '.bk-note-pop') : null
  }

  /** 彻底移除气泡（切换标注、关闭、页面重排时调用） */
  const closeNotePop = () => {
    const box = scroller()
    if (!box) return
    const node = qs(box, '.bk-note-pop')
    if (node) node.remove()
    const lead = qs(box, '.bk-note-pop-lead')
    if (lead) lead.remove()
    box.querySelectorAll('.bk-hl.is-selected').forEach(el => el.classList.remove('is-selected'))
    popId = null
    popEditing = false
    state.popAnnotation = null
  }

  /**
   * 计算气泡位置与宽度。
   *
   * 优先顺序：页内左右空隙 → 页内空白处盖住少量文字 → 高亮下方 / 上方。
   * 宽度会按实际可用空间收缩（最小 200px），而不是死守 300px ——
   * 「适宽」模式下页面几乎占满滚动区，页外留白只有 16px 左右，
   * 死守 300px 就只可能整个压在正文上，遮挡面积更大。
   */
  const placeNotePop = (pop, pageEl, rect) => {
    const pageW = pageEl.offsetWidth
    const pageH = pageEl.offsetHeight
    const pad = 8
    const gap = 8
    const MIN_W = 200
    const MAX_W = 320

    // 先量高度（宽度先按最大给，避免因换行把高度算少）
    pop.style.width = MAX_W + 'px'
    pop.style.left = '0px'
    pop.style.top = '0px'
    const hFull = pop.offsetHeight || 200

    const rightSpace = pageW - rect.right      // 高亮右侧的本行余量
    const leftSpace = rect.left                // 高亮左侧的本行余量

    let left
    let top
    let w = MAX_W

    if (rightSpace >= MIN_W + gap && rightSpace >= leftSpace) {
      // 放在高亮右侧，宽度取可用空间（最多 MAX_W）
      w = Math.min(MAX_W, rightSpace - gap)
      left = rect.right + gap
      top = rect.top
    } else if (leftSpace >= MIN_W + gap) {
      w = Math.min(MAX_W, leftSpace - gap)
      left = rect.left - w - gap
      top = rect.top
    } else if (pageH - rect.bottom >= hFull + gap + pad) {
      // 行太满：放到高亮下方（窄一点，减少遮挡）
      w = Math.min(pageW - pad * 2, 280)
      left = Math.min(rect.left, pageW - w - pad)
      top = rect.bottom + gap
    } else {
      w = Math.min(pageW - pad * 2, 280)
      left = Math.min(rect.left, pageW - w - pad)
      top = Math.max(pad, rect.top - hFull - gap)
    }

    pop.style.width = Math.round(w) + 'px'
    const h = Math.min(pop.offsetHeight || hFull, pageH - pad * 2)
    left = Math.max(pad, Math.min(left, pageW - w - pad))
    top = Math.max(pad, Math.min(top, Math.max(pad, pageH - h - pad)))
    pop.style.left = Math.round(left) + 'px'
    pop.style.top = Math.round(top) + 'px'
    return { left, top, w, h }
  }

  /**
   * 拖动时把气泡收进视口。
   *
   * 页面通常比视口高好几倍，如果只按页面边界夹紧，气泡会被拖到
   * 屏幕下方「消失」——用户看不到也抓不回来。这里改用页面内坐标与
   * 视口的交集做约束，保证拖动过程中气泡始终整块可见。
   */
  const keepInView = (pop, at) => {
    const pageEl = pop.parentElement
    const pageRect = pageEl.getBoundingClientRect()
    const view = scroller().getBoundingClientRect()
    const margin = 8
    const minY = view.top - pageRect.top + margin
    const maxY = view.bottom - pageRect.top - at.h - margin
    const top = Math.max(minY, Math.min(at.top, maxY))
    if (top !== at.top) {
      pop.style.top = Math.round(top) + 'px'
      at.top = top
    }
    return at
  }

  /**
   * 让气泡落在指定偏移处（已拖动过的标注走这里）。
   * 不重新做「找空白」的排版决策，只负责夹进页面边界内。
   */
  const placeNotePopAt = (pop, pageEl, pos) => {
    const pageW = pageEl.offsetWidth
    const pageH = pageEl.offsetHeight
    const pad = 8
    const w = Math.min(pos.w || pop.offsetWidth || 320, pageW - pad * 2)
    const h = Math.min(pop.offsetHeight || 120, pageH - pad * 2)
    const left = Math.max(pad, Math.min(pos.left, pageW - w - pad))
    const top = Math.max(pad, Math.min(pos.top, pageH - h - pad))
    pop.style.width = Math.round(w) + 'px'
    pop.style.left = Math.round(left) + 'px'
    pop.style.top = Math.round(top) + 'px'
    return { left, top, w, h }
  }

  /**
   * 把气泡变成可拖动。
   *
   * 只认 `.bk-note-pop-head` 作为手柄——正文区/按钮照常可点，也不会误触发选中。
   * 用 pointer capture 而不是 window mousemove：
   * 指针移出气泡甚至移出页面，事件仍然回到这个元素，松手一定收得到。
   * 拖动结束把位置写回标注（ann.pos），下次打开就在原地。
   */
  const wireDrag = pop => {
    const head = qs(pop, '.bk-note-pop-head')
    if (!head || head.dataset.dragWired) return
    head.dataset.dragWired = '1'

    let drag = null
    let lastTap = 0

    head.addEventListener('pointerdown', e => {
      // 头部上的按钮不是手柄，别抢它们的点击
      if (e.target.closest('button')) return
      if (e.button !== 0) return
      e.preventDefault()

      // 手动判双击：pointerdown 的 preventDefault 会抑制 dblclick 事件，
      // 所以不能靠 'dblclick'，只能自己数两次按下的时间间隔。
      const now = Date.now()
      if (now - lastTap < 320) {
        lastTap = 0
        const ann = state.annotations.find(a => a.id === pop.dataset.id)
        if (ann && ann.pos) {
          ann.pos = null
          store.saveAnnotation(ann).catch(() => {})
          openNotePop(ann.id, { force: true, editing: popEditing })
          toast('已恢复自动位置')
        }
        return
      }
      lastTap = now

      const pageEl = pop.parentElement
      drag = {
        id: e.pointerId,
        sx: e.clientX,
        sy: e.clientY,
        ox: pop.offsetLeft,
        oy: pop.offsetTop,
        pageEl
      }
      pop.classList.add('is-dragging')
      document.body.classList.add('bk-dragging-pop')
      try { head.setPointerCapture(e.pointerId) } catch (_) {}
    })

    head.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return
      const pageEl = drag.pageEl
      // 拖动过程中版面可能因缩放改变，每次都按当前尺寸夹一遍
      const at = placeNotePopAt(pop, pageEl, {
        left: drag.ox + (e.clientX - drag.sx),
        top: drag.oy + (e.clientY - drag.sy),
        w: pop.offsetWidth
      })
      // 再把气泡整体留在视口内：否则拖到页面边缘后，气泡会停在
      // 屏幕外抓不回来（页面比视口高得多时很常见）。
      keepInView(pop, at)
      const ann = state.annotations.find(a => a.id === pop.dataset.id)
      const rect = ann && ann._box
      if (rect) drawLead(pageEl, rect, at)
    })

    const end = e => {
      if (!drag || (e && e.pointerId !== drag.id)) return
      try { head.releasePointerCapture(drag.id) } catch (_) {}
      pop.classList.remove('is-dragging')
      document.body.classList.remove('bk-dragging-pop')
      drag = null
      const ann = state.annotations.find(a => a.id === pop.dataset.id)
      if (!ann) return
      const pos = {
        left: Math.round(pop.offsetLeft),
        top: Math.round(pop.offsetTop),
        w: Math.round(pop.offsetWidth)
      }
      // 没真的移动就别写库，避免无谓 IO
      if (ann.pos && ann.pos.left === pos.left && ann.pos.top === pos.top) return
      ann.pos = pos
      store.saveAnnotation(ann).catch(() => {})
    }
    head.addEventListener('pointerup', end)
    head.addEventListener('pointercancel', end)
  }

  /** 从高亮到气泡画一条细引线，明确「这张便签属于这段文字」 */
  const drawLead = (pageEl, rect, at) => {
    let lead = qs(pageEl, '.bk-note-pop-lead')
    if (!lead) {
      lead = document.createElement('div')
      lead.className = 'bk-note-pop-lead'
      pageEl.appendChild(lead)
    }
    const rightSide = at.left >= rect.right
    const leftSide = at.left + at.w <= rect.left
    if (rightSide || leftSide) {
      const y = Math.max(rect.top, at.top) + 12
      const x1 = rightSide ? rect.right : at.left + at.w
      const x2 = rightSide ? at.left : rect.left
      lead.style.display = ''
      lead.style.left = Math.round(x1) + 'px'
      lead.style.top = Math.round(y) + 'px'
      lead.style.width = Math.round(Math.max(0, x2 - x1)) + 'px'
      lead.style.height = '1px'
    } else {
      lead.style.display = 'none'
    }
  }

  /** 渲染气泡内容（只读态 / 编辑态） */
  const renderNotePop = (ann, pageEl, rect, editing) => {
    const pop = document.createElement('div')
    pop.className = 'bk-note-pop'
    pop.dataset.id = ann.id
    pop.style.setProperty('--pop-color', ann.color || '#ffd666')

    const quote = String(ann.quote || '')
    const text = String(ann.note || '')
    pop.innerHTML = `
      <div class="bk-note-pop-head">
        <i class="fas fa-grip-vertical bk-note-pop-grip" aria-hidden="true"></i>
        <span class="bk-note-pop-page">P${ann.page}</span>
        <span class="bk-note-pop-sp"></span>
        <button type="button" data-pop="edit" title="${editing ? '完成' : '编辑批注'}">
          <i class="fas ${editing ? 'fa-check' : 'fa-pen'}"></i>
        </button>
        <button type="button" data-pop="locate" title="在右侧列表中定位"><i class="fas fa-list"></i></button>
        <button type="button" data-pop="close" title="关闭"><i class="fas fa-xmark"></i></button>
      </div>
      ${isRegionAnn(ann)
        ? regionPopFigure(ann)
        : `<p class="bk-note-pop-quote">${esc(quote)}\u200b</p>`}
      ${editing
        ? `<textarea class="bk-note-pop-body" placeholder="写下你的批注…（Ctrl+Enter 保存，Esc 取消）">${esc(text)}</textarea>`
        : `<div class="bk-note-pop-text${text.trim() ? '' : ' is-empty'}">${text.trim() ? esc(text) : '还没有批注内容，点右上角笔形图标开始写'}</div>`}
      <div class="bk-note-pop-foot">
        <button type="button" data-pop="delete" title="删除这条标注">删除</button>
        <span class="bk-note-pop-sp"></span>
        ${editing ? '<button type="button" class="is-primary" data-pop="save">保存</button>' : ''}
      </div>`

    pageEl.appendChild(pop)
    // 拖过的气泡记住上次位置；没拖过才自动排版到空白处
    const saved = ann.pos
    const at = saved
      ? placeNotePopAt(pop, pageEl, saved)
      : placeNotePop(pop, pageEl, rect)
    drawLead(pageEl, rect, at)
    wireDrag(pop)

    // 图区标注：先出门气泡（不被渲染拖慢），缩略图到了再填进去
    if (isRegionAnn(ann)) fillPopThumb(pop)

    if (editing) {
      const area = qs(pop, '.bk-note-pop-body')
      if (area) {
        area.focus()
        // 光标放末尾，方便接着往下写
        area.setSelectionRange(area.value.length, area.value.length)
      }
    }
    return pop
  }

  /**
   * 打开某条标注的气泡。
   *
   * 关键：气泡能不能出现，只取决于「那条高亮在哪」。
   * 页面没渲染时整页 PDF 重绘要几百毫秒，但高亮的位置其实可以用
   * 锚点引擎在文本层之外先算出来 —— 所以这里绝不为气泡去 await 整页渲染，
   * 而是先把气泡画出来，页面渲染好之后再自动校正一次位置。
   */
  const openNotePop = async (annId, opts = {}) => {
    const ann = state.annotations.find(a => a.id === annId)
    if (!ann) return
    closeNotePop()
    const pageEl = pageNode(ann.page)
    if (!pageEl) return

    const render = () => {
      // 同一 id 的气泡已经在了就别重建，省掉一次 DOM 抖动
      const existing = qs(pageEl, '.bk-note-pop')
      if (existing && existing.dataset.id === ann.id && !opts.force) return existing
      if (existing) closeNotePop()
      popId = ann.id
      popEditing = !!opts.editing
      state.popAnnotation = ann
      return renderNotePop(ann, pageEl, ann._box, popEditing)
    }

    let pop = null
    if (isRegionAnn(ann)) {
      // 图区标注的坐标存在 region 里，不依赖文本层，也就无需等渲染
      paintHighlights(ann.page)
      syncRegionBoxes(ann.page)
      if (ann._box) pop = render()
    } else if (ann._box) {
      pop = render()
    } else {
      // 没有包围盒：先用锚点算一次位置（不依赖页面已渲染）
      paintHighlights(ann.page)
      if (ann._box) {
        pop = render()
      } else if (!pageEl.querySelector('.textLayer')) {
        // 连文本层都没有：先渲染，这一步无法绕过（没有文字就没有坐标）
        toast('正在渲染这一页…', 'info')
        await ensurePage(ann.page)
        paintHighlights(ann.page)
        if (ann._box) pop = render()
      }
    }
    if (!pop) { toast('这一页的标注定位失败', 'warn'); return }

    pageEl.querySelectorAll(`.bk-hl[data-id="${ann.id}"]`).forEach(el => el.classList.add('is-selected'))

    // 气泡若落在视口外，轻轻地滚进来；已在视口内则不动，免得打断阅读节奏
    const rect = pop.getBoundingClientRect()
    const view = scroller().getBoundingClientRect()
    if (rect.top < view.top + 8) {
      scroller().scrollBy({ top: rect.top - view.top - 24, behavior: 'smooth' })
    } else if (rect.bottom > view.bottom - 8) {
      scroller().scrollBy({ top: rect.bottom - view.bottom + 24, behavior: 'smooth' })
    }

    // 联动右侧列表
    state.activeAnnotation = ann.id
    markActiveNote()
  }

  /** 保存气泡里编辑的批注文本 */
  const saveNotePop = async () => {
    const pop = popNode()
    if (!pop || !popId) return
    const area = qs(pop, '.bk-note-pop-body')
    const ann = state.annotations.find(a => a.id === popId)
    if (!area || !ann) return
    ann.note = area.value
    try {
      await store.saveAnnotation(ann)
    } catch (err) {
      toast('保存失败：' + (err && err.message ? err.message : '未知错误'), 'error')
      return
    }
    // 右侧卡片里也有同一个批注框，保持内容一致
    const card = document.querySelector(`.bk-ann[data-id="${ann.id}"] .bk-ann-note`)
    if (card && card.value !== ann.note) card.value = ann.note
    paintHighlights(ann.page)
    openNotePop(ann.id, { editing: false })
    toast('批注已保存')
  }

  /** 删除标注（气泡与侧栏共用同一条路径） */
  const deleteAnnotation = async id => {
    const ann = state.annotations.find(a => a.id === id)
    if (!ann) return
    await store.removeAnnotation(id)
    // 图区标注还挂着缩略图 blob，一起回收，否则 IndexedDB 里会越攒越多
    if (isRegionAnn(ann)) {
      releaseThumb(id)
      store.deleteBlob(thumbKey(id)).catch(() => {})
    }
    state.annotations = state.annotations.filter(a => a.id !== id)
    if (popId === id) closeNotePop()
    repaintAll()
    renderAnnotationList()
  }


  /** 气泡相关的事件：按钮、快捷键、点高亮打开 */
  const wireNotePop = () => {
    const box = scroller()
    if (!box) return

    on(box, 'click', async e => {
      const mark = e.target.closest('.bk-hl')
      if (mark) {
        e.preventDefault()
        e.stopPropagation()
        openNotePop(mark.dataset.id)
        return
      }
      const btn = e.target.closest('[data-pop]')
      if (!btn) {
        // 点到页面空白处收起气泡
        if (!e.target.closest('.bk-note-pop') && e.target.closest('.bk-page')) closeNotePop()
        return
      }
      const pop = btn.closest('.bk-note-pop')
      if (!pop) return
      const id = pop.dataset.id
      const action = btn.dataset.pop
      if (action === 'close') { closeNotePop(); return }
      if (action === 'edit') {
        if (popEditing) { await saveNotePop(); return }
        openNotePop(id, { editing: true })
        return
      }
      if (action === 'save') { await saveNotePop(); return }
      if (action === 'zoom') {
        // 复用已有的超清预览浮层：同一块矩形、同一条渲染路径
        const ann = state.annotations.find(a => a.id === id)
        if (ann && ann.region) showRegion(ann.page, ann.region)
        return
      }
      if (action === 'delete') {
        if (!window.confirm('删除这条标注？')) return
        await deleteAnnotation(id)
        return
      }
      if (action === 'locate') {
        // 切到「标注」页，把对应卡片滚进视野并闪一下
        switchTab('ann')
        window.setTimeout(() => {
          const card = document.querySelector(`.bk-ann[data-id="${id}"]`)
          if (!card) return
          card.scrollIntoView({ block: 'center', behavior: 'smooth' })
          card.classList.add('is-flash')
          window.setTimeout(() => card.classList.remove('is-flash'), 1400)
        }, 60)
      }
    })

    // 编辑态快捷键：Ctrl/Cmd+Enter 保存，Esc 取消
    on(box, 'keydown', e => {
      const area = e.target.closest && e.target.closest('.bk-note-pop-body')
      if (!area) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); saveNotePop() }
      else if (e.key === 'Escape') { e.preventDefault(); closeNotePop() }
    })

    // 编辑时别让选区的 mousedown 逻辑把气泡关掉
    on(box, 'mousedown', e => {
      if (e.target.closest('.bk-note-pop')) e.stopPropagation()
    }, true)
  }

  /**
   * 取某页的骨架节点。
   * 骨架页只有 data-page，没有 id（早期代码用 id="bk-pN" 查找，找不到时静默失败，
   * 造成定位、高亮、翻页、释放全部失灵），所以统一从 data-page 查。
   */
  const pageNode = n => qs(scroller(), `.bk-page[data-page="${Number(n)}"]`)

  /**
   * 刷新书架统计（阅读时长 / 进度变化后）。
   * 早期版本这里调用的是一个从未定义的 tabTick()，导致 IntersectionObserver 回调直接抛
   * ReferenceError：同一批 entry 里后续页面不再处理，saveLastPage/recordProgress 也走不到。
   * 书架没打开时不必重算（library.refresh 会重排列表，有成本）。
   */
  const statsTick = () => {
    const lib = window.BOOKS_LIBRARY
    if (!lib || typeof lib.refresh !== 'function') return
    if (typeof lib.isOpen === 'function' && !lib.isOpen()) return
    Promise.resolve(lib.refresh()).catch(() => {})
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
            if (changed) { statsTick(); saveLastPage() }
          } else {
  // 兜底：PDF.js 在文本层就绪后才有文字，缩放后 old 页可能比例偏差
            const partial = pageNode(n)
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
        // 先取上一次滚动时间，再记录本次（顺序反了会让下面的「滚动变慢」判断恒为 false）
        const sinceScroll = performance.now() - (state.lastScrollAt || 0)
        state.lastScrollAt = performance.now()
        releaseFarPages()
        // layout-shift 在正常的翻页 / 首次绘制时也会触发，不能无条件降画质，
        // 否则用户每翻一页画质就掉一档。只有「Shift 分数较大 + 距上次滚动已停顿」才降级。
        if (last.value > 0.25 && sinceScroll > 900) degradeQuality('滚动变慢')
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
          .then(() => statsTick())
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

  /** 从当前选区创建一个标注（type 为 0 表示只建高亮，见 createAnnotationWithNote） */
  const createAnnotation = async (type, color, editing = false) => {
    const info = state.selectedAnchor
    if (!info || !state.doc) { toast('请先划选一段文字再标注', 'warn'); return }
    const record = await store.saveAnnotation({
      docId: state.doc.id,
      page: info.page,
      type: type || 'highlight',
      color: color || '#ffd666',
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
    // 标完立刻在原文旁边长出气泡，顺手就能写批注（不必再跑到右侧去找）
    openNotePop(record.id, { editing })
  }

  /** 划词后直接写批注 */
  const createAnnotationWithNote = async () => {
    // 以前用 window.prompt 弹系统输入框，会打断阅读、且无法边看原文边写；
    // 现在统一走「先建标注 → 在旁边弹出气泡并进入编辑态」。
    await createAnnotation(0, '#7ee0c0', true)
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

  const ANNOT_LABEL = { highlight: '高亮', underline: '划线', strike: '删除线', region: '图片' }

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
        <p class="bk-ann-quote${isRegionAnn(a) ? ' is-region' : ''}">${isRegionAnn(a)
          ? `[图片] ${Math.round((a.region && a.region.width) || 0)}×${Math.round((a.region && a.region.height) || 0)}pt`
          : esc(String(a.quote).slice(0, 400))}</p>
              <textarea class="bk-ann-note" rows="2" placeholder="补充说明…">${esc(a.note || '')}</textarea>
      </article>`).join('')
  }

  const markActiveNote = () => {
    document.querySelectorAll('.bk-ann').forEach(node => {
      // 有具体选中的标注时，只点亮那一条；否则退化为「点亮当前页的全部标注」
      const active = state.activeAnnotation
        ? node.dataset.id === state.activeAnnotation
        : Number(node.dataset.page) === state.activePage
      node.classList.toggle('is-active', active)
    })
  }

  /* ---------------- 侧栏：随手笔记（渲染与编辑交给 notes.js） ---------------- */

  const renderNotes = () => {
    if (window.BOOKS_NOTES && typeof window.BOOKS_NOTES.refresh === 'function') {
      window.BOOKS_NOTES.refresh().catch(() => {})
    } else {
      const badge = cache('bk-note-count')
      if (badge) badge.textContent = ''
    }
  }

  const addNote = (preset = {}) => {
    if (!state.doc) { toast('请先打开一篇文献', 'warn'); return }
    switchTab('notes')
    if (window.BOOKS_NOTES && typeof window.BOOKS_NOTES.create === 'function') {
      window.BOOKS_NOTES.create({
        title: preset.title || '',
        text: preset.text || '',
        page: preset.page || state.activePage
      })
    }
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
      if (state.view !== 'reader') showReader()
      const shelf = lib()
      if (shelf && typeof shelf.markCurrent === 'function') shelf.markCurrent(record.id)
      if (window.BOOKS_NOTES && typeof window.BOOKS_NOTES.setDoc === 'function') {
        await window.BOOKS_NOTES.setDoc(record)
      }
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
        const node = pageNode(page)
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

  /* ---------------- 视图路由：书架 ⇄ 阅读 ---------------- */

  const lib = () => (window.BOOKS_LIBRARY && typeof window.BOOKS_LIBRARY.show === 'function')
    ? window.BOOKS_LIBRARY
    : null

  const syncViewNav = () => {
    const shelf = state.view === 'shelf'
    const a = cache('bk-view-shelf')
    const b = cache('bk-view-reader')
    if (a) {
      a.classList.toggle('is-on', shelf)
      a.setAttribute('aria-selected', shelf ? 'true' : 'false')
    }
    if (b) {
      b.classList.toggle('is-on', !shelf)
      b.setAttribute('aria-selected', shelf ? 'false' : 'true')
    }
  }

  /** 切到书架：文献库抽屉没有必要再开着 */
  const showShelf = async () => {
    const library = lib()
    if (!library) { toast('书架还没准备好', 'warn'); return }
    state.view = 'shelf'
    closeLibrary()
    closePanels()
    closeRegion()
    setRegionMode(false)
    syncViewNav()
    await library.show()
    if (state.doc && typeof library.markCurrent === 'function') library.markCurrent(state.doc.id)
  }

  /** 回到阅读视图（没有文档时展示空态） */
  const showReader = () => {
    const library = lib()
    state.view = 'reader'
    if (library) library.hide()
    syncViewNav()
    if (!state.pdf) renderRecent()
  }

  const toggleView = () => {
    if (state.view === 'shelf') showReader()
    else showShelf()
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
    syncZoomLabel()
  }

  /**
   * 记录当前阅读锚点：哪一页、位于该页高度的百分之几。
   *
   * 必须记「比例」而不只是页码：用户常常读到第 5 页的中间，
   * 只记页码再按「页顶对齐」回去，就会把阅读位置生生拽到页首。
   */
  const readAnchor = () => {
    const box = scroller()
    const page = state.activePage
    if (!box) return { page, ratio: 0 }
    const node = pageNode(page)
    if (!node || !node.offsetHeight) return { page, ratio: 0 }
    return {
      page,
      ratio: Math.min(1, Math.max(0, (box.scrollTop - node.offsetTop) / node.offsetHeight))
    }
  }

  /**
   * 按锚点还原滚动位置。
   * behavior 必须是 'auto'：重排本身已经花了上百毫秒，再叠一次 1 秒平滑滚动，
   * 用户看到的就是「先闪回页首、再慢慢爬回来」，也就是所谓的上下跳动。
   */
  const restoreAnchor = anchor => {
    const box = scroller()
    if (!box || !anchor) return
    const node = pageNode(anchor.page)
    if (!node) return
    // CSS 上 .bk-scroller 有 scroll-behavior: smooth，会覆盖 scrollTo 的 behavior:'auto'，
    // 让「还原」变成一段 1 秒的动画（视觉上就是页面自己乱跳）。这里临时压掉它再还原。
    const prev = box.style.scrollBehavior
    box.style.scrollBehavior = 'auto'
    box.scrollTop = node.offsetTop + node.offsetHeight * anchor.ratio
    box.style.scrollBehavior = prev
  }

  const scrollToPage = n => {
    const target = Math.min(Math.max(1, n), state.pageCount || 1)
    state.activePage = target
    const node = pageNode(target)
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
    const cur = pageNode(state.activePage)
    const nxt = pageNode(next)
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
    const container = pageNode(n)
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
    // fit=width 时 state.scale 是「上次」的倍率，不能直接在上面加减；
    // 先换算成当前实际倍率，用户看到的百分比才是他以为的那一档。
    const current = state.pdf ? computeScale() : state.scale
    const next = Math.min(4, Math.max(0.25, current + delta))
    state.fit = 'custom'
    state.fitMode = 'custom'
    state.scale = next
    rerenderPages()
  }
  const setFit = mode => {
    state.fit = mode
    state.fitMode = mode
    rerenderPages()
  }

  let rerenderTimer = null
  /**
   * 重排页面（缩放 / 适宽 / 窗口尺寸变化都走这里）。
   *
   * 三个要点：
   * 1) 防抖收敛：连点 5 次放大只重排一次，而不是排队 5 轮「清空+重建」。
   * 2) 锚点在重排「之前」读取，之后立刻（非平滑）还原，避免跳回页首再爬回来。
   * 3) 旧渲染任务必须真正 cancel，否则旧尺寸的位图还会往新 DOM 上贴。
   */
  const rerenderPages = () => {
    if (!state.pdf) return
    clearTimeout(rerenderTimer)
    rerenderTimer = setTimeout(async () => {
      // 锚点必须在 DOM 被重建前读取
      const anchor = readAnchor()
      // 气泡用的是页面内坐标，骨架重建后必然对不上，先收起（重排完不再乱弹）
      closeNotePop()
      try {
        setBusy(true, '重排页面…')
        state.pageTasks.forEach(promise => promise.catch(() => {}))
        state.pageTasks.forEach((_, n) => {
          const old = pageNode(n)
          if (!old) return
          old.dataset.rendered = 'cancel'
          if (old.__bkTask && old.__bkTask.cancel) {
            try { old.__bkTask.cancel() } catch (_) { /* 已结束 */ }
          }
          old.__bkTask = null
        })
        await layoutPages()
        // 骨架尺寸已就绪，同步还原：不加平滑动画，否则会被看成页面自己乱跳
        restoreAnchor(anchor)
        // 还原后再补一次可视区渲染，保证落点处是清晰位图而不是空白占位
        renderVisiblePages()
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
    const panel = cache('bk-outline-panel')
    if (!panel || panel.dataset.auto) return
    // 没有书签的文献不自动展开：展开的只是一个空面板，还会挡住工具栏上的翻页按钮
    if (!state.outline || !state.outline.length) return
    panel.dataset.auto = '1'
    panel.classList.add('is-on')
    panel.setAttribute('aria-hidden', 'false')
    const btn = cache('bk-panel-outline')
    if (btn) btn.setAttribute('aria-pressed', 'true')
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
      cache('bk-outline-panel').classList.remove('is-on')
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
    const panel = cache('bk-search-panel')
    if (panel && !panel.classList.contains('is-on')) {
      panel.classList.add('is-on')
      const btn = cache('bk-panel-search')
      if (btn) btn.setAttribute('aria-pressed', 'true')
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
        cache('bk-search-panel').classList.remove('is-on')
        cache('bk-panel-search').setAttribute('aria-pressed', 'false')
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
    syncZoomLabel()
  }

  /** 让 j/k 按屏幕一屏地滚，而不是整页硬跳 */
  const screenScroll = dir => {
    const box = scroller()
    if (!box) return
    box.scrollBy({ top: dir * Math.round(box.clientHeight * 0.86), behavior: 'smooth' })
  }

  const closePanels = () => {
    hideMenu()
    const off = (id, btnId) => {
      const node = cache(id)
      if (node) node.classList.remove('is-on')
      const btn = btnId ? cache(btnId) : null
      if (btn) btn.setAttribute('aria-pressed', 'false')
    }
    off('bk-library')
    off('bk-helpbox')
    off('bk-outline-panel', 'bk-panel-outline')
    off('bk-search-panel', 'bk-panel-search')
    off('bk-more-panel')
  }

  const wireKeys = () => {
    on(document, 'keydown', e => {
      if (e.defaultPrevented) return
      const meta = e.ctrlKey || e.metaKey

      if (meta && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault()
        const panel = cache('bk-search-panel')
        const btn = cache('bk-panel-search')
        if (panel) panel.classList.add('is-on')
        if (btn) btn.setAttribute('aria-pressed', 'true')
        const input = cache('bk-search-input')
        if (input) { input.focus(); input.select() }
        return
      }
      if (meta && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault()
        showShelf()
        return
      }
      // 不在输入框里时：L 切换书架，/ 打开全文搜索
      if (!isTyping(e.target) && !meta) {
        if (e.key === 'l' || e.key === 'L') { e.preventDefault(); toggleView(); return }
        if (e.key === '/' && state.view === 'reader') {
          e.preventDefault()
          const panel = cache('bk-search-panel')
          if (panel) panel.classList.add('is-on')
          const btn = cache('bk-panel-search')
          if (btn) btn.setAttribute('aria-pressed', 'true')
          cache('bk-outline-panel').classList.remove('is-on')
          const input = cache('bk-search-input')
          if (input) { input.focus(); input.select() }
          return
        }
      }
      if (e.key === 'Escape') {
        // 预览浮层优先关（它是模式化的最上层）
        const region = cache('bk-region')
        if (region && region.classList.contains('is-on')) { closeRegion(); return }
        if (state.regionMode) { setRegionMode(false); return }
        // 书架视图下，Esc 回到阅读
        if (state.view === 'shelf') { showReader(); return }
        closePanels()
        return
      }
    // 正在写笔记 / 批注 / 输入地址时不抢按键；书架视图里 j/k 等不生效
      if (state.view !== 'reader' || isTyping(e.target) || !state.pdf) return
    // 搜索面板开着时，上下键用来在命中之间走
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && state.hits.length &&
          cache('bk-search-panel').classList.contains('is-on')) {
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
    if (box) box.classList.toggle('is-region', state.regionMode || state.annotRegionMode)
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

  /** 进入 / 退出「图区批注」框选模式（一次性：拖完自动退出） */
  const setAnnotRegionMode = flag => {
    state.annotRegionMode = !!flag
    const box = scroller()
    if (box) box.classList.toggle('is-region', state.annotRegionMode || state.regionMode)
    if (state.annotRegionMode) {
      closePanels()
      const btn = cache('bk-annot-region')
      if (btn) {
        btn.classList.add('is-on')
        btn.setAttribute('aria-pressed', 'true')
      }
      toast('框选图片区域：拖一个矩形盖住图，松开即建批注', 'ok', 3600)
    } else {
      const btn = cache('bk-annot-region')
      if (btn) {
        btn.classList.remove('is-on')
        btn.setAttribute('aria-pressed', 'false')
      }
      const marquee = cache('bk-marquee')
      if (marquee) marquee.classList.remove('is-on')
    }
  }

  const storeRegionScale = () => {
    store.saveSetting('regionScale', state.regionScale).catch(() => {})
  }


  /* ============================================================
   * 图区批注（type: 'region'）
   * ------------------------------------------------------------
   * PDF 里的插图没有文字，锚点引擎（quote/prefix/suffix）无从下手，
   * 所以这类标注不存文字，而是存一块「页面基础坐标矩形」：
   *   region: { x, y, width, height }   // scale=1 的点坐标，与缩放无关
   *
   * 为什么不用像素：页宽 = viewport(1).width × state.scale，
   * 用户一按 Ctrl+滚轮，像素值就全废了。点坐标才是不变量。
   * ============================================================ */

  const REGION_LABEL = '图片'

  const isRegionAnn = a => !!a && a.type === 'region'

  /** 屏幕坐标的框 → 页面基础坐标（带边界钳制，防止拖出页面） */
  const regionRectFromDrag = (node, x0, y0, x1, y1, minSide = 8) => {
    const a = clientToPagePoint(node, x0, y0)
    const b = clientToPagePoint(node, x1, y1)
    const width = Math.abs(b.x - a.x)
    const height = Math.abs(b.y - a.y)
    if (width < minSide || height < minSide) return null
    const wrap = node.querySelector('.bk-canvas-wrap')
    const maxW = (wrap && wrap.offsetWidth) || node.offsetWidth
    const maxH = (wrap && wrap.offsetHeight) || node.offsetHeight
    const k = state.scale || 1
    const x = Math.min(Math.max(0, Math.min(a.x, b.x)), Math.max(0, maxW / k))
    const y = Math.min(Math.max(0, Math.min(a.y, b.y)), Math.max(0, maxH / k))
    return {
      x,
      y,
      // 钳到页面内，避免存下超界的框（换页/缩放后会画到版心外）
      width: Math.min(width, Math.max(0, maxW / k - x)),
      height: Math.min(height, Math.max(0, maxH / k - y))
    }
  }

  /** 让所有同页的图区框重新按当前缩放定位（不重建 DOM） */
  const syncRegionBoxes = pageNo => {
    const pageEl = pageNode(pageNo)
    if (!pageEl) return
    qsa(pageEl, '.bk-hl[data-type="region"]').forEach(box => {
      const ann = state.annotations.find(a => a.id === box.dataset.id)
      if (!ann || !ann.region) return
      const r = ann.region
      box.style.left = (r.x * state.scale) + 'px'
      box.style.top = (r.y * state.scale) + 'px'
      box.style.width = Math.max(0, r.width * state.scale) + 'px'
      box.style.height = Math.max(0, r.height * state.scale) + 'px'
      ann._box = {
        left: r.x * state.scale,
        top: r.y * state.scale,
        right: (r.x + r.width) * state.scale,
        bottom: (r.y + r.height) * state.scale,
        page: Number(pageNo)
      }
    })
  }

  /**
   * 从拖出的框建一条图区标注。
   * 顺手把这一块存成缩略图（blob），这样气泡和侧栏里能直接看到
   * 被框的是哪张图 —— 否则只有「一个框」没法回忆内容。
   */
  const createRegionAnnotation = async (pageNo, rect, opts = {}) => {
    if (!state.doc) { toast('请先打开一篇文献', 'warn'); return null }
    if (!rect) return null
    const record = await store.saveAnnotation({
      docId: state.doc.id,
      page: Number(pageNo),
      type: 'region',
      color: opts.color || '#7aa7ff',
      quote: '',
      note: '',
      region: {
        x: +rect.x.toFixed(2),
        y: +rect.y.toFixed(2),
        width: +rect.width.toFixed(2),
        height: +rect.height.toFixed(2)
      }
    })
    state.annotations.push(record)
    state.annotations.sort((a, b) => a.page - b.page || a.createdAt - b.createdAt)
    paintHighlights(record.page)
    renderAnnotationList()

    // 缩略图是「锦上添花」：失败也绝不能影响标注本身
    makeRegionThumb(record).catch(() => {})

    openNotePop(record.id, { editing: !!opts.editing })
    return record
  }

  /** 渲染一块低倍率位图存进 blobs，供气泡 / 侧栏预览 */
  const makeRegionThumb = async record => {
    if (!state.pdf || !record.region) return
    const width = Math.max(1, record.region.width)
    const { canvas } = await pdfLib.renderRegion(state.pdf, record.page, record.region, {
      // 只要缩略图，不用追超清：约 420px 宽已足够在气泡里看清
      scale: Math.min(3, Math.max(1, 420 / width)),
      dpr: 1
    })
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.86))
    if (!blob) return
    await store.putBlob(thumbKey(record.id), blob)
    // 已经打开的气泡就地换图，不必让用户关掉重开
    refreshPopThumb(record)
  }

  const thumbKey = id => 'thumb-' + id

  /** 取（或懒加载）缩略图 objectURL；同一 id 的并发请求共用一个 Promise */
  const thumbUrls = {}
  const thumbTasks = {}
  const regionThumbUrl = id => {
    if (thumbUrls[id]) return Promise.resolve(thumbUrls[id])
    if (thumbTasks[id]) return thumbTasks[id]
    const key = thumbKey(id)
    thumbTasks[id] = store.getBlob(key).then(blob => {
      if (blob) thumbUrls[id] = URL.createObjectURL(blob)
      return thumbUrls[id] || null
    }).catch(() => null).then(url => {
      delete thumbTasks[id]
      return url
    })
    return thumbTasks[id]
  }

  const releaseThumb = id => {
    const url = thumbUrls[id]
    if (url) URL.revokeObjectURL(url)
    delete thumbUrls[id]
  }

  /** 气泡里那块预览的填充（异步补图，避免阻塞气泡弹出） */
  const fillPopThumb = async pop => {
    if (!pop) return
    const slot = pop.querySelector('.bk-note-pop-fig')
    if (!slot) return
    const url = await regionThumbUrl(pop.dataset.id)
    if (!url || !slot.isConnected) return
    slot.innerHTML = `<img src="${url}" alt="图区预览">`
    slot.classList.add('has-img')
  }

  const refreshPopThumb = ann => {
    const pop = popNode()
    if (pop && pop.dataset.id === ann.id) fillPopThumb(pop)
  }

  /** 气泡里图区标注的标题块 */
  const regionPopFigure = ann => {
    const r = ann.region || {}
    const size = `${Math.round(r.width || 0)}×${Math.round(r.height || 0)}pt`
    return `<div class="bk-note-pop-quote is-region">
      <div class="bk-note-pop-fig"><span class="bk-note-pop-fig-empty">
        <i class="fas fa-image"></i>${REGION_LABEL} · ${size}
      </span></div>
      <button type="button" class="bk-note-pop-zoom" data-pop="zoom"
              title="超清查看这块图区">
        <i class="fas fa-magnifying-glass-plus"></i>看原图
      </button>
    </div>`
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

      if (!state.regionMode && !state.annotRegionMode) return
      if (e.button !== 0) return
      const pageEl = pageOf(e.target)
      if (!pageEl) return
      e.preventDefault()
      // 拖框时不要顺便划词
      if (window.getSelection) window.getSelection().removeAllRanges()
      hideMenu()

      state.regionDrag = {
        page: Number(pageEl.dataset.page),
        node: pageEl,
        annot: !!state.annotRegionMode,
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
      if (drag.annot) {
        // 图区批注：同一道拖拽手势，落点是「建标注」而不是「超清放大」
        setAnnotRegionMode(false)
        const rect = regionRectFromDrag(drag.node, drag.x0, drag.y0, e.clientX, e.clientY, 12)
        if (rect) createRegionAnnotation(drag.page, rect, { editing: true })
        else toast('框太小了，请拖一个大一点的范围', 'warn', 2600)
        return
      }
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

    // 书架 ⇄ 阅读
    on(cache('bk-view-shelf'), 'click', () => { if (state.view !== 'shelf') showShelf() })
    on(cache('bk-view-reader'), 'click', () => { if (state.view !== 'reader') showReader() })

    // 「文献库」按钮直接进书架：它比抽屉更好找、也能管理
    on(cache('bk-library-toggle'), 'click', () => showShelf())
    on(cache('bk-library-close'), 'click', closeLibrary)

    // 空态里的「继续阅读」入口
    on(cache('bk-recent'), 'click', e => {
      const card = e.target.closest('.bk-recent-item')
      if (!card) return
      openFromLibrary(card.dataset.id)
    })

    // 目录 / 搜索 面板：按钮与浮层是两个元素，切换的是浮层
    on(cache('bk-panel-outline'), 'click', () => {
      const panel = cache('bk-outline-panel')
      const on_ = panel.classList.toggle('is-on')
      cache('bk-panel-outline').setAttribute('aria-pressed', on_ ? 'true' : 'false')
      panel.setAttribute('aria-hidden', on_ ? 'false' : 'true')
      cache('bk-search-panel').classList.remove('is-on')
      cache('bk-panel-search').setAttribute('aria-pressed', 'false')
      if (on_) renderOutline()
      cache('bk-more-panel').classList.remove('is-on')
    })
    on(cache('bk-panel-search'), 'click', () => {
      const panel = cache('bk-search-panel')
      const on_ = panel.classList.toggle('is-on')
      cache('bk-panel-search').setAttribute('aria-pressed', on_ ? 'true' : 'false')
      panel.setAttribute('aria-hidden', on_ ? 'false' : 'true')
      cache('bk-outline-panel').classList.remove('is-on')
      cache('bk-panel-outline').setAttribute('aria-pressed', 'false')
      if (on_) {
        const input = cache('bk-search-input')
        if (input) input.focus()
        else renderSearchResults()
      }
      cache('bk-more-panel').classList.remove('is-on')
    })

    // 浮层面板的关闭按钮（目录 / 搜索）
    document.querySelectorAll('.bk-float-close').forEach(btn => {
      on(btn, 'click', () => {
        const box = cache(btn.dataset.close)
        if (box) {
          box.classList.remove('is-on')
          box.setAttribute('aria-hidden', 'true')
        }
        const pair = { 'bk-outline-panel': 'bk-panel-outline', 'bk-search-panel': 'bk-panel-search' }
        const trigger = cache(pair[btn.dataset.close])
        if (trigger) trigger.setAttribute('aria-pressed', 'false')
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
    on(cache('bk-toolbar-more'), 'click', () => cache('bk-more-panel').classList.toggle('is-on'))

    // 图区预览：切换「框选放大」模式
    on(cache('bk-region-toggle'), 'click', () => {
      if (!state.pdf) { toast('请先打开一篇文献', 'warn'); return }
      // 两个模式都是「拖一个框」，同时开着会互相抢手势，先进先出
      if (state.annotRegionMode) setAnnotRegionMode(false)
      setRegionMode(!state.regionMode)
    })

    // 框选图片写批注：与上面共用同一道拖拽手势，只是落点不同
    const startAnnotRegion = () => {
      if (!state.pdf) { toast('请先打开一篇文献', 'warn'); return }
      if (state.regionMode) setRegionMode(false)
      setAnnotRegionMode(!state.annotRegionMode)
      if (state.annotRegionMode) switchTab('ann')
    }
    on(cache('bk-annot-region'), 'click', startAnnotRegion)
    on(cache('bk-ann-region'), 'click', startAnnotRegion)
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
      for (const a of state.annotations) {
        await store.removeAnnotation(a.id)
        // 图区标注的缩略图 blob 也要一并回收
        if (isRegionAnn(a)) {
          releaseThumb(a.id)
          store.deleteBlob(thumbKey(a.id)).catch(() => {})
        }
      }
      state.annotations = []
      repaintAll()
      renderAnnotationList()
      toast('标注已清空')
    })

    on(cache('bk-cfg-save'), 'click', saveSettings)
    on(cache('bk-cfg-wipe'), 'click', wipeAll)

    // 笔记列表的输入/删除由 notes.js 统一接管（见 BOOKS_NOTES.init）

    // 标注列表：跳页 / 改批注 / 删除
    const annList = cache('bk-ann-list')
    on(annList, 'click', async e => {
      const card = e.target.closest('.bk-ann')
      if (!card) return
      if (e.target.closest('.bk-ann-del')) {
        if (!window.confirm('删除这条标注？')) return
        await deleteAnnotation(card.dataset.id)
        return
      }
      if (e.target.closest('.bk-ann-quote') || e.target.closest('.bk-ann-page') || e.target.closest('.bk-ann-head')) {
        // 点卡片 → 跳到该页并就地打开气泡（气泡与这里的批注框是同一份数据）
        if (!e.target.closest('.bk-ann-del')) {
          scrollToPage(Number(card.dataset.page))
          openNotePop(card.dataset.id)
        }
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

  /* ---------------- 对外接口：给 library.js / notes.js 用 ---------------- */

  const noteSaved = record => {
    if (!record || !state.doc || record.docId !== state.doc.id) return
    if (!state.notes.some(n => n.id === record.id)) state.notes.push(record)
    else state.notes = state.notes.map(n => (n.id === record.id ? record : n))
    renderNotes()
  }

  /** 跳转到某页（可选：定位到某条标注并闪烁） */
  const jump = (page, annId) => {
    if (state.view !== 'reader') showReader()
    const n = Number(page) || 0
    if (!state.pdf || !n) return
    scrollToPage(n)
    if (!annId) return
    const target = state.annotations.find(a => a.id === annId)
    if (!target) return
    state.activeAnnotation = annId
    markActiveNote()
    // 跳过去就顺手把气泡打开：用户点「定位」的意图就是要看这条批注
    window.setTimeout(() => {
      if (state.activePage === Number(target.page)) openNotePop(annId)
    }, 420)
    window.setTimeout(() => {
      const node = document.querySelector(`.bk-ann[data-id="${annId}"], .bk-ann[data-ann="${annId}"]`)
      if (node) {
        node.classList.add('is-flash')
        window.setTimeout(() => node.classList.remove('is-flash'), 1400)
      }
    }, 320)
    renderAnnotationList()
  }

  window.BOOKS_READER = Object.freeze({
    toast: (msg, type) => toast(msg, type || 'ok'),
    jump,
    activePage: () => state.activePage,
    /**
     * 供测试与导出复用：把一组矩形按「同行相邻」合并成连续块。
     * 纯函数，不依赖 DOM，方便单测。
     */
    mergeRects,
    /** 打开某条标注的随文气泡（供测试 / 外部模块调用） */
    openNotePop,
    docId: () => (state.doc ? state.doc.id : null),
    /** 外部新增标注后同步进阅读器（store 写入 → 内存 → 重绘） */
    addAnnotation: record => {
      if (!record) return
      state.annotations.push(record)
      state.annotations.sort((a, b) => a.page - b.page || a.createdAt - b.createdAt)
      paintHighlights(record.page)
      renderAnnotationList()
      openNotePop(record.id)
    },
    onNoteSaved: noteSaved,
    open: id => openFromLibrary(id),
    /** 库里的数据变了（删除 / 打标签 / 阅读状态）：重算抽屉与空态 */
    notifyLibraryChange: () => {
      renderLibrary().catch(() => {})
      if (!state.pdf) renderRecent().catch(() => {})
      const shelf = lib()
      if (shelf && typeof shelf.refresh === 'function' && typeof shelf.isOpen === 'function' && shelf.isOpen()) {
        shelf.refresh().catch(() => {})
      }
    },
    showShelf,
    showReader,
    currentDoc: () => state.doc
  })

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
    wireNotePop()

    // 书架 / 笔记模块（各自负责自己的 DOM，失败不影响阅读）
    try {
      if (window.BOOKS_LIBRARY && typeof window.BOOKS_LIBRARY.init === 'function') {
        await window.BOOKS_LIBRARY.init()
      }
    } catch (_) { /* 书架不可用时仍可阅读 */ }
    try {
      if (window.BOOKS_NOTES && typeof window.BOOKS_NOTES.init === 'function') {
        await window.BOOKS_NOTES.init()
      }
    } catch (_) { /* 同上 */ }

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
    } else if (String(window.location.hash || '').replace('#', '') === 'shelf') {
      // /books/#shelf 直达书架
      showShelf()
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
