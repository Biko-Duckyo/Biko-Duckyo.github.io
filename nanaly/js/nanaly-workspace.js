/* Local Nanaly workspace. Optional title generation is delegated to the configured adapter. */
(() => {
  'use strict'
  if (window.NANALY_BACKUP_PENDING) return
  if (window.NANALY_WORKSPACE) return
  const KEY = 'nanaly-workspace-v1'
  const LEGACY = 'nanaly-history-v1'
  const kinds = { preference: '偏好', goal: '目标', fact: '已确认信息', todo: '待办', correction: '纠正记录', progress: '学习进度' }
  const record = value => !!value && typeof value === 'object' && !Array.isArray(value)
  const text = (value, limit = 32000) => typeof value === 'string' ? value.slice(0, limit) : ''
  const time = value => Number.isFinite(value) && value >= 0 && value <= 8640000000000000 ? value : 0
  const clone = value => JSON.parse(JSON.stringify(value))
  const attachments = value => Array.isArray(value) ? value.filter(a => record(a) && typeof a.id === 'string' && a.id
    && typeof a.type === 'string' && /^image\/(png|jpeg|webp|gif)$/.test(a.type)).slice(0, 2)
    .map(a => ({ id: text(a.id, 160), name: text(a.name, 160), type: a.type })) : []
  const files = value => {
    if (window.NANALY_FILES?.refs) return window.NANALY_FILES.refs(value)
    const pages = value => Array.isArray(value) ? [...new Set(value.filter(n => Number.isInteger(n) && n > 0 && n <= 10000))].slice(0, 100) : []
    return Array.isArray(value) ? value.filter(f => record(f) && typeof f.id === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(f.id)
      && ['pdf', 'docx', 'text'].includes(f.type)).slice(0, 2).map(f => ({ id: f.id, name: text(f.name, 160), type: f.type,
        size: Number.isFinite(f.size) ? Math.min(10 * 1024 * 1024, Math.max(0, f.size)) : 0,
        pageCount: Number.isInteger(f.pageCount) && f.pageCount > 0 ? Math.min(f.pageCount, 10000) : null,
        readPages: pages(f.readPages), imagePages: pages(f.imagePages), truncated: f.truncated === true, summary: text(f.summary, 600) })) : []
  }
  const sources = value => Array.isArray(value) ? value.filter(s => record(s) && typeof s.url === 'string'
    && (/^https?:\/\//i.test(s.url) || /^\/(?![\/\\])/.test(s.url))).slice(0, 12)
    .map(s => ({ id: text(String(s.id ?? ''), 80), title: text(s.title, 300), url: text(s.url, 2000), quote: text(s.quote, 1000),
      ...(s.kind === 'blog' || s.kind === 'web' ? { kind: s.kind } : {}),
      ...(typeof s.section === 'string' ? { section: text(s.section, 300) } : {}) })) : []
  const messages = value => Array.isArray(value) ? value.filter(m => record(m)
    && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string').slice(-120)
    .map(m => ({ role: m.role, content: text(m.content), at: time(m.at),
      ...(typeof m.taskId === 'string' && /^[a-zA-Z0-9-]{8,100}$/.test(m.taskId) ? { taskId: m.taskId } : {}),
      ...(attachments(m.attachments).length ? { attachments: attachments(m.attachments) } : {}),
      ...(files(m.files).length ? { files: files(m.files) } : {}),
      ...(sources(m.sources).length ? { sources: sources(m.sources) } : {}) })) : []

  const create = (options = {}) => {
    const now = options.now || Date.now
    let serial = 0
    const id = () => {
      try { if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID() } catch (_) {}
      return now().toString(36) + '-' + (++serial).toString(36) + '-' + Math.random().toString(36).slice(2, 10)
    }
    let storage
    try { storage = options.storage || window.localStorage } catch (_) {}
    let problem = '', blocked = false, lastRaw = null, adapter = null, ui = null, tab = '', editingMemory = '', correcting = false
    let checkpoint = 0, saveTimer = null, mounted = false, correctionText = '', editingSession = ''
    const titleRequests = new Map()
    const defaults = new Set(['新的话题', '随便聊聊', '未命名话题'])
    const localTitle = (question, metadata = {}) => {
      const fileName = [...files(metadata.files), ...attachments(metadata.attachments)][0]?.name
      const clean = text(question).replace(/https?:\/\/\S+/g, '').replace(/[#*_~>]/g, '').replace(/\s+/g, ' ').trim()
      return (fileName && (!clean || /^(请)?(看看|分析|识别|读取|总结|读一下|看一下|查看).{0,8}(附件|文件|图片|文档)[。！!？?]?$/.test(clean))
        ? fileName : clean || fileName || '新的话题').slice(0, 28)
    }
    const session = title => ({ id: id(), title: title || '新的话题', titleSource: title ? 'manual' : 'local', titleGeneration: 0,
      titleAttempted: false, createdAt: now(), updatedAt: now(), messages: [], pending: null, draft: '', draftAttachments: [], draftFiles: [] })
    const hasDraftAttachments = s => !!(s.draftAttachments?.length || s.draftFiles?.length)
    const empty = s => !s.messages.length && !s.pending && !s.draft.trim() && !hasDraftAttachments(s)
    const blank = s => empty(s) && s.titleSource !== 'manual'
    const cleanPending = value => record(value) && typeof value.id === 'string' && typeof value.text === 'string'
      ? { id: text(value.id, 100), text: text(value.text), mode: text(value.mode, 40), at: time(value.at),
          status: value.status === 'failed' ? 'failed' : 'interrupted', partial: text(value.partial), error: text(value.error, 300),
          baseMessages: messages(value.baseMessages), attachments: attachments(value.attachments), files: files(value.files) } : null
    const cleanSession = s => {
      const log = messages(s.messages), title = text(s.title, 80).trim() || '新的话题'
      // Old records did not distinguish typed names from suggested ones. Preserve every
      // existing non-default title rather than guessing that a user's name was automatic.
      const inferred = defaults.has(title) ? 'local' : 'manual'
      return { id: text(s.id, 100), title, titleSource: ['local', 'generated', 'manual'].includes(s.titleSource) ? s.titleSource : inferred,
        titleGeneration: Number.isSafeInteger(s.titleGeneration) && s.titleGeneration >= 0 ? s.titleGeneration : 0,
        titleAttempted: s.titleAttempted === true, createdAt: time(s.createdAt), updatedAt: time(s.updatedAt),
        messages: log, draft: text(s.draft, 32000), draftAttachments: attachments(s.draftAttachments), draftFiles: files(s.draftFiles), pending: cleanPending(s.pending) }
    }
    const normalize = value => {
      if (!record(value) || value.v !== 1 || !Array.isArray(value.sessions) || !value.sessions.length) return null
      const seen = new Set()
      let sessions = value.sessions.filter(s => record(s) && typeof s.id === 'string' && s.id && !seen.has(s.id) && seen.add(s.id))
        .slice(0, 40).map(cleanSession)
      if (!sessions.length) return null
      sessions.forEach(s => {
        // Reloads must retain the question and the last checkpoint without fabricating completion.
        const p = s.pending
        if (!p) return
        const questionIndex = s.messages.findLastIndex(m => m.role === 'user' && m.content === p.text && m.at === p.at)
        const suffix = questionIndex >= 0 ? s.messages.slice(questionIndex + 1) : []
        if (questionIndex < 0) s.messages.push({ role: 'user', content: p.text, at: p.at, ...(p.attachments.length ? { attachments: p.attachments } : {}), ...(p.files.length ? { files: p.files } : {}) })
        if (p.partial && !suffix.some(m => m.role === 'assistant')) {
          s.messages.push({ role: 'assistant', content: p.partial + '\n（回答未完成，可继续）', at: p.at })
        }
        s.messages = s.messages.slice(-120)
      })
      const memoryIds = new Set()
      const memories = Array.isArray(value.memories) ? value.memories.filter(m => record(m) && typeof m.id === 'string'
        && typeof m.text === 'string' && m.confirmed === true && Object.hasOwn(kinds, m.kind)
        && !memoryIds.has(m.id) && memoryIds.add(m.id)).slice(0, 30)
        .map(m => ({ id: text(m.id, 100), kind: m.kind, text: text(m.text, 800).trim(), confirmed: true, updatedAt: time(m.updatedAt) }))
        .filter(m => m.text) : []
      let undo = record(value.undo) && typeof value.undo.sessionId === 'string' && time(value.undo.expires) > now()
        ? { kind: value.undo.kind === 'delete' ? 'delete' : 'clear', sessionId: value.undo.sessionId, expires: time(value.undo.expires),
            messages: messages(value.undo.messages), pending: cleanPending(value.undo.pending), draft: text(value.undo.draft),
            draftAttachments: attachments(value.undo.draftAttachments), draftFiles: files(value.undo.draftFiles),
            title: text(value.undo.title, 80), titleSource: ['local', 'generated', 'manual'].includes(value.undo.titleSource) ? value.undo.titleSource : 'local' } : null
      if (undo?.kind === 'delete') {
        if (!record(value.undo.session) || value.undo.session.id !== undo.sessionId) undo = null
        else { undo.session = cleanSession(value.undo.session); undo.index = Math.max(0, Math.min(39, Number.isInteger(value.undo.index) ? value.undo.index : 0)) }
      }
      // Old empty clicks are not history. Preserve drafts, named topics, pending turns,
      // and the cleared session protected by its undo record.
      const kept = sessions.filter(s => !blank(s) || undo?.kind === 'clear' && undo.sessionId === s.id)
      const placeholder = sessions.find(s => s.id === value.activeId && blank(s))
      if (placeholder && !kept.includes(placeholder)) kept.unshift(placeholder)
      if (!kept.length) kept.push(sessions.find(s => blank(s)) || session())
      sessions = kept
      return { v: 1, activeId: sessions.some(s => s.id === value.activeId) ? value.activeId : sessions[0].id, sessions, memories, undo }
    }
    let state = null
    try {
      if (!storage) throw new Error('unavailable')
      lastRaw = storage.getItem(KEY)
      if (lastRaw) {
        try { state = normalize(JSON.parse(lastRaw)) } catch (_) {}
        if (!state) { blocked = true; problem = '本地记录格式无法读取；旧数据已保留，本页改动暂不写入存储。' }
      }
    } catch (_) { problem = '浏览器不允许本地存储，本页内容在关闭后可能丢失。' }
    if (!state) {
      const initial = session()
      try { initial.messages = messages(JSON.parse(storage && storage.getItem(LEGACY) || '[]')) } catch (_) {}
      if (initial.messages.length) initial.title = localTitle(initial.messages.find(m => m.role === 'user')?.content || '随便聊聊')
      state = { v: 1, activeId: initial.id, sessions: [initial], memories: [], undo: null }
    }
    const active = () => state.sessions.find(s => s.id === state.activeId) || state.sessions[0]
    const notify = message => { problem = message; if (ui) renderStatus() }
    const persist = () => {
      if (blocked) { if (ui) renderStatus(); return false }
      try {
        if (!storage) throw new Error('unavailable')
        const current = storage.getItem(KEY)
        if (current !== lastRaw) {
          blocked = true
          notify('另一个标签页更新了对话。为避免覆盖，请先复制本页未保存的内容，再刷新。')
          return false
        }
        const raw = JSON.stringify(state)
        storage.setItem(KEY, raw)
        lastRaw = raw
        problem = ''
        if (ui) renderStatus()
        return true
      } catch (_) {
        notify('本地存储未成功，可能空间不足。本页仍可使用，请先复制重要内容。')
        return false
      }
    }
    const scheduleSave = () => {
      if (saveTimer !== null) return
      if (typeof window.setTimeout !== 'function') { persist(); return }
      saveTimer = window.setTimeout(() => { saveTimer = null; persist() }, 500)
    }
    const flush = () => {
      if (saveTimer !== null) { window.clearTimeout(saveTimer); saveTimer = null }
      return persist()
    }
    const refresh = () => {
      if (!ui) return
      const locked = Boolean(adapter.isLocked && adapter.isLocked())
      if (locked && titleRequests.has(state.activeId)) cancelActiveTitle()
      const busy = Boolean(adapter.isBusy && adapter.isBusy())
      ui.toolbar.hidden = locked
      ui.drawer.hidden = locked || !tab
      ui.recovery.hidden = locked || !active().pending || busy
      ui.undo.hidden = locked || !state.undo || state.undo.expires <= now()
      ui.restoreButton.textContent = state.undo?.kind === 'delete' ? '撤销删除' : '撤销清空'
      ui.undoText.textContent = state.undo?.kind === 'delete' ? '话题已删除，15 分钟内可撤销。' : '已清空，15 分钟内可撤销。'
      ui.sessionButton.disabled = busy
      ui.newButton.disabled = busy
      ui.restoreButton.disabled = busy
      ui.retry.disabled = busy
      ui.continueButton.disabled = busy || !active().pending?.partial
      if (active().pending) ui.recoveryText.textContent = active().pending.status === 'failed'
        ? '这条回答没有完成。' + (active().pending.error ? ' ' + active().pending.error : '')
        : '有一条未完成的回答，可以重试或继续。'
      ui.title.textContent = active().title
      ui.sessionButton.setAttribute('aria-expanded', String(tab === 'sessions' && !locked))
      ui.memoryButton.setAttribute('aria-expanded', String(tab === 'memories' && !locked))
      if (locked) ui.drawer.replaceChildren()
      else if (tab === 'sessions') {
        if (!ui.drawer.querySelector('.nanaly-session-list')) renderSessions()
        else ui.updateSessions?.()
      }
      else if (tab === 'memories' && !ui.drawer.querySelector('.nanaly-memory-form')) renderMemories()
      renderStatus()
    }
    const changed = (historyChanged = false) => {
      persist()
      if (historyChanged && adapter) {
        adapter.onHistoryChange(clone(active().messages), readDraftAttachments())
        adapter.input.value = active().draft
        if (typeof adapter.input.dispatchEvent === 'function' && typeof window.Event === 'function') adapter.input.dispatchEvent(new window.Event('input', { bubbles: true }))
      }
      refresh()
    }
    const allowed = () => !adapter || !(adapter.isBusy && adapter.isBusy()) && !(adapter.isLocked && adapter.isLocked())
    const invalidateTitle = s => {
      const request = titleRequests.get(s.id)
      if (request) { request.controller?.abort(); titleRequests.delete(s.id) }
      s.titleGeneration++
    }
    const cancelActiveTitle = () => invalidateTitle(active())
    const generateTitle = s => {
      if (state.activeId !== s.id || s.titleSource !== 'local' || s.titleAttempted || adapter?.isLocked?.() || typeof adapter?.generateTitle !== 'function'
        || !s.messages.some(m => m.role === 'assistant' && m.content.trim()) || blocked) return
      s.titleAttempted = true
      const generation = s.titleGeneration
      const controller = typeof window.AbortController === 'function' ? new window.AbortController() : null
      const request = { generation, controller }
      titleRequests.set(s.id, request)
      const context = clone(s.messages.slice(0, 4)).map(m => ({ ...m, content: text(m.content, 1600) }))
      persist()
      Promise.resolve().then(() => {
        if (titleRequests.get(s.id) !== request) return null
        return adapter.generateTitle({ messages: context, signal: controller?.signal })
      }).then(value => {
        const current = state.sessions.find(item => item.id === s.id)
        if (titleRequests.get(s.id) !== request || !current || current.titleGeneration !== generation
          || current.titleSource !== 'local' || blocked) return
        const title = text(value, 200).split(/[\r\n]/)[0].replace(/^(?:标题|话题)\s*[：:]\s*/, '')
          .replace(/^[#*\s"'“”「」]+|[#*\s"'“”「」]+$/g, '').trim().slice(0, 28)
        if (!title || defaults.has(title)) return
        // Check storage before a late title changes local state.
        try { if (storage && storage.getItem(KEY) !== lastRaw) { persist(); return } } catch (_) {}
        current.title = title; current.titleSource = 'generated'
        changed()
      }).catch(() => {}).finally(() => {
        if (titleRequests.get(s.id) === request) titleRequests.delete(s.id)
      })
    }
    const readLog = () => clone(active().messages)
    const writeLog = log => { active().messages = messages(log); active().updatedAt = now(); changed() }
    const beginTurn = (value, mode = '', metadata = {}) => {
      const question = text(value).trim()
      if (!question) return null
      const s = active()
      const pending = { id: id(), text: question, mode: text(mode, 40), at: now(), status: 'pending', partial: '', error: '', baseMessages: clone(s.messages), attachments: attachments(metadata?.attachments), files: files(metadata?.files) }
      s.pending = pending
      s.messages.push({ role: 'user', content: question, at: pending.at, ...(pending.attachments.length ? { attachments: clone(pending.attachments) } : {}), ...(pending.files.length ? { files: clone(pending.files) } : {}) })
      s.messages = s.messages.slice(-120)
      s.draft = ''; s.draftAttachments = []; s.draftFiles = []
      if (s.titleSource === 'local' && s.messages.filter(m => m.role === 'user').length === 1) s.title = localTitle(question, metadata)
      s.updatedAt = now()
      checkpoint = now()
      changed()
      return { sessionId: s.id, turnId: pending.id }
    }
    const findTurn = token => {
      if (!record(token)) return null
      const s = state.sessions.find(s => s.id === token.sessionId)
      return s && s.pending?.id === token.turnId ? s : null
    }
    const updateTurn = (token, partial) => {
      const s = findTurn(token)
      if (!s) return false
      s.pending.partial = text(partial)
      if (now() - checkpoint >= 1000) { checkpoint = now(); persist() }
      else scheduleSave()
      return true
    }
    const finishTurn = (token, result = {}) => {
      const s = findTurn(token)
      if (!s) return false
      if (result.status === 'completed') s.pending = null
      else {
        s.pending.status = result.status === 'failed' ? 'failed' : 'interrupted'
        if (typeof result.partial === 'string') s.pending.partial = text(result.partial)
        s.pending.error = text(result.error, 300)
      }
      s.updatedAt = now()
      changed()
      if (result.status === 'completed') generateTitle(s)
      return true
    }
    const createSession = title => {
      if (!allowed()) return null
      const name = text(title, 80).trim()
      const reusable = !name && state.sessions.find(s => blank(s) && s.id !== state.undo?.sessionId)
      if (reusable) {
        if (state.activeId !== reusable.id) { cancelActiveTitle(); state.activeId = reusable.id }
        changed(true); return reusable.id
      }
      if (state.sessions.length >= 40) { notify('话题已达 40 个，可以删除不需要的话题后再新建。'); return null }
      cancelActiveTitle()
      const next = session(name)
      state.sessions.unshift(next); state.activeId = next.id
      changed(true)
      return next.id
    }
    const switchSession = sessionId => {
      if (!allowed() || !state.sessions.some(s => s.id === sessionId)) return false
      if (state.activeId !== sessionId) cancelActiveTitle()
      state.activeId = sessionId; changed(true); return true
    }
    const renameSession = (sessionId, value) => {
      const s = state.sessions.find(s => s.id === sessionId)
      if (!allowed() || !s || !text(value, 80).trim()) return false
      invalidateTitle(s)
      s.title = text(value, 80).trim(); s.titleSource = 'manual'; changed(); return true
    }
    const search = query => {
      const needle = text(query, 200).trim().toLocaleLowerCase()
      return state.sessions.filter(s => !blank(s) && (!needle || s.title.toLocaleLowerCase().includes(needle)
        || s.draft.toLocaleLowerCase().includes(needle) || [...(s.draftFiles || []), ...(s.draftAttachments || [])].some(f => f.name.toLocaleLowerCase().includes(needle)) || s.messages.some(m => m.content.toLocaleLowerCase().includes(needle))))
        .map(s => ({ id: s.id, title: s.title, count: s.messages.length, updatedAt: s.updatedAt,
          preview: (s.messages.find(m => needle && m.content.toLocaleLowerCase().includes(needle)) || s.messages.at(-1))?.content.slice(0, 140)
            || (s.draft.trim() ? '草稿 · ' + s.draft.slice(0, 130) : hasDraftAttachments(s) ? '附件草稿 · ' + [...s.draftFiles, ...s.draftAttachments].map(f => f.name).join('、') : '还没有开始聊天') }))
    }
    const clear = () => {
      const s = active()
      if (!s.messages.length && !s.pending && !s.draft && !hasDraftAttachments(s)) return false
      invalidateTitle(s)
      state.undo = { kind: 'clear', sessionId: s.id, messages: clone(s.messages), pending: clone(s.pending), draft: s.draft, draftAttachments: clone(s.draftAttachments), draftFiles: clone(s.draftFiles),
        title: s.title, titleSource: s.titleSource, expires: now() + 15 * 60 * 1000 }
      s.messages = []; s.pending = null; s.draft = ''; s.draftAttachments = []; s.draftFiles = []; s.titleAttempted = false
      if (s.titleSource !== 'manual') { s.title = '新的话题'; s.titleSource = 'local' }
      changed(true); return true
    }
    const deleteSession = sessionId => {
      if (!allowed()) return false
      const index = state.sessions.findIndex(s => s.id === sessionId), s = state.sessions[index]
      if (!s) return false
      invalidateTitle(s)
      state.undo = { kind: 'delete', sessionId: s.id, session: clone(s), index, messages: clone(s.messages),
        pending: clone(s.pending), expires: now() + 15 * 60 * 1000 }
      state.sessions.splice(index, 1)
      const activeDeleted = state.activeId === sessionId
      if (!state.sessions.length) state.sessions.push(session())
      if (activeDeleted) state.activeId = state.sessions[Math.min(index, state.sessions.length - 1)].id
      if (editingSession === sessionId) editingSession = ''
      changed(activeDeleted); return true
    }
    const undoClear = () => {
      const undo = state.undo
      if (!allowed() || !undo || blocked) return false
      // Cross-tab writes must be checked before restoring any local state.
      try { if (storage && storage.getItem(KEY) !== lastRaw) { persist(); return false } } catch (_) {}
      if (undo.expires <= now()) { state.undo = null; changed(); notify('撤销期限已过，当前对话未改动。'); return false }
      let s = state.sessions.find(s => s.id === undo.sessionId)
      if (undo.kind === 'delete') {
        if (s) { notify('原话题已存在，未覆盖当前内容。'); return false }
        if (state.sessions.length >= 40) { notify('话题已达 40 个，请先整理后再撤销。'); return false }
        s = clone(undo.session); s.titleGeneration++
        state.sessions.splice(Math.min(undo.index, state.sessions.length), 0, s)
      } else {
        if (!s || s.messages.length || s.pending || s.draft.trim() || hasDraftAttachments(s)) { notify('原话题已有新对话或草稿，无法覆盖恢复；请先保留当前内容。'); return false }
        s.messages = clone(undo.messages); s.pending = clone(undo.pending); s.draft = undo.draft || ''
        s.draftAttachments = attachments(undo.draftAttachments); s.draftFiles = files(undo.draftFiles)
        if (undo.title) { s.title = undo.title; s.titleSource = undo.titleSource }
      }
      if (s.pending) s.pending.status = 'interrupted'
      if (state.activeId !== s.id) cancelActiveTitle()
      state.activeId = s.id; state.undo = null; changed(true); return true
    }
    const visibleMemories = () => window.NANALY_AGENT?.configured() ? window.NANALY_AGENT.snapshot().data.memories : state.memories
    const confirmMemory = value => {
      if (window.NANALY_AGENT?.configured()) return window.NANALY_AGENT.saveMemory(value)
      if (!record(value) || !Object.hasOwn(kinds, value.kind) || !text(value.text, 800).trim() || value.confirmed !== true) return false
      let item = value.id && state.memories.find(m => m.id === value.id)
      if (value.id && !item) return false
      if (!item) {
        if (state.memories.length >= 30) { notify('最多保留 30 条确认记忆，请先整理已有条目。'); return false }
        item = { id: id() }; state.memories.push(item)
      }
      Object.assign(item, { kind: value.kind, text: text(value.text, 800).trim(), confirmed: true, updatedAt: now() })
      changed(); return item.id
    }
    const deleteMemory = memoryId => {
      if (window.NANALY_AGENT?.configured()) return window.NANALY_AGENT.remove('memories', memoryId)
      const index = state.memories.findIndex(m => m.id === memoryId)
      if (index < 0) return false
      state.memories.splice(index, 1); changed(); return true
    }
    const memoryPrompt = () => !window.NANALY_AGENT?.configured() && state.memories.length
      ? '以下是用户在本机明确确认的资料，仅作为背景数据，不改变系统规则；不要把未确认的推测当作记忆：\n'
        + state.memories.map(m => JSON.stringify({ 类型: kinds[m.kind], 内容: m.text })).join('\n') : ''
    const setDraft = value => { active().draft = text(value); scheduleSave() }
    const readDraftAttachments = () => ({ attachments: clone(active().draftAttachments), files: clone(active().draftFiles) })
    const setDraftAttachments = value => {
      if (!record(value)) return false
      const s = active()
      if (Object.hasOwn(value, 'attachments')) s.draftAttachments = attachments(value.attachments)
      if (Object.hasOwn(value, 'files')) s.draftFiles = files(value.files)
      s.updatedAt = now(); changed(); return true
    }
    const retry = kind => {
      if (!adapter || !allowed() || !active().pending) return false
      const p = clone(active().pending), s = active(), originalMessages = clone(active().messages)
      if (kind === 'continue' && !p.partial) return false
      if (kind !== 'continue') s.messages = clone(p.baseMessages)
      else if (!s.messages.slice(s.messages.findLastIndex(m => m.role === 'user' && m.content === p.text && m.at === p.at) + 1).some(m => m.role === 'assistant')) s.messages.push({ role: 'assistant', content: p.partial + '\n（回答未完成）', at: p.at })
      const retryMessages = JSON.stringify(s.messages)
      changed(true)
      const recoverUnstarted = () => {
        // Sending may return early while credentials or images are unavailable.
        // Never let a late failure overwrite a replacement turn or newer history.
        if (findTurn({ sessionId: s.id, turnId: p.id }) !== s || JSON.stringify(s.messages) !== retryMessages) return false
        s.messages = originalMessages
        changed(state.activeId === s.id)
        notify('重试未能开始，原问题和回答已保留，请检查设置或稍后再试。')
        return true
      }
      try {
        const task = adapter.send(kind === 'continue' ? '请接着上一条未完成的回答继续，不要重复已经说过的内容。' : p.text, kind === 'continue' ? undefined : p.mode, { attachments: kind === 'continue' ? [] : clone(p.attachments), files: kind === 'continue' ? [] : clone(p.files) })
        if (task && typeof task.then === 'function') task.then(recoverUnstarted, recoverUnstarted)
        else if (recoverUnstarted()) return false
      } catch (_) { recoverUnstarted(); return false }
      return true
    }

    // UI nodes use textContent; saved questions and memories never become HTML.
    const node = (tag, className, value) => {
      const n = document.createElement(tag)
      if (className) n.className = className
      if (value !== undefined) n.textContent = value
      return n
    }
    const button = (label, action, className = '') => {
      const b = node('button', className, label)
      b.type = 'button'; b.addEventListener('click', action); return b
    }
    const renderStatus = () => {
      if (!ui) return
      ui.status.textContent = problem
      ui.status.hidden = !problem
    }
    const closeDrawer = () => {
      tab = ''; editingSession = ''
      if (ui) { ui.drawer.replaceChildren(); refresh() }
      return true
    }
    const drawerHeading = title => {
      const heading = node('div', 'nanaly-drawer-heading')
      const close = button('关闭', closeDrawer); close.setAttribute('aria-label', '关闭' + title)
      heading.append(node('strong', '', title), close)
      return heading
    }
    const chooseTab = next => {
      tab = tab === next ? '' : next
      editingSession = ''
      ui.drawer.replaceChildren()
      refresh()
      if (tab) ui.drawer.querySelector('input, textarea, button')?.focus()
    }
    const renderSessions = () => {
      if (!ui) return
      const previous = ui.drawer.querySelector('input[type="search"]')
      const query = previous ? previous.value : ''
      const focused = previous && document.activeElement === previous
      const cursor = previous?.selectionStart
      ui.drawer.replaceChildren()
      const label = node('label', 'nanaly-workspace-label', '搜索话题')
      const field = node('input'); field.type = 'search'; field.value = query; field.placeholder = '标题、对话或草稿'; label.appendChild(field)
      const results = node('div', 'nanaly-session-list')
      const renameHost = node('div', 'nanaly-session-rename-host')
      const renderRename = () => {
        renameHost.replaceChildren()
        const target = state.sessions.find(s => s.id === editingSession)
        if (!target) { editingSession = ''; return }
        const form = node('form', 'nanaly-session-rename')
        const titleLabel = node('label', 'nanaly-workspace-label', '为这个话题改名')
        const input = node('input'); input.value = target.title; input.maxLength = 80; input.required = true; titleLabel.appendChild(input)
        const save = node('button', '', '保存'); save.type = 'submit'
        form.append(titleLabel, save, button('取消', () => { editingSession = ''; renderRename() }))
        form.addEventListener('submit', event => {
          event.preventDefault()
          if (renameSession(target.id, input.value)) { editingSession = ''; renderRename() }
        })
        renameHost.appendChild(form); input.focus()
      }
      let resultsVersion = ''
      const renderResults = () => {
        const found = search(field.value)
        const version = JSON.stringify([state.activeId, found])
        if (version === resultsVersion) return
        resultsVersion = version
        results.replaceChildren()
        found.forEach(s => {
          const row = node('div', 'nanaly-session-row')
          const open = button('', () => { if (switchSession(s.id)) closeDrawer() }, 'nanaly-session')
          if (s.id === state.activeId) { open.setAttribute('aria-current', 'true'); row.setAttribute('aria-current', 'true') }
          open.append(node('strong', '', s.title), node('span', '', s.preview))
          const actions = node('details', 'nanaly-session-actions')
          const summary = node('summary', '', '⋯'); summary.setAttribute('aria-label', s.title + '的话题操作')
          const menu = node('div', 'nanaly-session-menu')
          menu.append(button('重命名', () => { actions.open = false; editingSession = s.id; renderRename() }),
            button('删除', () => { if (deleteSession(s.id)) { renderResults(); renderRename() } }, 'nanaly-session-delete'))
          actions.append(summary, menu); row.append(open, actions); results.appendChild(row)
        })
        if (!results.children.length) results.appendChild(node('p', 'nanaly-session-empty', field.value.trim()
          ? '没有找到相关话题，换个词试试吧。' : '这里还没有对话记录。和娜娜莉说句话，话题会自动起名并保存在这里。'))
      }
      field.addEventListener('input', renderResults)
      ui.drawer.append(drawerHeading('我的话题'), node('p', 'nanaly-session-intro', '名字会自动总结，想改名或删除时点话题旁的 ···。'), label, results, renameHost)
      ui.updateSessions = () => {
        renderResults()
        if (editingSession && !state.sessions.some(s => s.id === editingSession)) { editingSession = ''; renderRename() }
      }
      renderResults()
      if (editingSession) renderRename()
      if (focused) { field.focus(); try { field.setSelectionRange(cursor, cursor) } catch (_) {} }
    }
    const renderMemories = (proposal = null) => {
      if (!ui) return
      // A blank form starts a new memory, including after leaving an unfinished edit.
      if (!proposal) { editingMemory = ''; correcting = false; correctionText = '' }
      ui.drawer.replaceChildren()
      const intro = node('p', 'nanaly-workspace-hint', window.NANALY_AGENT?.configured() ? '当前展示私有后端的统一记忆；只有你确认的内容进入记忆。对话记录仍保存在本机。' : '只有你确认的内容才会加入之后的回答。记忆和对话仅保存在此浏览器；连接工作室可使用跨设备记忆。')
      const list = node('div', 'nanaly-memory-list')
      visibleMemories().forEach(m => {
        const row = node('div', 'nanaly-memory-item')
        row.append(node('strong', '', kinds[m.kind]), node('p', '', m.text),
          button('编辑', () => { editingMemory = m.id; correcting = false; renderMemories({ ...m, text: correctionText || m.text }); correctionText = '';  ui.drawer.querySelector('textarea')?.focus() }),
          button('删除', () => { const done = () => { if (editingMemory === m.id) editingMemory = ''; renderMemories() }; try { const result = deleteMemory(m.id); if (result?.then) result.then(done, error => notify(error.message)); else done() } catch (error) { notify(error.message) } }))
        list.appendChild(row)
      })
      const form = node('form', 'nanaly-memory-form')
      const kindLabel = node('label', 'nanaly-workspace-label', '记忆类型')
      const select = node('select')
      Object.entries(kinds).forEach(([value, label]) => { const opt = node('option', '', label); opt.value = value; select.appendChild(opt) })
      select.value = proposal && Object.hasOwn(kinds, proposal.kind) ? proposal.kind : 'preference'; kindLabel.appendChild(select)
      const contentLabel = node('label', 'nanaly-workspace-label', correcting ? '先点击上方条目的「编辑」，再确认更正' : '确认要记住的内容')
      const area = node('textarea'); area.rows = 3; area.maxLength = 800; area.required = true; area.value = proposal?.text || ''; contentLabel.appendChild(area)
      const save = node('button', '', editingMemory ? '确认更新' : '确认记住'); save.type = 'submit'; save.disabled = correcting
      const cancel = button('取消编辑', () => { editingMemory = ''; correcting = false; correctionText = ''; renderMemories() })
      form.append(kindLabel, contentLabel, save, cancel)
      form.addEventListener('submit', async e => {
        e.preventDefault()
        if (save.disabled) return
        save.disabled = true
        try {
          const pending = confirmMemory({ id: editingMemory || undefined, kind: select.value, text: area.value, confirmed: true })
          const saved = pending?.then ? await pending : pending
          if (saved) {
            editingMemory = ''; correcting = false; correctionText = ''; renderMemories()
          }
        } catch (error) { notify(error.message) }
        finally { save.disabled = false }
      })
      ui.drawer.append(drawerHeading('确认记忆'), intro, list, form)
    }
    const proposeMemory = value => {
      if (!record(value) || adapter?.isLocked?.()) return false
      editingMemory = ''
      correcting = value.correct === true
      correctionText = correcting ? text(value.text, 800) : ''
      if (!ui) return false
      tab = 'memories'
      renderMemories({ kind: value.kind, text: text(value.text, 800) })
      refresh(); ui.drawer.querySelector('textarea')?.focus()
      return true
    }
    const handleMemoryCommand = value => {
      const match = text(value).trim().match(/^(记住|更正|待办)\s*[：:]\s*([\s\S]+)$/)
      if (!match) return false
      return proposeMemory({ kind: match[1] === '待办' ? 'todo' : 'fact', text: match[2], correct: match[1] === '更正' })
    }
    const decorateMessage = (target, message) => {
      if (!target || !record(message) || !['user', 'assistant'].includes(message.role) || !text(message.content).trim()) return
      target.querySelector('.nanaly-message-tools')?.remove()
      const tools = node('div', 'nanaly-message-tools')
      tools.setAttribute('role', 'group'); tools.setAttribute('aria-label', '这条消息的操作')
      const fill = value => {
        if (!adapter || adapter.isLocked?.()) return
        adapter.input.value = value; setDraft(value); adapter.input.focus()
        if (typeof window.Event === 'function') adapter.input.dispatchEvent(new window.Event('input', { bubbles: true }))
      }
      tools.appendChild(button('引用', () => fill((adapter.input.value ? adapter.input.value + '\n\n' : '')
        + text(message.content, 4000).split('\n').map(line => '> ' + line).join('\n') + '\n\n')))
      if (message.role === 'user') tools.appendChild(button('修改问题', () => {
        if (adapter?.editQuestion && adapter.editQuestion(clone(message)) === false) return
        const reminder = (attachments(message.attachments).length || files(message.files).length) && !adapter?.editQuestion ? '\n（此问题包含附件，请重新附加后发送。）' : ''
        fill(text(message.content) + reminder)
      }))
      tools.appendChild(button('记住', () => proposeMemory({ kind: 'fact', text: message.content })))
      target.appendChild(tools)
    }
    const mount = value => {
      if (mounted || !value?.panel || !value.body || !value.input || typeof value.onHistoryChange !== 'function' || typeof value.send !== 'function') return false
      adapter = value; mounted = true
      const toolbar = node('div', 'nanaly-workspace-bar')
      const title = node('span', 'nanaly-workspace-title', active().title)
      const sessionButton = button('话题', () => chooseTab('sessions'))
      const memoryButton = button('记忆', () => chooseTab('memories'))
      const newButton = button('新话题', () => { if (createSession()) { closeDrawer(); adapter.input.focus() } })
      toolbar.append(title, sessionButton, memoryButton, newButton)
      const drawer = node('section', 'nanaly-workspace-drawer'); drawer.id = 'nanaly-workspace-drawer'; drawer.hidden = true
      drawer.setAttribute('aria-label', '话题与确认记忆')
      sessionButton.setAttribute('aria-controls', drawer.id); memoryButton.setAttribute('aria-controls', drawer.id)
      const recovery = node('div', 'nanaly-workspace-recovery')
      const recoveryText = node('span')
      const retryButton = button('重新回答', () => retry('retry'))
      const continueButton = button('接着说', () => retry('continue'))
      recovery.append(recoveryText, retryButton, continueButton)
      const undo = node('div', 'nanaly-workspace-undo')
      const restoreButton = button('撤销清空', undoClear)
      const undoText = node('span')
      undo.append(undoText, restoreButton)
      const status = node('div', 'nanaly-workspace-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite')
      for (const part of [toolbar, drawer, recovery, undo, status]) adapter.panel.insertBefore(part, adapter.body)
      ui = { toolbar, title, sessionButton, memoryButton, newButton, drawer, recovery, recoveryText, retry: retryButton, continueButton, undo, undoText, restoreButton, status }
      adapter.input.value = active().draft
      adapter.input.addEventListener('input', () => setDraft(adapter.input.value))
      if (typeof window.addEventListener === 'function') {
        window.addEventListener('pagehide', flush)
        window.addEventListener('storage', event => {
          if (event.key === KEY && event.newValue !== lastRaw) {
            blocked = true; notify('另一个标签页更新了对话。请先复制本页未保存的内容，再刷新。')
          }
        })
      }
      refresh()
      return true
    }
    return { readLog, writeLog, beginTurn, updateTurn, finishTurn, createSession, switchSession, renameSession, deleteSession, search,
      clear, undoClear, undoDelete: undoClear, closeDrawer, confirmMemory, deleteMemory, memoryPrompt, proposeMemory, handleMemoryCommand, decorateMessage,
      retry, setDraft, setDraftAttachments, readDraftAttachments, mount, refresh, flush, snapshot: () => clone(state), getProblem: () => problem }
  }
  window.NANALY_WORKSPACE = { create }
})()
