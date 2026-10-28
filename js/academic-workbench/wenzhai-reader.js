/* ============================================================
 *  答学 · 文斋开拓 —— 主控制器（简化版）
 *
 *  实现核心功能：
 *    1) 上传 PDF 文件
 *    2) 翻页、缩放
 *    3) 笔记面板
 * ============================================================ */
console.log('[wenzhai] script file loaded, starting...')
(() => {
  'use strict'

  console.log('[wenzhai] IIFE started')

  /* ---------------- 状态 ---------------- */
  const state = {
    file: null,           // 当前 PDF 文件
    fileName: '',         // 文件名
    pageCount: 0,         // 总页数
    activePage: 1,        // 当前页
    scale: 1,             // 缩放比例
    notes: [],            // 笔记列表
    transcription: ''     // 转写后的文本
  }

  /* ---------------- DOM 元素 ---------------- */
  const el = {}
  const cache = id => { el[id] = el[id] || document.getElementById(id); return el[id] }

  /* ---------------- 工具函数 ---------------- */
  const toast = (msg, type = 'info', ms = 2500) => {
    console.log(`[wenzhai] ${msg}`)
  }

  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")

  /* ---------------- 事件绑定 ---------------- */
  const bindEvents = () => {
    // 文件上传
    const fileInput = cache('wenzhai-file')
    if (fileInput) {
      fileInput.addEventListener('change', onFileChange)
    }

    // DOI 输入框
    const openBtn = cache('wenzhai-open')
    if (openBtn) {
      openBtn.addEventListener('click', submit)
    }
    const sourceInput = cache('wenzhai-source')
    if (sourceInput) {
      sourceInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') submit()
      })
    }

    // 翻页
    const prevBtn = cache('wenzhaiPrevPage')
    if (prevBtn) {
      prevBtn.addEventListener('click', prevPage)
    }
    const nextBtn = cache('wenzhaiNextPage')
    if (nextBtn) {
      nextBtn.addEventListener('click', nextPage)
    }

    // 缩放
    const zoomOutBtn = cache('wenzhaiZoomOut')
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => zoomBy(-0.1))
    }
    const zoomInBtn = cache('wenzhaiZoomIn')
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => zoomBy(0.1))
    }
    const fitWidthBtn = cache('wenzhaiFitWidth')
    if (fitWidthBtn) {
      fitWidthBtn.addEventListener('click', () => toast('适宽功能（待实现）'))
    }
    const fitPageBtn = cache('wenzhaiFitPage')
    if (fitPageBtn) {
      fitPageBtn.addEventListener('click', () => toast('整页功能（待实现）'))
    }

    // 面板功能
    const outlineBtn = cache('wenzhaiOutline')
    if (outlineBtn) {
      outlineBtn.addEventListener('click', () => toast('目录功能（待实现）'))
    }
    const searchBtn = cache('wenzhaiSearch')
    if (searchBtn) {
      searchBtn.addEventListener('click', () => toast('全文搜索功能（待实现）'))
    }
    const regionZoomBtn = cache('wenzhaiRegionZoom')
    if (regionZoomBtn) {
      regionZoomBtn.addEventListener('click', () => toast('图区放大功能（待实现）'))
    }
    const annotRegionBtn = cache('wenzhaiAnnotRegion')
    if (annotRegionBtn) {
      annotRegionBtn.addEventListener('click', () => toast('图区批注功能（待实现）'))
    }

    // 顶栏左侧功能
    const libraryBtn = cache('wenzhaiLibrary')
    if (libraryBtn) {
      libraryBtn.addEventListener('click', () => toast('我的文献库功能（待实现）'))
    }
    const exportMdBtn = cache('wenzhaiExportMd')
    if (exportMdBtn) {
      exportMdBtn.addEventListener('click', exportMd)
    }
    const exportImgBtn = cache('wenzhaiExportImg')
    if (exportImgBtn) {
      exportImgBtn.addEventListener('click', () => toast('导出长图功能（待实现）'))
    }
    const helpBtn = cache('wenzhaiHelp')
    if (helpBtn) {
      helpBtn.addEventListener('click', () => toast('使用说明功能（待实现）'))
    }
  }

  /* ---------------- 文件上传 ---------------- */
  const onFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    state.file = file
    state.fileName = file.name
    toast(`已选择文件：${file.name}`)
    // TODO: 实现 PDF 加载逻辑
  }

  const submit = async () => {
    const url = cache('wenzhai-source').value.trim()
    if (!url) {
      toast('请输入 DOI 或 PDF 链接', 'warning')
      return
    }
    toast(`正在打开：${url}`)
    // TODO: 实现 DOI/URL 解析逻辑
  }

  /* ---------------- 翻页 ---------------- */
  const prevPage = () => {
    if (state.activePage > 1) {
      state.activePage--
      updatePageLabel()
    }
  }

  const nextPage = () => {
    if (state.activePage < state.pageCount) {
      state.activePage++
      updatePageLabel()
    }
  }

  const updatePageLabel = () => {
    const label = cache('wenzhaiPageLabel')
    if (label) label.textContent = `${state.activePage} / ${state.pageCount || '—'}`
  }

  /* ---------------- 缩放 ---------------- */
  const zoomBy = (delta) => {
    state.scale = Math.max(0.5, Math.min(3, state.scale + delta))
    updateZoomLabel()
  }

  const updateZoomLabel = () => {
    const label = cache('wenzhaiZoomLabel')
    if (label) label.textContent = Math.round(state.scale * 100) + '%'
  }

  /* ---------------- 导出 ---------------- */
  const exportMd = () => {
    if (!state.transcription) {
      toast('没有可导出的内容')
      return
    }
    const blob = new Blob([state.transcription], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (state.fileName || 'document').replace('.pdf', '.md')
    a.click()
    URL.revokeObjectURL(url)
    toast('已导出 Markdown 文件')
  }

  /* ---------------- 初始化 ---------------- */
  const init = () => {
    bindEvents()
    console.log('[wenzhai] reader initialized')
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // 暴露给全局（调试用）
  console.log('[wenzhai] about to expose window.WENZHAI_READER')
  window.WENZHAI_READER = { state, init }
  console.log('[wenzhai] window.WENZHAI_READER exposed successfully')
})()
