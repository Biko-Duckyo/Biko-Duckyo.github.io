/* ============================================================
 *  答学 · 原文精读 —— 文献库管理模块
 *
 *  从 books 页面的 library.js、store.js、export.js 移植而来
 *  适配原文精读面板的 HTML 结构
 * ============================================================ */
(() => {
  'use strict'

  /* ============================================================
   *  第一部分：本地存储层（IndexedDB）
   * ============================================================ */

  const DB_NAME = 'daxue-reading'
  const DB_VERSION = 1
  const STORES = {
    docs: 'docs',
    blobs: 'blobs',
    annotations: 'annotations',
    notes: 'notes',
    history: 'history',
    settings: 'settings'
  }

  let dbPromise = null

  const open = () => {
    if (dbPromise) return dbPromise
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('当前浏览器不支持 IndexedDB'))
        return
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = event => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(STORES.docs)) {
          const docs = db.createObjectStore(STORES.docs, { keyPath: 'id' })
          docs.createIndex('updatedAt', 'updatedAt')
        }
        if (!db.objectStoreNames.contains(STORES.annotations)) {
          const ann = db.createObjectStore(STORES.annotations, { keyPath: 'id' })
          ann.createIndex('docId', 'docId')
        }
        if (!db.objectStoreNames.contains(STORES.notes)) {
          const notes = db.createObjectStore(STORES.notes, { keyPath: 'id' })
          notes.createIndex('docId', 'docId')
        }
      }
      req.onsuccess = event => resolve(event.target.result)
      req.onerror = event => reject(event.target.error)
    })
    return dbPromise
  }

  const store = {
    async saveDoc(doc) {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.docs, 'readwrite')
        tx.objectStore(STORES.docs).put(doc)
        tx.oncomplete = () => resolve(doc)
        tx.onerror = () => reject(tx.error)
      })
    },

    async listDocs() {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.docs, 'readonly')
        const req = tx.objectStore(STORES.docs).getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
      })
    },

    async removeDoc(id) {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.docs, 'readwrite')
        tx.objectStore(STORES.docs).delete(id)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    },

    async updateDoc(id, patch) {
      const docs = await this.listDocs()
      const doc = docs.find(d => d.id === id)
      if (!doc) throw new Error('文献不存在')
      Object.assign(doc, patch, { updatedAt: Date.now() })
      await this.saveDoc(doc)
      return doc
    },

    async updateDocs(ids, patch) {
      for (const id of ids) {
        await this.updateDoc(id, patch)
      }
    },

    async librarySnapshot() {
      const docs = await this.listDocs()
      const stats = {
        docs: docs.length,
        reading: docs.filter(d => d.progress > 0 && d.progress < 0.995).length,
        finished: docs.filter(d => d.progress >= 0.995).length,
        starred: docs.filter(d => d.star).length,
        msRead: docs.reduce((sum, d) => sum + (d.msRead || 0), 0),
        annotations: 0,
        notes: 0,
        readingDays: 0
      }
      const tags = {}
      docs.forEach(d => {
        (d.tags || []).forEach(t => {
          tags[t] = (tags[t] || 0) + 1
        })
      })
      return {
        list: docs,
        tags: Object.entries(tags).map(([name, count]) => ({ name, count })),
        stats
      }
    },

    async saveSetting(key, value) {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.settings, 'readwrite')
        tx.objectStore(STORES.settings).put({ key, value })
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    },

    async getSetting(key, defaultValue) {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.settings, 'readonly')
        const req = tx.objectStore(STORES.settings).get(key)
        req.onsuccess = () => resolve(req.result ? req.result.value : defaultValue)
        req.onerror = () => reject(req.error)
      })
    }
  }

  /* ============================================================
   *  第二部分：文献库管理
   * ============================================================ */

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
    selected: new Set()
  }

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  const toast = msg => {
    console.log('[reading-library] ' + msg)
    alert(msg)
  }

  const STATUS_LABEL = { unread: '待读', reading: '在读', read: '已读完' }

  const statusOf = doc => {
    if (doc.progress >= 0.995) return 'read'
    if (doc.progress > 0) return 'reading'
    return doc.status || 'unread'
  }

  const durText = ms => {
    const min = Math.round((Number(ms) || 0) / 60000)
    if (min < 1) return '0 分钟'
    if (min < 60) return min + ' 分钟'
    const h = Math.floor(min / 60)
    return h + ' 小时' + (min % 60 ? ' ' + (min % 60) + ' 分' : '')
  }

  const load = async () => {
    try {
      const snap = await store.librarySnapshot()
      state.docs = snap.list
      state.tags = snap.tags
      state.stats = snap.stats
    } catch (err) {
      toast('读取文献库失败：' + err.message)
    }
  }

  const filtered = () => {
    const q = state.q.trim().toLowerCase()
    let list = state.docs.filter(d => {
      if (q) {
        const hay = [d.title, d.authors, d.year, ...(d.tags || [])].join(' ').toLowerCase()
        if (!q.split(/\s+/).every(word => hay.includes(word))) return false
      }
      if (state.status !== 'all') {
        if (state.status === 'starred') {
          if (!d.star) return false
        } else if (statusOf(d) !== state.status) {
          return false
        }
      }
      if (state.year && String(d.year || '') !== state.year) return false
      if (state.filterTags.length) {
        if (!state.filterTags.every(t => (d.tags || []).includes(t))) return false
      }
      return true
    })
    const by = {
      recent: (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
      title: (a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'zh-CN'),
      progress: (a, b) => (b.progress || 0) - (a.progress || 0)
    }
    return list.sort(by[state.sort] || by.recent)
  }

  const renderStats = () => {
    const box = document.getElementById('readingLibStats')
    if (!box || !state.stats) return
    const s = state.stats
    box.innerHTML = `
      <div style="display: flex; gap: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="text-align: center; flex: 1; min-width: 60px;">
          <div style="font-size: 20px; font-weight: 600; color: #333;">${s.docs}</div>
          <div style="font-size: 12px; color: #666;">文献</div>
        </div>
        <div style="text-align: center; flex: 1; min-width: 60px;">
          <div style="font-size: 20px; font-weight: 600; color: #3b82f6;">${s.reading}</div>
          <div style="font-size: 12px; color: #666;">在读</div>
        </div>
        <div style="text-align: center; flex: 1; min-width: 60px;">
          <div style="font-size: 20px; font-weight: 600; color: #10b981;">${s.finished}</div>
          <div style="font-size: 12px; color: #666;">已读完</div>
        </div>
        <div style="text-align: center; flex: 1; min-width: 60px;">
          <div style="font-size: 20px; font-weight: 600; color: #f59e0b;">${s.starred}</div>
          <div style="font-size: 12px; color: #666;">星标</div>
        </div>
        <div style="text-align: center; flex: 1; min-width: 60px;">
          <div style="font-size: 20px; font-weight: 600; color: #8b5cf6;">${durText(s.msRead)}</div>
          <div style="font-size: 12px; color: #666;">阅读时长</div>
        </div>
      </div>`
  }

  const renderFilters = () => {
    const box = document.getElementById('readingLibFilters')
    if (!box || !state.stats) return
    const s = state.stats
    const items = [
      { k: 'all', label: '全部', count: s.docs },
      { k: 'reading', label: '在读', count: s.reading },
      { k: 'unread', label: '待读', count: Math.max(0, s.docs - s.reading - s.finished) },
      { k: 'read', label: '已读完', count: s.finished },
      { k: 'starred', label: '星标', count: s.starred }
    ]
    box.innerHTML = items.map(it => {
      const on = state.status === it.k ? 'background: #3b82f6; color: white;' : ''
      return `<button onclick="window.READING_LIBRARY.setStatus('${it.k}')" style="padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 16px; background: white; cursor: pointer; ${on}">
        ${it.label} <span style="opacity: 0.7;">(${it.count})</span>
      </button>`
    }).join('')
    
    // 添加标签筛选
    if (state.tags.length) {
      box.innerHTML += '<div style="width: 100%; margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">'
      box.innerHTML += state.tags.slice(0, 10).map(t => {
        const on = state.filterTags.includes(t.name) ? 'background: #e0e7ff; color: #3730a3;' : ''
        return `<button onclick="window.READING_LIBRARY.toggleTag('${t.name}')" style="padding: 4px 8px; border: 1px solid #e5e7eb; border-radius: 12px; background: white; cursor: pointer; font-size: 12px; ${on}">
          #${esc(t.name)} <span style="opacity: 0.7;">(${t.count})</span>
        </button>`
      }).join('')
      box.innerHTML += '</div>'
    }
  }

  const renderToolbar = () => {
    const box = document.getElementById('readingLibToolbar')
    if (!box) return
    box.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;">
        <input type="text" id="readingSearchInput" placeholder="搜索标题 / 作者 / 标签..." 
               style="flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; min-width: 200px;"
               oninput="window.READING_LIBRARY.setSearch(this.value)">
        <select onchange="window.READING_LIBRARY.setSort(this.value)" style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px;">
          <option value="recent">最近更新</option>
          <option value="title">按标题</option>
          <option value="progress">按进度</option>
        </select>
        <button onclick="window.READING_LIBRARY.setView('grid')" style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: ${state.view === 'grid' ? '#3b82f6' : 'white'}; color: ${state.view === 'grid' ? 'white' : '#333'}; cursor: pointer;">📋 卡片</button>
        <button onclick="window.READING_LIBRARY.setView('list')" style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: ${state.view === 'list' ? '#3b82f6' : 'white'}; color: ${state.view === 'list' ? 'white' : '#333'}; cursor: pointer;">📝 列表</button>
        <button onclick="window.READING_LIBRARY.toggleSelect()" style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer;">${state.selectMode ? '取消选择' : '批量选择'}</button>
        <button onclick="window.READING_LIBRARY.exportJSON()" style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer;">💾 导出</button>
      </div>
      ${state.selectMode ? `
        <div style="display: flex; gap: 8px; margin-bottom: 16px; padding: 12px; background: #fef3c7; border-radius: 6px;">
          <span style="align-self: center;">已选 ${state.selected.size} 篇</span>
          <button onclick="window.READING_LIBRARY.bulkStar()" style="padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer;">⭐ 批量加星</button>
          <button onclick="window.READING_LIBRARY.bulkDelete()" style="padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer; color: #dc2626;">🗑️ 批量删除</button>
        </div>` : ''}`
  }

  const renderList = () => {
    const box = document.getElementById('readingLibGrid')
    if (!box) return
    const list = filtered()
    
    if (!state.docs.length) {
      box.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">' +
        '<div style="font-size: 48px; margin-bottom: 16px;">📚</div>' +
        '<div style="font-size: 16px; margin-bottom: 8px;">文献库还是空的</div>' +
        '<div style="font-size: 14px;">在文斋开拓中上传 PDF 后，会自动归档到这里</div>' +
        '</div>'
      return
    }

    if (!list.length) {
      box.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">' +
        '<div style="font-size: 48px; margin-bottom: 16px;">🔍</div>' +
        '<div style="font-size: 16px; margin-bottom: 8px;">没有符合条件的文献</div>' +
        '<div style="font-size: 14px;">换个关键词，或者重置筛选条件</div>' +
        '</div>'
      return
    }

    if (state.view === 'list') {
      box.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f8f9fa;">
              ${state.selectMode ? '<th style="padding: 12px; text-align: left;"></th>' : ''}
              <th style="padding: 12px; text-align: left;">标题</th>
              <th style="padding: 12px; text-align: left;">年份</th>
              <th style="padding: 12px; text-align: left;">状态</th>
              <th style="padding: 12px; text-align: left;">进度</th>
              <th style="padding: 12px; text-align: left;">操作</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(doc => {
              const pct = Math.round((doc.progress || 0) * 100)
              const status = statusOf(doc)
              const on = state.selected.has(doc.id)
              return `<tr style="border-bottom: 1px solid #e5e7eb; ${on ? 'background: #eff6ff;' : ''}">
                ${state.selectMode ? `<td style="padding: 12px;"><input type="checkbox" ${on ? 'checked' : ''} onchange="window.READING_LIBRARY.toggleSelectItem('${doc.id}')"></td>` : ''}
                <td style="padding: 12px;">
                  <div style="font-weight: 600;">${esc(doc.title || '未命名文献')}</div>
                  <div style="font-size: 12px; color: #999;">${esc(doc.authors || '')}</div>
                </td>
                <td style="padding: 12px;">${esc(doc.year || '—')}</td>
                <td style="padding: 12px;"><span style="padding: 2px 8px; background: #f3f4f6; border-radius: 4px; font-size: 12px;">${STATUS_LABEL[status]}</span></td>
                <td style="padding: 12px;">${pct}%</td>
                <td style="padding: 12px;">
                  <button onclick="window.READING_LIBRARY.editTags('${doc.id}')" style="border: none; background: none; cursor: pointer; font-size: 16px;" title="编辑标签">🏷️</button>
                  <button onclick="window.READING_LIBRARY.toggleStar('${doc.id}')" style="border: none; background: none; cursor: pointer; font-size: 16px;">${doc.star ? '⭐' : '☆'}</button>
                </td>
              </tr>`
            }).join('')}
          </tbody>
        </table>`
    } else {
      box.innerHTML = list.map(doc => {
        const pct = Math.round((doc.progress || 0) * 100)
        const status = statusOf(doc)
        const on = state.selected.has(doc.id)
        return `
          <div style="border: 1px solid ${on ? '#3b82f6' : '#e5e7eb'}; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: white; ${on ? 'background: #eff6ff;' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <div style="display: flex; gap: 8px; align-items: start; flex: 1;">
                ${state.selectMode ? `<input type="checkbox" ${on ? 'checked' : ''} onchange="window.READING_LIBRARY.toggleSelectItem('${doc.id}')" style="margin-top: 4px;">` : ''}
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; flex: 1;">${esc(doc.title || '未命名文献')}</h3>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; background: #f3f4f6;">${STATUS_LABEL[status]}</span>
                <button onclick="window.READING_LIBRARY.toggleStar('${doc.id}')" style="border: none; background: none; cursor: pointer; font-size: 16px;">${doc.star ? '⭐' : '☆'}</button>
              </div>
            </div>
            <p style="margin: 0 0 8px; font-size: 14px; color: #666;">${esc([doc.authors, doc.year].filter(Boolean).join(' · '))}</p>
            ${doc.abstract ? `<p style="margin: 0 0 8px; font-size: 13px; color: #999; line-height: 1.5;">${esc(doc.abstract.slice(0, 100))}${doc.abstract.length > 100 ? '...' : ''}</p>` : ''}
            <div style="height: 4px; background: #e5e7eb; border-radius: 2px; margin-bottom: 8px;">
              <div style="height: 100%; width: ${pct}%; background: #10b981; border-radius: 2px;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #999;">
              <span>进度：${pct}%</span>
              <span>${doc.pageCount ? doc.pageCount + ' 页' : ''}</span>
            </div>
            ${(doc.tags || []).length ? `<div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">${doc.tags.map(t => `<span style="padding: 2px 6px; background: #e0e7ff; color: #3730a3; border-radius: 4px; font-size: 11px;">${esc(t)}</span>`).join('')}</div>` : ''}
            <div style="margin-top: 8px; display: flex; gap: 8px;">
              <button onclick="window.READING_LIBRARY.editTags('${doc.id}')" style="padding: 4px 8px; border: 1px solid #e5e7eb; border-radius: 4px; background: white; cursor: pointer; font-size: 12px;">🏷️ 编辑标签</button>
              <button onclick="window.READING_LIBRARY.deleteDoc('${doc.id}')" style="padding: 4px 8px; border: 1px solid #e5e7eb; border-radius: 4px; background: white; cursor: pointer; font-size: 12px; color: #dc2626;">🗑️ 删除</button>
            </div>
          </div>`
      }).join('')
    }
  }

  const refresh = async () => {
    await load()
    renderStats()
    renderFilters()
    renderToolbar()
    renderList()
  }

  const setStatus = status => {
    state.status = status
    renderFilters()
    renderList()
  }

  const toggleTag = tag => {
    if (state.filterTags.includes(tag)) {
      state.filterTags = state.filterTags.filter(t => t !== tag)
    } else {
      state.filterTags.push(tag)
    }
    renderFilters()
    renderList()
  }

  const setSearch = q => {
    state.q = q
    renderList()
  }

  const setSort = sort => {
    state.sort = sort
    renderList()
  }

  const setView = view => {
    state.view = view
    renderToolbar()
    renderList()
  }

  const toggleSelect = () => {
    state.selectMode = !state.selectMode
    if (!state.selectMode) state.selected.clear()
    renderToolbar()
    renderList()
  }

  const toggleSelectItem = id => {
    if (state.selected.has(id)) {
      state.selected.delete(id)
    } else {
      state.selected.add(id)
    }
    renderList()
  }

  const toggleStar = async id => {
    const doc = state.docs.find(d => d.id === id)
    if (!doc) return
    await store.updateDoc(id, { star: !doc.star })
    await refresh()
    toast(!doc.star ? '已加星标' : '已取消星标')
  }

  const editTags = async id => {
    const doc = state.docs.find(d => d.id === id)
    if (!doc) return
    const input = prompt('标签（用逗号分隔）：', (doc.tags || []).join(', '))
    if (input == null) return
    const tags = Array.from(new Set(input.split(/[,，;；\s]+/).map(s => s.trim()).filter(Boolean)))
    await store.updateDoc(id, { tags })
    await refresh()
    toast(tags.length ? '标签已保存：' + tags.join('、') : '已清空标签')
  }

  const deleteDoc = async id => {
    if (!confirm('确定要删除这篇文献吗？')) return
    await store.removeDoc(id)
    await refresh()
    toast('已删除文献')
  }

  const bulkStar = async () => {
    for (const id of state.selected) {
      await store.updateDoc(id, { star: true })
    }
    await refresh()
    toast('已给 ' + state.selected.size + ' 篇文献加星标')
  }

  const bulkDelete = async () => {
    if (!confirm('确定要删除选中的 ' + state.selected.size + ' 篇文献吗？')) return
    for (const id of state.selected) {
      await store.removeDoc(id)
    }
    state.selected.clear()
    await refresh()
    toast('已删除 ' + state.selected.size + ' 篇文献')
  }

  const exportJSON = () => {
    const data = {
      docs: state.docs,
      exportAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reading-library-' + new Date().toISOString().slice(0, 10) + '.json'
    a.click()
    URL.revokeObjectURL(url)
    toast('已导出文献库')
  }

  const init = () => {
    refresh()
  }

  // 暴露给全局
  window.READING_LIBRARY = {
    init,
    refresh,
    setStatus,
    toggleTag,
    setSearch,
    setSort,
    setView,
    toggleSelect,
    toggleSelectItem,
    toggleStar,
    editTags,
    deleteDoc,
    bulkStar,
    bulkDelete,
    exportJSON,
    addDoc: async (doc) => {
      await store.saveDoc(doc)
      await refresh()
    }
  }
})()
