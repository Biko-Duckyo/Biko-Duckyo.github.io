/* Shared, deterministic note structure. No model calls or document uploads. */
;(function (root) {
  'use strict'
  const key = 'doc-to-diagram:src'
  const sample = '# 科学阅读\n## 提出问题\n- 明确研究对象\n- 记录已有证据\n## 验证想法\n- 设计实验\n- 比较结果\n## 整理结论\n- 标注来源\n- 记录待解问题'
  function graph(markdown) {
    const lines = String(markdown).slice(0, 60000).split(/\r?\n/)
    const concepts = [], relations = [], clusters = []
    const stack = [], names = new Map(), arrows = []
    const palette = ['#7298c8', '#a18bd2', '#68ada2', '#d3a36c', '#d18fa9']
    let title = '我的知识笔记', currentCluster = 'notes', inCode = false
    function add(name, level) {
      name = name.replace(/\*\*|__|`/g, '').trim().slice(0, 120)
      if (!name || concepts.length >= 180) return
      while (stack.length && stack[stack.length - 1].level >= level) stack.pop()
      if (level <= 2 || !clusters.length) {
        currentCluster = 'group-' + clusters.length
        const color = palette[clusters.length % palette.length]
        const angle = clusters.length * 2.4
        clusters.push({ id: currentCluster, name, light: color, dark: color, anchor: [Math.cos(angle), Math.sin(angle), 0] })
      }
      const node = { id: 'note-' + concepts.length, cluster: currentCluster, name, summary: name, formula: '', caution: '', sourceId: 'local-note' }
      concepts.push(node); names.set(name, node.id)
      if (stack.length) relations.push({ from: stack[stack.length - 1].id, to: node.id, label: '包含', kind: 'pre' })
      stack.push({ id: node.id, level })
      if (concepts.length === 1) title = name
    }
    for (const line of lines) {
      if (/^\s*```/.test(line)) { inCode = !inCode; continue }
      if (inCode || !line.trim()) continue
      const heading = line.match(/^(#{1,6})\s+(.+)$/)
      const list = line.match(/^(\s*)(?:[-*+] |\d+[.)] )(.+)$/)
      if (heading) add(heading[2], heading[1].length)
      else if (list) add(list[2], 7 + Math.floor(list[1].replace(/\t/g, '  ').length / 2))
      else if (line.includes('->') || line.includes('→')) arrows.push(line.split(/\s*(?:->|→)\s*/).filter(Boolean))
      else if (!concepts.length) add(line, 1)
    }
    for (const chain of arrows) {
      chain.forEach(name => { if (!names.has(name.trim())) add(name, 7) })
      for (let i = 1; i < chain.length; i++) {
        const from = names.get(chain[i - 1].trim()), to = names.get(chain[i].trim())
        if (from && to && from !== to) relations.push({ from, to, label: '关联', kind: 'rel' })
      }
    }
    if (!concepts.length) return graph(sample)
    return { id: 'local-notes', title, subtitle: '按笔记层级与箭头生成 · 本机保存', sample: false, concepts, relations, clusters, sources: [{ id: 'local-note', title: '我的本地笔记', text: String(markdown).slice(0, 60000), url: '' }] }
  }
  function diagramText(markdown) {
    let heading = 0
    return String(markdown).split(/\r?\n/).map(line => {
      const h = line.match(/^(#{1,6})\s+(.+)$/)
      if (h) { heading = h[1].length; return '  '.repeat(heading - 1) + h[2] }
      const li = line.match(/^(\s*)(?:[-*+] |\d+[.)] )(.+)$/)
      return li ? '  '.repeat(heading) + li[1].replace(/\t/g, '  ') + li[2] : line
    }).join('\n')
  }
  root.BikoKnowledge = { key, sample, graph, diagramText }
  if (typeof module !== 'undefined') module.exports = root.BikoKnowledge
})(typeof window === 'undefined' ? globalThis : window)
