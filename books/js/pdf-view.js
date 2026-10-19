/* ============================================================
 *  /books/ 文献阅读工作台 —— PDF 渲染层
 *  基于 PDF.js 4.x（ESM，CDN 引入）：
 *    - 逐页渲染 canvas + TextLayer（可选中文字 → 才能划词高亮）
 *    - 每页独立容器，方便高亮层按页叠加
 *    - 缩放 / 滚动由上层控制
 * ============================================================ */
(() => {
  'use strict'

  const PDFJS_BASE = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38'
  const workerSrc = `${PDFJS_BASE}/build/pdf.worker.mjs`

  let libPromise = null
  /** 动态 import PDF.js（只加载一次） */
  const loadLib = () => {
    if (libPromise) return libPromise
    libPromise = import(/* @vite-ignore */ `${PDFJS_BASE}/build/pdf.mjs`)
      .then(lib => {
        lib.GlobalWorkerOptions.workerSrc = workerSrc
        return lib
      })
      .catch(err => {
        libPromise = null
        throw new Error('PDF.js 加载失败，请检查网络或 CDN 可用性：' + (err && err.message))
      })
    return libPromise
  }

  /** CSS 里的 --scale-factor 是 TextLayer 定位文字的依据，必须同步 */
  const applyScaleFactor = (host, scale) => {
    host.style.setProperty('--scale-factor', String(scale))
  }

  /**
   * 打开一份 PDF。
   * @param {ArrayBuffer|{url:string}} source
   * @returns {Promise<{pdf:any, pageCount:number, outline:any[], meta:any}>}
   */
  const open = async source => {
    const lib = await loadLib()
    // standardFontDataUrl 必须显式给：很多期刊 PDF 用的是「未嵌入的标准 14 字体」，
    // 不提供这个地址时 PDF.js 只能拿系统字体兜底，度量（宽度/基线）会漂移，
    // 表现为文字重叠、位置错位。cMapUrl 同理，用于中日韩字符。
    const common = {
      cMapUrl: `${PDFJS_BASE}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${PDFJS_BASE}/standard_fonts/`,
      useSystemFonts: true
    }
    const task = lib.getDocument(
      source instanceof ArrayBuffer ? { ...common, data: source } : { ...common, url: source.url }
    )
    const pdf = await task.promise
    let meta = {}
    try { meta = (await pdf.getMetadata()).info || {} } catch (_) {}
    let outline = []
    try { outline = await pdf.getOutline() } catch (_) {}
    return { pdf, pageCount: pdf.numPages, outline, meta }
  }

  /** 按容器实际宽度选择设备像素比：只保证屏幕上清晰，避免超大画布占内存 */
  const pickDpr = (cssWidth, maxDpr = 2) => {
    const raw = Math.min(window.devicePixelRatio || 1, maxDpr)
    const cap = 4096 / Math.max(1, cssWidth)   // 单边像素上限（移动端 Safari 更保守）
    return Math.max(1, Math.min(raw, cap))
  }

  /**
   * 渲染一页到指定容器。
   * 结构：.bk-page > .bk-canvas-wrap > (canvas + .textLayer + .bk-hl-layer)
   * @param {any} pdf
   * @param {number} pageNo 1 起
   * @param {HTMLElement} container
   * @param {number} scale
   * @param {{dprCap?:number, withText?:boolean, onTask?:(task:any)=>void}} opts
   *        dprCap  设备像素比上限（虚拟化离屏渲染时可调低以省内存）
   *        withText 是否构建文本层（false 表示这页不参与划词，纯展示）
   *        onTask  把 PDF.js 的 RenderTask 交回上层，便于重排时真正 cancel
   */
  const renderPage = async (pdf, pageNo, container, scale, opts = {}) => {
    const { dprCap = 2, withText = true, onTask = null } = opts
    const lib = await loadLib()
    const page = await pdf.getPage(pageNo)
    const viewport = page.getViewport({ scale })

    container.dataset.page = String(pageNo)
    container.style.width = `${Math.floor(viewport.width)}px`
    container.style.height = `${Math.floor(viewport.height)}px`
    applyScaleFactor(container, viewport.scale)

    let wrap = container.querySelector('.bk-canvas-wrap')
    if (!wrap) {
      wrap = document.createElement('div')
      wrap.className = 'bk-canvas-wrap'
      container.appendChild(wrap)
    }

    // canvas：按设备像素比放大，避免高分屏模糊（dpr 由容器宽度反推，控制内存）
    const dpr = pickDpr(viewport.width, dprCap)
    let canvas = wrap.querySelector('canvas.bk-canvas')
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.className = 'bk-canvas'
      wrap.appendChild(canvas)
    }
    const ctx = canvas.getContext('2d', { alpha: false })
    canvas.width = Math.floor(viewport.width * dpr)
    canvas.height = Math.floor(viewport.height * dpr)
    canvas.style.width = `${Math.floor(viewport.width)}px`
    canvas.style.height = `${Math.floor(viewport.height)}px`

    const renderTask = page.render({
      canvasContext: ctx,
      viewport,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
    })
    // 交回上层：重排/离开时需要真正取消，否则旧页会继续占 CPU 与内存
    if (onTask) { try { onTask(renderTask) } catch (_) {} }
    await renderTask.promise

    // 不需要文本层的页面（虚拟化的远页）：清掉旧的，省 DOM 与内存
    let hlLayer = wrap.querySelector('.bk-hl-layer')
    if (!withText) {
      const stale = wrap.querySelector('.textLayer')
      if (stale) stale.remove()
      if (hlLayer) hlLayer.innerHTML = ''
      return { page, viewport, textLayer: null, hlLayer, canvas, dpr }
    }

    // 文本层：重建（缩放后旧节点的坐标已失效）
    let textLayer = wrap.querySelector('.textLayer')
    if (textLayer) textLayer.remove()
    textLayer = document.createElement('div')
    textLayer.className = 'textLayer'
    // --scale-factor 用来让 PDF.js 正确排布文字；同时供我们 CSS 使用
    textLayer.style.setProperty('--scale-factor', String(viewport.scale))
    wrap.appendChild(textLayer)

    const textContent = await page.getTextContent()
    const textLayerTask = new lib.TextLayer({
      textContentSource: textContent,
      container: textLayer,
      viewport
    })
    await textLayerTask.render()

    // 高亮层：与文本层同级、在其上方，专放 absolute 的色块
    if (!hlLayer) {
      hlLayer = document.createElement('div')
      hlLayer.className = 'bk-hl-layer'
      wrap.appendChild(hlLayer)
    }

    return { page, viewport, textLayer, hlLayer, canvas, dpr }
  }

  /** 释放某一页的位图，回收内存（虚拟化用；骨架与尺寸保留） */
  const releasePage = container => {
    const wrap = container && container.querySelector('.bk-canvas-wrap')
    if (!wrap) return
    const canvas = wrap.querySelector('canvas.bk-canvas')
    if (canvas) {
      canvas.width = 0
      canvas.height = 0
      canvas.remove()
    }
    const textLayer = wrap.querySelector('.textLayer')
    if (textLayer) textLayer.remove()
    const hlLayer = wrap.querySelector('.bk-hl-layer')
    if (hlLayer) hlLayer.innerHTML = ''
  }

  /** 取某页纯文本（供翻译 / 导出笔记用） */
  const pageText = async (pdf, pageNo) => {
    const page = await pdf.getPage(pageNo)
    const content = await page.getTextContent()
    // items 顺序即阅读顺序；hasEOL 表示换行
    let out = ''
    content.items.forEach(item => {
      out += item.str
      out += item.hasEOL ? '\n' : ' '
    })
    return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  }

  /** 取整篇纯文本（带 [P1] 页码标记，方便笔记定位） */
  const docText = async (pdf, { withPageMark = true, maxPages = 0 } = {}) => {
    const total = maxPages > 0 ? Math.min(maxPages, pdf.numPages) : pdf.numPages
    const parts = []
    for (let i = 1; i <= total; i += 1) {
      const t = await pageText(pdf, i)
      if (!t) continue
      parts.push(withPageMark ? `[P${i}]\n${t}` : t)
    }
    return parts.join('\n\n')
  }

  /* ============================================================
   *  超高分辨率局部放大（图区预览）
   *
   *  思路：不整页重绘，只把用户关心的那一小块 (rect) 用大倍率单独渲染。
   *  这样即使 8x / 12x，画布也只是一小块，内存可控（配合 maxPixels 预算）。
   *
   *  坐标系约定：所有 rect 都用「页面基础坐标」即 scale=1 时的点 (pt)，
   *  左上为原点。这样与 PDF.js 的 viewport 变换是线性可逆的，
   *  换页、换倍率、换 DPR 都不用重新标定。
   * ============================================================ */

  /** canvas 像素预算：超过就自动降倍率，避免 Safari / 移动端直接崩 */
  const MAX_REGION_PIXELS = 32 * 1024 * 1024   // 约 32MP
  const MAX_REGION_SIDE = 8192                 // 单边上限

  /**
   * 把「页面基础坐标 rect」按倍率渲染成一块高清 canvas。
   * @param {any} pdf
   * @param {number} pageNo
   * @param {{x:number,y:number,width:number,height:number}} rect scale=1 下的点坐标
   * @param {{scale?:number, dpr?:number, maxPixels?:number, onTask?:Function}} opts
   * @returns {Promise<{canvas:HTMLCanvasElement, scale:number, dpr:number, rect:object}>}
   */
  const renderRegion = async (pdf, pageNo, rect, opts = {}) => {
    const page = await pdf.getPage(pageNo)
    const base = page.getViewport({ scale: 1 })

    // 先夹到页面内，防止用户拖出边界时段错误
    const x = Math.max(0, Math.min(rect.x, base.width))
    const y = Math.max(0, Math.min(rect.y, base.height))
    const width = Math.max(1, Math.min(rect.width, base.width - x))
    const height = Math.max(1, Math.min(rect.height, base.height - y))

    const maxPixels = opts.maxPixels || MAX_REGION_PIXELS
    const wantScale = Math.max(1, Number(opts.scale) || 1)
    const wantDpr = Math.max(1, Number(opts.dpr) || 1)

    // 三重收敛：用户倍率、DPR、像素预算，取最小值
    let k = wantScale * wantDpr
    const byPixels = Math.sqrt(maxPixels / (width * height))
    const bySide = Math.min(MAX_REGION_SIDE / width, MAX_REGION_SIDE / height)
    k = Math.max(1, Math.min(k, byPixels, bySide))

    const viewport = page.getViewport({ scale: k, offsetX: -x * k, offsetY: -y * k })
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.floor(width * k))
    canvas.height = Math.max(1, Math.floor(height * k))
    canvas.style.width = Math.floor(width * k) + 'px'
    canvas.style.height = Math.floor(height * k) + 'px'
    const ctx = canvas.getContext('2d', { alpha: false })
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const task = page.render({ canvasContext: ctx, viewport })
    if (opts.onTask) { try { opts.onTask(task) } catch (_) {} }
    await task.promise
    return { canvas, scale: k / wantDpr, dpr: wantDpr, rect: { x, y, width, height } }
  }

  /* --- 矩阵小工具（PDF 的 6 元组 [a,b,c,d,e,f]） --- */
  const mulMatrix = (m, n) => [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5]
  ]

  /** 单位正方形 (0,0)-(1,1) 经矩阵变换后的轴对齐包围盒 */
  const unitSquareBBox = m => {
    const xs = []
    const ys = []
    ;[[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([u, v]) => {
      xs.push(m[0] * u + m[2] * v + m[4])
      ys.push(m[1] * u + m[3] * v + m[5])
    })
    const x = Math.min.apply(null, xs)
    const y = Math.min.apply(null, ys)
    return { x, y, w: Math.max.apply(null, xs) - x, h: Math.max.apply(null, ys) - y }
  }

  /** 小框面积被大框吞掉的比例（用于合并同一张图被切碎的多块） */
  const overlapRatio = (a, b) => {
    const x = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
    const y = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
    const inter = x * y
    const small = Math.min(a.width * a.height, b.width * b.height)
    return small > 0 ? inter / small : 0
  }

  const mergeBoxes = (boxes, tolerance = 0.6) => {
    const out = []
    boxes.slice()
      .sort((a, b) => b.width * b.height - a.width * a.height)
      .forEach(box => {
        const hit = out.find(o => overlapRatio(o, box) > tolerance)
        if (!hit) { out.push({ ...box }); return }
        const x = Math.min(hit.x, box.x)
        const y = Math.min(hit.y, box.y)
        const r = Math.max(hit.x + hit.width, box.x + box.width)
        const d = Math.max(hit.y + hit.height, box.y + box.height)
        hit.x = x; hit.y = y; hit.width = r - x; hit.height = d - y
      })
    return out
  }

  /**
   * 扫描一页里的位图对象，返回可点击的「图区」。
   * 用 PDF.js 的 getOperatorList()：不渲染像素，只读绘图指令，很快。
   *
   * 做法：遍历绘图指令维护 CTM 栈（q/Q/cm 是嵌套的），遇到 paintImage*
   * 就把单位方块经当前 CTM 变换，得到该图在页面上的包围盒。
   * PDF 坐标原点在左下，所以最后要翻转 y。
   *
   * @returns {Promise<Array<{x,y,width,height,kind,ratio}>>} 页面基础坐标
   */
  const scanImages = async (pdf, pageNo, opts = {}) => {
    const { minArea = 0.02, minSide = 36 } = opts   // 最小面积占比 / 最小边（点）
    let ops
    let page
    try {
      page = await pdf.getPage(pageNo)
      ops = await page.getOperatorList()
    } catch (_) {
      return []
    }
    const lib = await loadLib()
    const OPS = lib.OPS
    if (!OPS) return []
    const base = page.getViewport({ scale: 1 })
    const pageArea = base.width * base.height

    const boxes = []
    let ctm = [1, 0, 0, 1, 0, 0]
    const stack = []
    const fnArray = ops.fnArray
    const argsArray = ops.argsArray

    for (let i = 0; i < fnArray.length; i += 1) {
      const fn = fnArray[i]
      if (fn === OPS.save) {
        stack.push(ctm.slice())
      } else if (fn === OPS.restore) {
        ctm = stack.pop() || [1, 0, 0, 1, 0, 0]
      } else if (fn === OPS.transform) {
        ctm = mulMatrix(ctm, argsArray[i])
      } else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject ||
                 fn === OPS.paintImageMaskXObject) {
        const box = unitSquareBBox(ctm)
        if (box && box.w > 0 && box.h > 0) boxes.push(box)
      }
    }

    const norm = boxes
      .map(b => ({ x: b.x, y: base.height - b.y - b.h, width: b.w, height: b.h }))
      .map(b => {
        const x = Math.max(0, Math.min(b.x, base.width))
        const y = Math.max(0, Math.min(b.y, base.height))
        return {
          x,
          y,
          width: Math.max(0, Math.min(b.x + b.width, base.width) - x),
          height: Math.max(0, Math.min(b.y + b.height, base.height) - y)
        }
      })
      .filter(b => b.width >= minSide && b.height >= minSide &&
                   (b.width * b.height) / pageArea >= minArea)

    return mergeBoxes(norm).map(b => ({
      ...b,
      kind: 'image',
      ratio: +((b.width * b.height) / pageArea).toFixed(3)
    }))
  }

  window.BOOKS_PDF = Object.freeze({
    PDFJS_BASE, loadLib, open, renderPage, releasePage, pickDpr, pageText, docText,
    renderRegion, scanImages, MAX_REGION_PIXELS, MAX_REGION_SIDE
  })
})()
