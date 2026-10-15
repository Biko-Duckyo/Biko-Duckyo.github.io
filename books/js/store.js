/* ============================================================
 *  /books/ 文献阅读工作台 —— 本地存储层（IndexedDB）
 *  纯前端，零后端：文献库 / 标注 / 笔记 / 设置全部落在浏览器。
 *  对外暴露 window.BOOKS_STORE，风格与 /nanaly/ 系列保持一致。
 * ============================================================ */
(() => {
  'use strict'

  const DB_NAME = 'biko-books'
  const DB_VERSION = 2
  const STORES = {
    docs: 'docs',               // 文献元数据（老版本里还存着文件 Blob，新版本迁到 blobs）
    blobs: 'blobs',             // 文献文件本体（单独放，避免列列表时把大文件读进内存）
    annotations: 'annotations', // 标注（高亮 / 划线 / 批注）
    notes: 'notes',             // 侧栏笔记（按文献聚合）
    history: 'history',         // 阅读历史快照（页码 / 滚动位置 / 阅读时长）
    settings: 'settings'        // 阅读设置 / 模型配置
  }

  /** 阅读历史快照：内存缓存，避免每次滚动都读写 IndexedDB */
  const historyCache = new Map()
  let historyLoaded = false

  let dbPromise = null

  /** 打开（或首次创建）数据库 */
  const open = () => {
    if (dbPromise) return dbPromise
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('当前浏览器不支持 IndexedDB，无法保存阅读数据'))
        return
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = event => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(STORES.docs)) {
          const docs = db.createObjectStore(STORES.docs, { keyPath: 'id' })
          docs.createIndex('updatedAt', 'updatedAt')
          docs.createIndex('doi', 'doi')
        }
        if (!db.objectStoreNames.contains(STORES.annotations)) {
          const ann = db.createObjectStore(STORES.annotations, { keyPath: 'id' })
          ann.createIndex('docId', 'docId')
        }
        if (!db.objectStoreNames.contains(STORES.notes)) {
          const notes = db.createObjectStore(STORES.notes, { keyPath: 'id' })
          notes.createIndex('docId', 'docId')
        }
        if (!db.objectStoreNames.contains(STORES.blobs)) {
          db.createObjectStore(STORES.blobs, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.history)) {
          db.createObjectStore(STORES.history, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.settings)) {
          db.createObjectStore(STORES.settings, { keyPath: 'key' })
        }
      }
      req.onsuccess = () => {
        const db = req.result
        // v1 → v2：把老记录里的 blob 挪到独立 store，避免列表查询把大文件读进内存
        if (db.objectStoreNames.contains(STORES.blobs)) {
          try {
            adoptLegacyBlobs(db).catch(() => {})
          } catch (_) {}
        }
        resolve(db)
      }
      req.onerror = () => reject(req.error || new Error('打开本地数据库失败'))
    })
    return dbPromise
  }

  const wrap = req => ({ __req: req })

  /**
   * 老版本把 PDF Blob 直接塞在 docs 记录里，列表查询会把整本书读进内存。
   * 这里做一次性搬运：blob → blobs store，docs 里只留 hasFile 标记。
   */
  const adoptLegacyBlobs = db => new Promise(resolve => {
    let settled = false
    const done = () => { if (!settled) { settled = true; resolve() } }
    let transaction
    try {
      transaction = db.transaction([STORES.docs, STORES.blobs], 'readwrite')
    } catch (_) { return done() }
    const docs = transaction.objectStore(STORES.docs)
    const blobs = transaction.objectStore(STORES.blobs)
    const cursorReq = docs.openCursor()
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result
      if (!cursor) return
      const record = cursor.value
      if (record && record.blob) {
        const { blob, ...rest } = record
        blobs.put({ id: record.id, data: blob })
        docs.put({ ...rest, hasFile: true, updatedAt: rest.updatedAt || Date.now() })
      }
      cursor.continue()
    }
    transaction.oncomplete = done
    transaction.onerror = done
    transaction.onabort = done
  })

  /** 在指定 store 上跑一个事务 */
  const tx = async (storeName, mode, run) => {
    const db = await open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode)
      const store = transaction.objectStore(storeName)
      let result
      try {
        result = run(store)
      } catch (err) {
        reject(err)
        return
      }
      transaction.oncomplete = () => resolve(result && result.__req ? result.__req.result : result)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error || new Error('本地存储事务被中断'))
    })
  }

  const put = (storeName, value) => tx(storeName, 'readwrite', store => wrap(store.put(value)))
  const get = (storeName, key) => tx(storeName, 'readonly', store => wrap(store.get(key)))
  const del = (storeName, key) => tx(storeName, 'readwrite', store => wrap(store.delete(key)))
  const all = storeName => tx(storeName, 'readonly', store => wrap(store.getAll()))
  const byIndex = (storeName, indexName, key) =>
    tx(storeName, 'readonly', store => wrap(store.index(indexName).getAll(key)))

  /** 简易 id 生成（唯一即可，不追求加密强度） */
  const uid = (prefix = 'id') =>
    `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`

  /* ---------------- 文献 ---------------- */

  /** 单独跑一个事务（多 store / 更新已有记录时用） */
  const run = async (storeNames, mode, body) => {
    const db = await open()
    return new Promise((resolve, reject) => {
      let transaction
      try {
        transaction = db.transaction(storeNames, mode)
      } catch (err) {
        reject(err)
        return
      }
      let value
      try {
        value = body(transaction)
      } catch (err) {
        try { transaction.abort() } catch (_) {}
        reject(err)
        return
      }
      transaction.oncomplete = () => resolve(value)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error || new Error('本地存储事务被中断'))
    })
  }

  /**
   * 保存（或更新）一篇文献。
   * 文件本体只走 blobs store；docs 里只记 hasFile，列表查询因此永远是轻量的。
   * @param {{id?:string, title?:string, doi?:string, url?:string, authors?:string,
   *          year?:string, source?:string, blob?:Blob, pageCount?:number,
   *          lastPage?:number, scrollRatio?:number}} doc
   */
  const saveDoc = async doc => {
    const { blob, ...fields } = doc
    return run([STORES.docs, STORES.blobs], 'readwrite', transaction => {
      const docs = transaction.objectStore(STORES.docs)
      const blobs = transaction.objectStore(STORES.blobs)
      const now = Date.now()
      const existingReq = fields.id ? docs.get(fields.id) : null
      const build = existing => {
        const record = {
          ...(existing || {}),
          ...fields,
          id: fields.id || uid('doc'),
          createdAt: (existing && existing.createdAt) || now,
          updatedAt: now,
          hasFile: !!(blob || (existing && existing.hasFile))
        }
        docs.put(record)
        if (blob) blobs.put({ id: record.id, data: blob })
        return record
      }
      if (!existingReq) return build(null)
      return new Promise(resolve => {
        existingReq.onsuccess = () => resolve(build(existingReq.result))
        existingReq.onerror = () => resolve(build(null))
      })
    })
  }

  /**
   * 列表：只返回元数据，绝不碰 blobs store。
   * 历史记录（最后阅读时间 / 进度 / 总时长）在内存里补齐，避免查询 blob 表。
   */
  const listDocs = async () => {
    const docs = (await all(STORES.docs)) || []
    await loadHistory()
    return docs
      .map(({ blob, ...rest }) => {
        const h = historyCache.get(rest.id)
        return {
          ...rest,
          hasFile: rest.hasFile || !!blob,
          lastReadAt: h ? h.lastReadAt : (rest.lastReadAt || 0),
          msRead: h ? h.msRead : (rest.msRead || 0),
          scrollRatio: h ? h.scrollRatio : (rest.scrollRatio || 0),
          lastPage: h && h.lastPage ? h.lastPage : rest.lastPage
        }
      })
      .filter(d => d.hasFile || d.url)
      .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0) || (b.updatedAt || 0) - (a.updatedAt || 0))
  }

  const getDoc = async id => {
    const record = await get(STORES.docs, id)
    if (!record) return null
    return record
  }

  /** 取文献文件本体（返回 Blob / undefined） */
  const getDocBlob = async id => {
    const row = await get(STORES.blobs, id)
    if (row && row.data) return row.data
    // 兼容：万一还有没搬完的老记录
    const legacy = await get(STORES.docs, id)
    return legacy && legacy.blob
  }

  /** 删除文献时级联清掉文件、标注、笔记与阅读历史 */
  const removeDoc = async id => {
    const anns = (await byIndex(STORES.annotations, 'docId', id)) || []
    const notes = (await byIndex(STORES.notes, 'docId', id)) || []
    for (const a of anns) await del(STORES.annotations, a.id)
    for (const n of notes) await del(STORES.notes, n.id)
    try { await del(STORES.blobs, id) } catch (_) {}
    clearHistoryCache(id)
    try { await del(STORES.history, id) } catch (_) {}
    return del(STORES.docs, id)
  }

  /* ---------------- 阅读历史 ---------------- */

  const loadHistory = async () => {
    if (historyLoaded) return
    historyLoaded = true
    try {
      const rows = (await all(STORES.history)) || []
      rows.forEach(row => historyCache.set(row.id, row))
    } catch (_) {}
  }

  /**
   * 记一次阅读快照。totals.onMs 是"本次会话新增的阅读时长"，
   * 在内存里累加；落盘时一并写入，减少事务次数。
   * @param {string} id
   * @param {{lastPage?:number, scrollRatio?:number, onMs?:number}} patch
   */
  const touchHistory = async (id, patch = {}) => {
    if (!id) return
    await loadHistory()
    const prev = historyCache.get(id) || { id, msRead: 0 }
    const record = {
      ...prev,
      id,
      lastPage: patch.lastPage != null ? patch.lastPage : prev.lastPage,
      scrollRatio: patch.scrollRatio != null ? patch.scrollRatio : prev.scrollRatio,
      msRead: (prev.msRead || 0) + (patch.onMs || 0),
      lastReadAt: Date.now()
    }
    historyCache.set(id, record)
    await put(STORES.history, record)
    return record
  }

  const getHistory = async id => {
    await loadHistory()
    return historyCache.get(id) || null
  }

  const clearHistoryCache = id => {
    if (id) {
      historyCache.delete(id)
    } else {
      historyCache.clear()
      historyLoaded = false
    }
  }

  /** 汇总：读了多久、最近在读哪几篇（给空态页做入口用） */
  const stats = async () => {
    await loadHistory()
    let msRead = 0
    historyCache.forEach(h => { msRead += h.msRead || 0 })
    return { docs: historyCache.size, msRead }
  }

  /* ---------------- 标注 ---------------- */

  /**
   * 保存标注。锚点字段（quote/prefix/suffix/occurrence）由 anchor.js 生成，
   * 保证缩放、换设备、重新打开时都能重新定位。
   * @param {{id?:string, docId:string, page:number, type:'highlight'|'underline'|'strike',
   *          color?:string, quote:string, prefix?:string, suffix?:string,
   *          occurrence?:number, note?:string}} ann
   */
  const saveAnnotation = ann => {
    const record = {
      type: 'highlight',
      color: '#ffd666',
      createdAt: Date.now(),
      ...ann,
      id: ann.id || uid('ann')
    }
    return put(STORES.annotations, record).then(() => record)
  }

  const listAnnotations = async docId => {
    const list = (await byIndex(STORES.annotations, 'docId', docId)) || []
    return list.sort((a, b) => a.page - b.page || a.createdAt - b.createdAt)
  }

  const removeAnnotation = id => del(STORES.annotations, id)

  /* ---------------- 笔记 ---------------- */

  const saveNote = note => {
    const now = Date.now()
    const record = {
      kind: 'note',
      text: '',
      ...note,
      id: note.id || uid('note'),
      createdAt: note.createdAt || now,
      updatedAt: now
    }
    return put(STORES.notes, record).then(() => record)
  }

  const listNotes = async docId => {
    const list = (await byIndex(STORES.notes, 'docId', docId)) || []
    return list.sort((a, b) => a.createdAt - b.createdAt)
  }

  const removeNote = id => del(STORES.notes, id)

  /* ---------------- 设置 ---------------- */

  const saveSetting = (key, value) => put(STORES.settings, { key, value })
  const getSetting = async (key, fallback = null) => {
    const row = await get(STORES.settings, key)
    return row ? row.value : fallback
  }

  /** 危险操作：清空全部本地数据 */
  const clearAll = async () => {
    for (const name of Object.values(STORES)) {
      await tx(name, 'readwrite', store => wrap(store.clear()))
    }
    clearHistoryCache()
  }

  window.BOOKS_STORE = Object.freeze({
    STORES,
    uid,
    saveDoc,
    listDocs,
    getDoc,
    getDocBlob,
    removeDoc,
    touchHistory,
    getHistory,
    clearHistoryCache,
    stats,
    saveAnnotation,
    listAnnotations,
    removeAnnotation,
    saveNote,
    listNotes,
    removeNote,
    saveSetting,
    getSetting,
    clearAll
  })
})()
