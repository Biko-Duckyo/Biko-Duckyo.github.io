/* ============================================================
 *  /books/ 文献阅读工作台 —— 中英对照层
 *
 *  复用站点既有的「OpenAI 兼容接口」约定（与 /nanaly/js/nanaly-provider.js 同构）：
 *    配置 { baseURL, apiKey, model } → POST {baseURL}/chat/completions
 *  默认指向 DeepSeek；也支持 api.noimpty-zby.cn 这类自建 Worker 网关。
 *
 *  对照策略：段落级左右对齐（不做句级对齐算法，稳、可控、够用）。
 *  原文与译文一一对应成对渲染，滚动时按段落同步高亮。
 * ============================================================ */
(() => {
  'use strict'

  const DEFAULT_CFG = {
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    apiKey: ''
  }

  /** 组装接口地址：宽容处理用户填的 base（带不带 /v1、带不带尾斜杠） */
  const endpoint = value => {
    let raw = String(value || '').trim().replace(/\/+$/, '')
    if (!raw) raw = DEFAULT_CFG.baseURL
    if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw
    try {
      const url = new URL(raw)
      if (url.protocol !== 'https:' &&
          !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
        throw new Error('模型接口地址必须是 https')
      }
      // 已经写到 /chat/completions 就不再追加
      if (/\/chat\/completions$/.test(url.pathname)) return url.href
      return url.href.replace(/\/+$/, '') + '/chat/completions'
    } catch (err) {
      throw new Error('模型接口地址无效：' + (err && err.message))
    }
  }

  /**
   * 按段落切分文本，同时保证每段不至于太短（避免碎片化请求）。
   * 也会把过长的段落按句号切分，控制单次请求体积。
   */
  const splitParagraphs = (text, { minLen = 40, maxLen = 1200 } = {}) => {
    const raw = String(text || '')
      .replace(/\r\n?/g, '\n')
      .split(/\n{2,}/)
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean)

    // 先按空行切；再去掉明显是页眉页脚/页码的碎行
    const looksNoise = p => p.length <= 3 && /^[\[\]()\d.\-–—]+$/.test(p)
    const kept = raw.filter(p => !looksNoise(p))

    const merged = []
    let buf = ''
    kept.forEach(p => {
      if (!buf) { buf = p; return }
      if (buf.length < minLen) { buf += ' ' + p; return }
      merged.push(buf)
      buf = p
    })
    if (buf) merged.push(buf)

    // 超长段落再按句子拆
    const out = []
    merged.forEach(p => {
      if (p.length <= maxLen) { out.push(p); return }
      const sentences = p.match(/[^.!?。！？]+[.!?。！？]*\s*/g) || [p]
      let cur = ''
      sentences.forEach(s => {
        if ((cur + s).length > maxLen && cur) { out.push(cur.trim()); cur = s }
        else cur += s
      })
      if (cur.trim()) out.push(cur.trim())
    })
    return out
  }

  const SYSTEM_PROMPT =
    '你是严谨的学术文献翻译。把用户给的英文段落翻译成简体中文。' +
    '要求：1) 保持学术语气，术语准确，首次出现的专业术语在括号内保留英文原词；' +
    '2) 不要翻译公式、变量名、DOI、URL、参考文献编号；' +
    '3) 不要输出任何解释、前言或 Markdown 代码块；' +
    '4) 译文段落数必须与原文段落数严格一致，一段一行，用 \\n\\n 分隔。'

  /**
   * 调用模型翻译一批段落。
   * @param {string[]} paragraphs
   * @param {{baseURL:string, apiKey:string, model:string}} cfg
   * @param {{signal?:AbortSignal, onProgress?:(done:number,total:number)=>void, batch?:number}} opts
   * @returns {Promise<string[]>} 与输入等长的译文数组
   */
  const translate = async (paragraphs, cfg, opts = {}) => {
    const { signal, onProgress = () => {}, batch = 8 } = opts
    const conf = { ...DEFAULT_CFG, ...(cfg || {}) }
    if (!conf.apiKey) throw new Error('请先填写翻译用的 API Key')

    const url = endpoint(conf.baseURL)
    const results = new Array(paragraphs.length).fill('')

    for (let i = 0; i < paragraphs.length; i += batch) {
      if (signal && signal.aborted) throw new DOMException('已取消', 'AbortError')
      const chunk = paragraphs.slice(i, i + batch)

      // 用编号包裹，便于模型对齐，也便于我们兜底切分
      const numbered = chunk
        .map((p, idx) => `<<<${idx + 1}>>>\n${p}`)
        .join('\n\n')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + conf.apiKey
        },
        body: JSON.stringify({
          model: conf.model || DEFAULT_CFG.model,
          temperature: 0.2,
          stream: false,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: numbered }
          ]
        }),
        signal,
        redirect: 'error',
        credentials: 'omit',
        cache: 'no-store'
      })

      if (!response.ok) {
        let detail = ''
        try {
          const body = await response.json()
          detail = String(body.error?.message || body.message || '').slice(0, 300)
        } catch (_) {}
        const hints = {
          401: '密钥无效或已过期',
          403: '账号或模型权限不足',
          404: '模型或接口不存在，请检查设置',
          429: '请求过于频繁或额度不足'
        }
        throw new Error((hints[response.status] || '翻译服务暂时不可用') +
          `（${response.status}）` + (detail ? '：' + detail : ''))
      }

      const data = await response.json()
      const content = String(data.choices?.[0]?.message?.content || '').trim()
      const parsed = parseNumbered(content, chunk.length)
      parsed.forEach((t, idx) => { results[i + idx] = t })
      onProgress(Math.min(i + batch, paragraphs.length), paragraphs.length)
    }

    return results
  }

  /** 从模型输出里按编号切回等长数组；编号丢了就按空行兜底 */
  const parseNumbered = (content, expected) => {
    const parts = new Array(expected).fill('')
    const re = /<<<\s*(\d+)\s*>>>/g
    const marks = []
    let m
    while ((m = re.exec(content))) {
      marks.push({ n: Number(m[1]), start: re.lastIndex })
    }
    if (marks.length) {
      marks.forEach((mark, i) => {
        const end = i + 1 < marks.length ? content.lastIndexOf('<<<', marks[i + 1].start - 1) : content.length
        const body = content.slice(mark.start, end >= mark.start ? end : content.length).trim()
        const idx = mark.n - 1
        if (idx >= 0 && idx < expected) parts[idx] = body
      })
      return parts
    }
    // 没有编号：按空行分段顺序填充
    const fallback = content.split(/\n{2,}/).map(s => s.trim()).filter(Boolean)
    fallback.forEach((t, i) => { if (i < expected) parts[i] = t })
    return parts
  }

  window.BOOKS_BILINGUAL = Object.freeze({ DEFAULT_CFG, endpoint, splitParagraphs, translate })
})()
