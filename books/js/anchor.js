/* ============================================================
 *  /books/ 文献阅读工作台 —— 文本锚点引擎
 *
 *  为什么不用坐标：px 坐标随缩放、窗口宽度、设备 DPI 全都会失效。
 *  这里采用 W3C Web Annotation 的 text-quote 思路：
 *    锚点 = { quote, prefix, suffix, occurrence }
 *  重新定位时在整页文本里找 quote，用 prefix/suffix 消歧，
 *  再用 occurrence 处理完全重复的段落。缩放与换设备都不丢。
 * ============================================================ */
(() => {
  'use strict'

  const CTX = 48   // 前后缀各取多少个字符用于消歧

  /** 归一化：折叠空白，让跨行选区能稳定匹配 */
  const norm = text => String(text || '').replace(/\s+/g, ' ').trim()

  /** 把一页文本层里的文本节点按顺序拼成完整字符串，并记录每段偏移 */
  const flatten = root => {
    if (!root) return { text: '', nodes: [] }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: node => {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        // PDF.js 文本层末尾有个 .endOfContent 占位元素，不要算进去
        if (parent.classList && parent.classList.contains('endOfContent')) {
          return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT
      }
    })
    let text = ''
    const nodes = []
    let node
    while ((node = walker.nextNode())) {
      const raw = node.nodeValue || ''
      if (!raw) continue
      const start = text.length
      text += raw
      nodes.push({ node, start, end: text.length })
    }
    return { text, nodes }
  }

  /** 归一化文本 + 到原文下标的映射表，用于容错空白差异的匹配 */
  const normalizeMap = text => {
    let normalized = ''
    const map = []
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i]
      if (/\s/.test(ch)) {
        if (normalized && normalized[normalized.length - 1] !== ' ') {
          normalized += ' '
          map.push(i)
        }
      } else {
        normalized += ch
        map.push(i)
      }
    }
    return { normalized, map }
  }

  const commonPrefixLen = (a, b) => {
    let i = 0
    while (i < a.length && i < b.length && a[i] === b[i]) i += 1
    return i
  }
  const commonSuffixLen = (a, b) => {
    let i = 0
    while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i]) i += 1
    return i
  }

  /** 把 [start,end) 原文区间切成若干 Range（跨文本节点时要拆开） */
  const buildRanges = (nodes, start, end, root) => {
    const ranges = []
    let cursor = start
    while (cursor < end) {
      const entry = nodes.find(n => cursor >= n.start && cursor < n.end)
      if (!entry) break
      const segEnd = Math.min(end, entry.end)
      try {
        const range = document.createRange()
        range.setStart(entry.node, cursor - entry.start)
        range.setEnd(entry.node, segEnd - entry.start)
        if (!root || root.contains(range.startContainer)) ranges.push(range)
      } catch (_) { /* 节点已失效，跳过该段 */ }
      cursor = segEnd
    }
    return ranges
  }

  /**
   * 由一次 DOM Range 生成锚点。
   * @param {Range} range
   * @param {Element} root 该页文本层容器（.textLayer）
   */
  const fromRange = (range, root) => {
    const { text, nodes } = flatten(root)
    if (!text) return null

    // 把 Range 端点的 (container, offset) 换算成整页文本下标
    const offsetOf = (container, offset) => {
      if (container.nodeType === Node.TEXT_NODE) {
        const found = nodes.find(entry => entry.node === container)
        return found ? found.start + offset : -1
      }
      // 容器是元素：offset 表示"第 offset 个子节点之前"
      const child = container.childNodes[offset]
      if (!child) return text.length
      const inner = flatten(child)
      return inner.nodes.length ? inner.nodes[0].start : -1
    }

    const start = offsetOf(range.startContainer, range.startOffset)
    const end = offsetOf(range.endContainer, range.endOffset)
    if (start < 0 || end < 0 || end <= start) return null

    const quote = norm(text.slice(start, end))
    if (!quote || quote.length < 2) return null

    // occurrence：本页第几次出现同一个 quote（0 起），用于处理重复段落
    const raw = text.slice(start, end)
    let occurrence = 0
    let cursor = text.indexOf(raw)
    while (cursor >= 0 && cursor < start) {
      occurrence += 1
      cursor = text.indexOf(raw, cursor + 1)
    }

    return {
      quote,
      prefix: norm(text.slice(Math.max(0, start - CTX), start)),
      suffix: norm(text.slice(end, end + CTX)),
      occurrence
    }
  }

  /**
   * 在文本层里重新定位锚点，返回可用的 Range 列表。
   * 匹配从严格（quote + prefix/suffix 打分）到宽松（仅 quote 首次出现）。
   * @returns {Range[]}
   */
  const toRanges = (anchor, root) => {
    if (!anchor || !anchor.quote) return []
    const { text, nodes } = flatten(root)
    if (!text) return []

    const want = norm(anchor.quote)
    if (!want) return []

    const { normalized, map } = normalizeMap(text)

    const candidates = []
    let at = normalized.indexOf(want)
    while (at >= 0) {
      candidates.push(at)
      at = normalized.indexOf(want, at + 1)
    }
    if (!candidates.length) return []

    let pick = candidates[0]
    if (candidates.length > 1) {
      const wantOcc = Number.isInteger(anchor.occurrence) ? anchor.occurrence : -1
      let best = -Infinity
      candidates.forEach((idx, i) => {
        let score = 0
        if (anchor.prefix) {
          score += commonSuffixLen(normalized.slice(Math.max(0, idx - CTX), idx), norm(anchor.prefix))
        }
        if (anchor.suffix) {
          score += commonPrefixLen(
            normalized.slice(idx + want.length, idx + want.length + CTX),
            norm(anchor.suffix)
          )
        }
        if (i === wantOcc) score += 2   // 序号吻合给予加权
        if (score > best) { best = score; pick = idx }
      })
    } else {
      pick = candidates[0]
    }

    const startRaw = map[pick]
    const endRaw = map[pick + want.length - 1]
    if (startRaw == null || endRaw == null) return []

    return buildRanges(nodes, startRaw, endRaw + 1, root)
  }

  /**
   * 用 Range.getClientRects() 把 Range 转成相对文本层容器的矩形列表，
   * 可直接铺到 absolute 定位的高亮层上。
   */
  const rectsOf = (ranges, layer) => {
    if (!layer) return []
    const base = layer.getBoundingClientRect()
    const out = []
    ranges.forEach(range => {
      Array.from(range.getClientRects()).forEach(r => {
        if (r.width < 1 || r.height < 1) return
        out.push({
          left: r.left - base.left,
          top: r.top - base.top,
          width: r.width,
          height: r.height
        })
      })
    })
    return out
  }

  window.BOOKS_ANCHOR = Object.freeze({ norm, flatten, normalizeMap, fromRange, toRanges, rectsOf })
})()
