/* ============================================================
 *  答学 · 译文库 —— 摘要和译文管理模块
 *
 *  使用浏览器本地存储（IndexedDB）
 * ============================================================ */
(() => {
  'use strict'

  /* ============================================================
   *  第一部分：本地存储层（IndexedDB）
   * ============================================================ */

  const DB_NAME = 'daxue-translations'
  const DB_VERSION = 1
  const STORES = {
    translations: 'translations',
    summaries: 'summaries'
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
        if (!db.objectStoreNames.contains(STORES.translations)) {
          const translations = db.createObjectStore(STORES.translations, { keyPath: 'id' })
          translations.createIndex('createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains(STORES.summaries)) {
          const summaries = db.createObjectStore(STORES.summaries, { keyPath: 'id' })
          summaries.createIndex('docId', 'docId')
        }
      }
      req.onsuccess = event => resolve(event.target.result)
      req.onerror = event => reject(event.target.error)
    })
    return dbPromise
  }

  const store = {
    async saveTranslation(translation) {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.translations, 'readwrite')
        tx.objectStore(STORES.translations).put(translation)
        tx.oncomplete = () => resolve(translation)
        tx.onerror = () => reject(tx.error)
      })
    },

    async listTranslations() {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.translations, 'readonly')
        const req = tx.objectStore(STORES.translations).getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
      })
    },

    async removeTranslation(id) {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.translations, 'readwrite')
        tx.objectStore(STORES.translations).delete(id)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    },

    async saveSummary(summary) {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.summaries, 'readwrite')
        tx.objectStore(STORES.summaries).put(summary)
        tx.oncomplete = () => resolve(summary)
        tx.onerror = () => reject(tx.error)
      })
    },

    async listSummaries() {
      const db = await open()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.summaries, 'readonly')
        const req = tx.objectStore(STORES.summaries).getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
      })
    }
  }

  /* ============================================================
   *  第二部分：译文库管理
   * ============================================================ */

  const state = {
    translations: [],
    summaries: [],
    q: '',
    view: 'list'
  }

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  const toast = msg => {
    console.log('[translation-library] ' + msg)
    alert(msg)
  }

  const load = async () => {
    try {
      state.translations = await store.listTranslations()
      state.summaries = await store.listSummaries()
    } catch (err) {
      toast('读取译文库失败：' + err.message)
    }
  }

  const filtered = () => {
    const q = state.q.trim().toLowerCase()
    return state.translations.filter(t => {
      if (!q) return true
      const hay = [t.title, t.source, ...(t.tags || [])].join(' ').toLowerCase()
      return q.split(/\s+/).every(word => hay.includes(word))
    })
  }

  const renderStats = () => {
    const box = document.getElementById('transLibStats')
    if (!box) return
    box.innerHTML = `
      <div style="display: flex; gap: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="text-align: center; flex: 1; min-width: 60px;">
          <div style="font-size: 20px; font-weight: 600; color: #333;">${state.translations.length}</div>
          <div style="font-size: 12px; color: #666;">译文</div>
        </div>
        <div style="text-align: center; flex: 1; min-width: 60px;">
          <div style="font-size: 20px; font-weight: 600; color: #10b981;">${state.summaries.length}</div>
          <div style="font-size: 12px; color: #666;">摘要</div>
        </div>
      </div>`
  }

  const renderToolbar = () => {
    const box = document.getElementById('transLibToolbar')
    if (!box) return
    box.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;">
        <input type="text" placeholder="搜索标题 / 来源..." 
               style="flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; min-width: 200px;"
               oninput="window.TRANSLATION_LIBRARY.setSearch(this.value)">
        <button onclick="window.TRANSLATION_LIBRARY.exportJSON()" style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer;">💾 导出</button>
      </div>`
  }

  const renderList = () => {
    const box = document.getElementById('transLibGrid')
    if (!box) return
    const list = filtered()
    
    if (!state.translations.length) {
      box.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">' +
        '<div style="font-size: 48px; margin-bottom: 16px;">🌐</div>' +
        '<div style="font-size: 16px; margin-bottom: 8px;">译文库还是空的</div>' +
        '<div style="font-size: 14px;">在文斋开拓中翻译文献后，会自动归档到这里</div>' +
        '</div>'
      return
    }

    if (!list.length) {
      box.innerHTML = '<div style="padding: 40px; text-align: center; color: #999;">' +
        '<div style="font-size: 48px; margin-bottom: 16px;">🔍</div>' +
        '<div style="font-size: 16px; margin-bottom: 8px;">没有符合条件的译文</div>' +
        '<div style="font-size: 14px;">换个关键词试试</div>' +
        '</div>'
      return
    }

    box.innerHTML = list.map(t => {
      const summary = state.summaries.find(s => s.docId === t.id)
      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: white;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; flex: 1;">${esc(t.title || '未命名译文')}</h3>
            <button onclick="window.TRANSLATION_LIBRARY.deleteTranslation('${t.id}')" style="border: none; background: none; cursor: pointer; color: #dc2626;">🗑️</button>
          </div>
          <p style="margin: 0 0 8px; font-size: 14px; color: #666;">${esc(t.source || '')}</p>
          ${summary ? `<div style="margin-bottom: 8px; padding: 12px; background: #f0fdf4; border-radius: 6px;">
            <div style="font-size: 12px; color: #10b981; margin-bottom: 4px;">📝 AI 摘要</div>
            <div style="font-size: 13px; line-height: 1.5;">${esc(summary.content.slice(0, 200))}${summary.content.length > 200 ? '...' : ''}</div>
          </div>` : ''}
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button onclick="window.TRANSLATION_LIBRARY.viewTranslation('${t.id}')" style="padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer;">👁️ 查看译文</button>
            <button onclick="window.TRANSLATION_LIBRARY.viewSummary('${t.id}')" style="padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer;">📝 查看摘要</button>
          </div>
        </div>`
    }).join('')
  }

  const refresh = async () => {
    await load()
    renderStats()
    renderToolbar()
    renderList()
  }

  const setSearch = q => {
    state.q = q
    renderList()
  }

  const deleteTranslation = async id => {
    if (!confirm('确定要删除这篇译文吗？')) return
    await store.removeTranslation(id)
    await refresh()
    toast('已删除译文')
  }

  const viewTranslation = id => {
    const t = state.translations.find(t => t.id === id)
    if (!t) return
    alert('译文内容：\n\n' + (t.content || '暂无译文内容'))
  }

  const viewSummary = id => {
    const summary = state.summaries.find(s => s.docId === id)
    if (!summary) {
      alert('暂无摘要')
      return
    }
    alert('摘要内容：\n\n' + summary.content)
  }

  const exportJSON = () => {
    const data = {
      translations: state.translations,
      summaries: state.summaries,
      exportAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'translation-library-' + new Date().toISOString().slice(0, 10) + '.json'
    a.click()
    URL.revokeObjectURL(url)
    toast('已导出译文库')
  }

  const init = () => {
    refresh()
  }

  // 暴露给全局
  window.TRANSLATION_LIBRARY = {
    init,
    refresh,
    setSearch,
    deleteTranslation,
    viewTranslation,
    viewSummary,
    exportJSON,
    addTranslation: async (translation) => {
      await store.saveTranslation(translation)
      await refresh()
    },
    addSummary: async (summary) => {
      await store.saveSummary(summary)
      await refresh()
    }
  }
})()
