/* ============================================================
 *  /books/ 文献阅读工作台 —— 导出层
 *   1) 导出 Markdown（Hexo 可直接用的 front-matter，分类固定"知识进阶之路"）
 *   2) 导出长图（原生 Canvas 绘制，不依赖 html2canvas）
 *   3) 导出 JSON 备份（便于换设备迁移）
 * ============================================================ */
(() => {
  'use strict'

  const CATEGORY = '知识进阶之路'

  const pad = n => String(n).padStart(2, '0')
  const stamp = (d = new Date()) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

  /** YAML 值转义：含特殊字符时用双引号包裹 */
  const yamlValue = value => {
    const s = String(value == null ? '' : value)
    if (s === '') return "''"
    if (/^[\w\u4e00-\u9fa5][\w\u4e00-\u9fa5 \-./()（）,，、]*$/.test(s) && !/[:#]/.test(s)) return s
    return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
  }

  /** 文件名安全化 */
  const safeName = (text, fallback = 'reading-note') => {
    const s = String(text || '')
      .replace(/[\\/:*?"<>|\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return s.slice(0, 60) || fallback
  }

  const TYPE_LABEL = { highlight: '高亮', underline: '划线', strike: '删除线' }

  /** 触发浏览器下载 */
  const download = (content, filename, mime = 'text/markdown;charset=utf-8') => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  /**
   * 生成 Hexo 文章 Markdown 全文。
   * @param {object} doc 文献
   * @param {Array} annotations 标注
   * @param {Array} notes 笔记
   * @param {{withTranslation?:boolean, translation?:Array<{src:string,dst:string}>,
   *          includeFullText?:boolean, fullText?:string}} extra
   */
  const toMarkdown = (doc, annotations, notes, extra = {}) => {
    const {
      withTranslation = false,
      translation = [],
      includeFullText = false,
      fullText = ''
    } = extra

    const title = doc.title || '未命名文献'
    const tags = ['文献阅读', '阅读笔记']
    if (doc.year) tags.push(String(doc.year))

    const lines = []
    lines.push('---')
    lines.push(`title: ${yamlValue(title)}`)
    lines.push(`date: ${stamp()}`)
    lines.push(`categories: ${CATEGORY}`)
    lines.push(`tags: [${tags.map(yamlValue).join(', ')}]`)
    lines.push(`description: ${yamlValue(`《${title}》的阅读笔记与标注整理`)}`)
    if (doc.doi) lines.push(`doi: ${yamlValue(doc.doi)}`)
    if (doc.url) lines.push(`source: ${yamlValue(doc.url)}`)
    lines.push('---')
    lines.push('')
    lines.push(`# ${title}`)
    lines.push('')

    // 文献元信息
    const metaRows = []
    if (doc.authors) metaRows.push(`| 作者 | ${doc.authors} |`)
    if (doc.year) metaRows.push(`| 年份 | ${doc.year} |`)
    if (doc.source) metaRows.push(`| 来源 | ${doc.source} |`)
    if (doc.doi) metaRows.push(`| DOI | [${doc.doi}](https://doi.org/${doc.doi}) |`)
    if (doc.url && !doc.doi) metaRows.push(`| 链接 | [原文](${doc.url}) |`)
    if (doc.pageCount) metaRows.push(`| 页数 | ${doc.pageCount} |`)
    if (metaRows.length) {
      lines.push('## 文献信息')
      lines.push('')
      lines.push('| 项 | 内容 |')
      lines.push('| --- | --- |')
      lines.push(...metaRows)
      lines.push('')
    }

    // 内容摘要
    const summaries = notes.filter(n => n.kind === 'summary' && String(n.text || '').trim())
    if (summaries.length) {
      lines.push('## 内容摘要')
      lines.push('')
      summaries.forEach(n => { lines.push(String(n.text).trim()); lines.push('') })
    }

    // 标注与批注（按页分组）
    if (annotations.length) {
      lines.push('## 标注与批注')
      lines.push('')
      const byPage = new Map()
      annotations.forEach(a => {
        if (!byPage.has(a.page)) byPage.set(a.page, [])
        byPage.get(a.page).push(a)
      })
      Array.from(byPage.keys()).sort((a, b) => a - b).forEach(page => {
        lines.push(`### 第 ${page} 页`)
        lines.push('')
        byPage.get(page).forEach(a => {
          lines.push(`> ${String(a.quote || '').replace(/\n+/g, ' ').trim()}`)
          lines.push('')
          const noteText = String(a.note || '').trim()
          lines.push(`- **${TYPE_LABEL[a.type] || '标注'}**${noteText ? '：' + noteText : ''}`)
        })
        lines.push('')
      })
    }

    // 侧栏笔记
    const plainNotes = notes.filter(
      n => n.kind !== 'summary' && n.kind !== 'translation' && String(n.text || '').trim()
    )
    if (plainNotes.length) {
      lines.push('## 阅读笔记')
      lines.push('')
      plainNotes.forEach((n, i) => {
        const pageTag = n.page ? `（P${n.page}）` : ''
        lines.push(`### ${i + 1}. ${n.title || '随记'}${pageTag}`)
        lines.push('')
        lines.push(String(n.text).trim())
        lines.push('')
      })
    }

    // 中英对照
    if (withTranslation && translation.some(t => String(t.dst || '').trim())) {
      lines.push('## 中英对照')
      lines.push('')
      translation.forEach((pair, i) => {
        const dst = String(pair.dst || '').trim()
        if (!dst) return
        lines.push(`**${i + 1}.** ${String(pair.src || '').trim()}`)
        lines.push('')
        lines.push(dst)
        lines.push('')
      })
    }

    // 原文附录（可选）
    if (includeFullText && fullText) {
      lines.push('<details>')
      lines.push('<summary>原文全文（文本层提取）</summary>')
      lines.push('')
      lines.push('```text')
      lines.push(fullText.replace(/```/g, "'''"))
      lines.push('```')
      lines.push('')
      lines.push('</details>')
      lines.push('')
    }

    lines.push('---')
    lines.push('')
    lines.push(`> 本文由 [Biko 文献阅读工作台](/books/) 于 ${stamp()} 生成。`)
    lines.push('')

    return { content: lines.join('\n'), filename: `${safeName(title)}.md` }
  }

  /* ---------------- 长图导出（原生 Canvas，不依赖第三方库） ---------------- */

  const FONT_STACK = '"PingFang SC","Microsoft YaHei",system-ui,sans-serif'
  const fontOf = (size, weight = '400') => `${weight} ${size}px ${FONT_STACK}`

  /** 中英混排的按宽度折行 */
  const wrapText = (ctx, text, maxWidth) => {
    const out = []
    String(text || '').split('\n').forEach(line => {
      if (!line) { out.push(''); return }
      let cur = ''
      for (const ch of line) {
        if (ctx.measureText(cur + ch).width > maxWidth && cur) {
          out.push(cur)
          cur = ch
        } else {
          cur += ch
        }
      }
      if (cur) out.push(cur)
    })
    return out
  }

  /**
   * 把阅读笔记画成一张长图。
   * @returns {Promise<Blob>}
   */
  const toLongImage = async (doc, annotations, notes) => {
    const W = 900
    const PAD = 48
    const INNER = W - PAD * 2

    const blocks = []
    const title = doc.title || '未命名文献'
    blocks.push({ text: title, size: 30, weight: '700', color: '#f2f5fa', gap: 8 })
    const subline = [doc.authors, doc.year, doc.doi ? 'DOI: ' + doc.doi : ''].filter(Boolean).join(' · ')
    if (subline) blocks.push({ text: subline, size: 15, color: '#9db4d3', gap: 20 })
    blocks.push({ text: '阅读笔记 · ' + stamp(), size: 14, color: '#8fa4c0', gap: 30 })

    const summaries = notes.filter(n => n.kind === 'summary' && String(n.text || '').trim())
    if (summaries.length) {
      blocks.push({ text: '内容摘要', size: 21, weight: '700', color: '#e6ecf5', gap: 12 })
      summaries.forEach(n => blocks.push({ text: String(n.text).trim(), size: 16, color: '#cdd8e8', gap: 14 }))
    }

    if (annotations.length) {
      blocks.push({ text: '标注与批注', size: 21, weight: '700', color: '#e6ecf5', gap: 14 })
      annotations.forEach(a => {
        blocks.push({ text: `P${a.page} · ${TYPE_LABEL[a.type] || '标注'}`, size: 13, color: '#8fa4c0', gap: 4 })
        blocks.push({ text: String(a.quote || '').trim(), size: 16, color: '#ffe9a8', gap: 4, bar: a.color })
        const noteText = String(a.note || '').trim()
        if (noteText) blocks.push({ text: noteText, size: 15, color: '#cdd8e8', gap: 12 })
        else blocks.push({ text: '', size: 6, gap: 8 })
      })
    }

    const plainNotes = notes.filter(
      n => n.kind !== 'summary' && n.kind !== 'translation' && String(n.text || '').trim()
    )
    if (plainNotes.length) {
      blocks.push({ text: '阅读笔记', size: 21, weight: '700', color: '#e6ecf5', gap: 14 })
      plainNotes.forEach((n, i) => {
        blocks.push({
          text: `${i + 1}. ${n.title || '随记'}${n.page ? '（P' + n.page + '）' : ''}`,
          size: 17, weight: '600', color: '#dfe7f2', gap: 6
        })
        blocks.push({ text: String(n.text).trim(), size: 16, color: '#cdd8e8', gap: 16 })
      })
    }

    // 先用离屏 context 量高度
    const probe = document.createElement('canvas').getContext('2d')
    const measured = []
    let y = PAD
    blocks.forEach(b => {
      probe.font = fontOf(b.size, b.weight || '400')
      const lines = wrapText(probe, b.text, INNER - 16)
      const lineH = Math.round(b.size * 1.62)
      const h = Math.max(lineH, lines.length * lineH)
      measured.push({ ...b, lines, lineH, h })
      y += h + (b.gap || 0)
    })
    const height = Math.max(600, y + PAD + 24)

    // 正式绘制
    const canvas = document.createElement('canvas')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(W * dpr)
    canvas.height = Math.floor(height * dpr)
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.textBaseline = 'top'

    const bg = ctx.createLinearGradient(0, 0, W, height)
    bg.addColorStop(0, '#141b28')
    bg.addColorStop(0.55, '#1d2739')
    bg.addColorStop(1, '#243149')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, height)

    const accent = ctx.createLinearGradient(0, 0, W, 0)
    accent.addColorStop(0, '#7e96b8')
    accent.addColorStop(0.5, '#9db4d3')
    accent.addColorStop(1, '#6d86a8')
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, W, 5)

    let cy = PAD
    measured.forEach(b => {
      if (b.bar) {
        ctx.fillStyle = b.bar
        ctx.globalAlpha = 0.85
        ctx.fillRect(PAD - 14, cy + 4, 4, Math.max(8, b.h - 8))
        ctx.globalAlpha = 1
      }
      ctx.font = fontOf(b.size, b.weight || '400')
      ctx.fillStyle = b.color || '#cdd8e8'
      b.lines.forEach((line, i) => ctx.fillText(line, PAD, cy + i * b.lineH))
      cy += b.h + (b.gap || 0)
    })

    ctx.font = fontOf(13)
    ctx.fillStyle = '#7d90ab'
    ctx.fillText('Generated by Biko 文献阅读工作台 · /books/', PAD, height - PAD + 8)

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('长图生成失败'))
      }, 'image/png')
    })
  }

  /** 导出原始数据 JSON（迁移 / 备份） */
  const toBackup = (doc, annotations, notes) => JSON.stringify({
    app: 'biko-books',
    version: 1,
    exportedAt: new Date().toISOString(),
    doc: { ...doc, blob: undefined },
    annotations,
    notes
  }, null, 2)

  window.BOOKS_EXPORT = Object.freeze({
    CATEGORY,
    safeName,
    toMarkdown,
    toLongImage,
    toBackup,
    download,
    stamp
  })
})()
