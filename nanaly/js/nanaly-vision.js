/* 图片只在本机保存；发送问题时才传给配置的视觉服务。 */
(() => {
  'use strict'
  if (window.NANALY_BACKUP_PENDING) return
  if (window.NANALY_VISION) return
  const DEFAULTS = Object.freeze({ baseURL: 'https://api.siliconflow.cn/v1', model: 'Pro/moonshotai/Kimi-K2.6' })
  const MAX_FILES = 2, MAX_BYTES = 10 * 1024 * 1024
  const validRef = ref => ref && typeof ref.id === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(ref.id)
  const refs = items => (Array.isArray(items) ? items : []).filter(validRef).slice(0, MAX_FILES)
    .map(x => ({ id: x.id, name: String(x.name || '图片').slice(0, 160), type: 'image/jpeg' }))
  const validImage = (item, id) => item && item.id === id && item.type === 'image/jpeg'
    && typeof item.dataURL === 'string' && item.dataURL.length <= 2600000
    && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(item.dataURL)
  const memory = new Map(), pending = new Map()
  // 内存缓存的上限。真正该当闸的是字节数：截图压完通常几百 KB，条数卡太死会让
  // 长话题里的旧图反复回存储里取。条数只用来兜住「很多张极小的图」。
  const MEM = Object.freeze({ count: 64, bytes: 24 * 1024 * 1024 })
  const sizeOf = item => item?.dataURL?.length || 0
  let memoryBytes = 0
  let database
  const openDB = () => {
    if (!database) {
      let failed = false
      const job = new Promise((resolve, reject) => {
        if (!window.indexedDB) return reject(new Error('浏览器不支持图片存储'))
        const request = indexedDB.open('nanaly-images-v1', 1)
        const fail = error => { failed = true; reject(error) }
        request.onupgradeneeded = () => request.result.createObjectStore('images', { keyPath: 'id' })
        request.onsuccess = () => {
          const db = request.result
          // A blocked open may succeed after its caller has already retried.
          if (failed) { db.close(); return }
          const invalidate = () => { if (database === job) database = null }
          db.onversionchange = () => { invalidate(); db.close() }
          db.onclose = invalidate
          resolve(db)
        }
        request.onerror = () => fail(request.error)
        request.onblocked = () => fail(new Error('图片存储被其他标签页占用'))
      }).catch(error => { if (database === job) database = null; throw error })
      database = job
    }
    return database
  }
  const transact = async (mode, work) => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('images', mode), request = work(tx.objectStore('images'))
      tx.oncomplete = () => resolve(request.result)
      tx.onerror = tx.onabort = () => reject(tx.error || new Error('图片存储失败'))
    })
  }
  const drop = id => {
    const cached = memory.get(id)
    if (!cached) return
    memoryBytes -= sizeOf(cached); memory.delete(id)
  }
  /* 命中也要把条目挪到队尾。原来只在写入时排序，于是反复用到的那几张
   * 会因为「进得早」被先淘汰，历史越长命中率越低。 */
  const touch = item => {
    if (!item || typeof item.id !== 'string') return item
    drop(item.id)
    memory.set(item.id, item); memoryBytes += sizeOf(item)
    for (const [id, cached] of memory) {
      if (memory.size <= MEM.count && memoryBytes <= MEM.bytes) break
      // temporary 的条目只存在于内存里（IndexedDB 写失败），淘汰它就是丢图片。
      if (!cached.temporary && id !== item.id) drop(id)
    }
    if (memory.size > MEM.count || memoryBytes > MEM.bytes) {
      drop(item.id)
      if (item.temporary) throw new Error('本机图片暂存已满，已有图片仍保留；请启用浏览器存储后重试')
    }
    return item
  }
  const load = async id => {
    if (memory.has(id)) return touch(memory.get(id))
    // 渲染历史和构造模型输入会各读一次同一张，合并成一次事务。
    if (pending.has(id)) return pending.get(id)
    const job = (async () => {
      let item = null
      try { item = await transact('readonly', store => store.get(id)) } catch (_) { item = null }
      // 读取途中可能被 remove() 删掉。那就不该再把它放回内存，否则删过的又活了。
      if (pending.get(id) !== job || !validImage(item, id)) return null
      return touch(item)
    })()
    pending.set(id, job)
    try { return await job } finally { if (pending.get(id) === job) pending.delete(id) }
  }
  const remove = async id => {
    drop(id); pending.delete(id)
    try { await transact('readwrite', store => store.delete(id)) } catch (_) {}
  }
  // Clear only images no longer referenced by any topic, pending retry or undo record.
  const prune = async (state, draft = []) => {
    const keep = new Set(refs(draft).map(x => x.id))
    const seen = new WeakSet()
    const scan = value => {
      if (!value || typeof value !== 'object' || seen.has(value)) return
      seen.add(value)
      if (Array.isArray(value.attachments)) refs(value.attachments).forEach(x => keep.add(x.id))
      if (Array.isArray(value.draftAttachments)) refs(value.draftAttachments).forEach(x => keep.add(x.id))
      Object.values(value).forEach(v => { if (v && typeof v === 'object') scan(v) })
    }
    scan(state)
    // Another tab may have added references after this tab loaded. Uncertain storage means no deletion.
    try {
      const raw = window.localStorage?.getItem('nanaly-workspace-v1')
      const persisted = raw ? JSON.parse(raw) : null
      const validSession = session => session && typeof session === 'object' && !Array.isArray(session)
        && typeof session.id === 'string' && session.id && Array.isArray(session.messages)
        && session.messages.every(m => m && typeof m === 'object' && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
      if (!persisted || persisted.v !== 1 || !Array.isArray(persisted.sessions) || !persisted.sessions.length
          || !persisted.sessions.every(validSession)) return
      scan(persisted)
    } catch (_) { return }
    try {
      const items = await transact('readonly', store => store.getAll())
      for (const item of items || []) {
        if (!keep.has(item.id) && Date.now() - item.at > 3600000) await remove(item.id)
      }
      // IndexedDB retains history, the live heap only needs a few previews.
    } catch (_) {}
  }
  const validateFile = file => {
    if (!file || !/^image\/(?:png|jpeg|webp)$/.test(file.type)) throw new Error('支持 PNG、JPEG、WebP 静态图片')
    if (!Number.isSafeInteger(file.size) || file.size <= 0 || file.size > MAX_BYTES) throw new Error('每张图片请控制在 10 MB 以内')
  }
  const prepare = async file => {
    validateFile(file)
    const url = URL.createObjectURL(file)
    const img = new Image()
    try {
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error('无法读取这张图片')); img.src = url })
      if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 40000000)
        throw new Error('图片尺寸过大，请先裁剪需要提问的部分')
      const scale = Math.min(1, 2560 / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('浏览器无法处理图片')
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      // 重新编码同时去掉相机定位等元数据。
      let dataURL = canvas.toDataURL('image/jpeg', 0.9)
      if (dataURL.length > 2200000) dataURL = canvas.toDataURL('image/jpeg', 0.72)
      if (dataURL.length > 2600000) throw new Error('图片压缩后仍然过大，请裁剪后再试')
      const item = { id: crypto.randomUUID(), name: String(file.name || '粘贴的图片').slice(0, 160), type: 'image/jpeg', dataURL, at: Date.now() }
      // 此时调用者还没拿到 id，局部变量会保住写入中的数据。只在写入失败后
      // 才将它加入不可淘汰的暂存，避免旧暂存满额时连成功落盘的新图也被阻止。
      try { await transact('readwrite', store => store.put({ ...item })) } catch (_) { item.temporary = true }
      touch(item)
      return item
    } finally { URL.revokeObjectURL(url) }
  }
  const imageContent = async (text, attachments, { strict = true } = {}) => {
    const content = [{ type: 'text', text: String(text || '请分析这张图片。') }]
    for (const ref of refs(attachments)) {
      const item = await load(ref.id)
      if (!item || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(item.dataURL || '')) {
        if (strict) throw new Error('图片「' + ref.name + '」已不在本机，请重新附加后发送。')
        content[0].text += '\n（历史图片「' + ref.name + '」已丢失，不能假装看过。）'
      } else content.push({ type: 'image_url', image_url: { url: item.dataURL, detail: 'high' } })
    }
    return content.length === 1 ? content[0].text : content
  }
  const decorate = async (node, attachments) => {
    if (!refs(attachments).length || node.querySelector('.nanaly-image-history')) return
    const wrap = document.createElement('div')
    wrap.className = 'nanaly-image-history'
    node.prepend(wrap)
    for (const ref of refs(attachments)) {
      const item = await load(ref.id)
      if (!node.isConnected) return
      if (item) {
        const img = document.createElement('img')
        img.src = item.dataURL; img.alt = ref.name; img.loading = 'lazy'
        wrap.appendChild(img)
      } else {
        const label = document.createElement('span')
        label.textContent = '图片已不可用：' + ref.name
        wrap.appendChild(label)
      }
    }
  }
  const mount = ({ panel, input, isBusy, isChat, notify, onChange = () => {} }) => {
    let attachments = [], loading = false, revision = 0
    const tray = document.createElement('div')
    tray.className = 'nanaly-image-tray'
    tray.setAttribute('aria-label', '待发送图片')
    const foot = panel.querySelector('.nanaly-foot')
    foot.before(tray)
    const button = document.createElement('button')
    button.className = 'nanaly-attach'; button.type = 'button'; button.textContent = '＋'
    button.title = '附加图片（也可粘贴或拖入）'; button.setAttribute('aria-label', button.title)
    const picker = document.createElement('input')
    picker.type = 'file'; picker.accept = 'image/png,image/jpeg,image/webp'; picker.multiple = true; picker.hidden = true
    foot.prepend(button, picker)
    const render = () => {
      tray.replaceChildren()
      attachments.forEach(item => {
        const chip = document.createElement('span'), img = document.createElement('img'), del = document.createElement('button')
        img.src = item.dataURL; img.alt = item.name
        chip.title = item.name
        del.type = 'button'; del.textContent = '×'; del.setAttribute('aria-label', '移除图片：' + item.name)
        del.onclick = () => { attachments = attachments.filter(x => x.id !== item.id); onChange(refs(attachments)); render() }
        chip.append(img, del); tray.append(chip)
      })
      tray.hidden = !isChat() || !attachments.length
      button.disabled = loading || isBusy() || !isChat()
      tray.querySelectorAll('button').forEach(b => { b.disabled = isBusy() || !isChat() })
    }
    const add = async files => {
      if (loading || isBusy() || !isChat()) return
      const items = [...files]
      if (items.length + attachments.length > MAX_FILES) return notify('一次最多附加 2 张图片，可先裁剪需要提问的区域。')
      loading = true; const current = revision; render()
      try {
        for (const file of items) {
          const item = await prepare(file)
          if (current !== revision) { await remove(item.id); break }
          attachments.push(item); onChange(refs(attachments))
          if (item.temporary) notify('浏览器未能持久保存图片；刷新前可以发送，刷新后需重新附加。')
        }
      } catch (error) { if (current === revision) notify(error.message) }
      finally { if (current === revision) loading = false; render() }
    }
    button.onclick = () => picker.click()
    picker.onchange = () => { add(picker.files); picker.value = '' }
    input.addEventListener('paste', event => {
      const files = [...(event.clipboardData?.items || [])].filter(x => x.kind === 'file').map(x => x.getAsFile()).filter(file => file && /^image\//.test(file.type))
      if (files.length) { event.preventDefault(); add(files) }
    })
    panel.addEventListener('dragover', event => { if ([...(event.dataTransfer?.types || [])].includes('Files')) event.preventDefault() })
    panel.addEventListener('drop', event => {
      const images = [...(event.dataTransfer?.files || [])].filter(file => /^image\//.test(file.type))
      if (images.length) { event.preventDefault(); add(images) }
    })
    render()
    return {
      refs: () => refs(attachments),
      loading: () => loading,
      take: ({ silent = false } = {}) => { const out = refs(attachments); attachments = []; if (!silent) onChange([]); render(); return out },
      clear: ({ silent = false } = {}) => { revision++; loading = false; attachments = []; if (!silent) onChange([]); render() },
      restore: async (list, { silent = false } = {}) => {
        if (isBusy() || loading) return
        loading = true; const current = ++revision; render()
        try {
          const recovered = []
          for (const ref of refs(list)) {
            const item = await load(ref.id)
            if (!item) throw new Error('原图片已不可用，请重新附加：' + ref.name)
            recovered.push(item)
          }
          if (current === revision) {
            attachments = recovered
            if (!silent) onChange(refs(attachments))
          }
        } catch (error) { if (current === revision) notify(error.message) }
        finally { if (current === revision) loading = false; render() }
      },
      refresh: render,
      decorate, imageContent
    }
  }
  window.NANALY_VISION = Object.freeze({ DEFAULTS, refs, validateFile, imageContent, decorate, prune, mount })
})()
