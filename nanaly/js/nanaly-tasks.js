/* Explicitly requested article checks. No chat text or credential is persisted.
 * GitHub dispatch requires the owner's existing unlocked vault and Actions access.
 * Without that access the fallback reports only what this browser can verify. */
(() => {
  if (window.NANALY_BACKUP_PENDING) return
  if (window.NANALY_TASKS) return
  const REPO = window.NOIMPTY_SCHEDULE_REPO || 'Noimpty-zby/Noimpty-zby.github.io'
  const WORKFLOW = 'nanaly-article-check.yml'
  // Keep already-issued Pages reports readable during the custom-domain migration.
  const RESULT_ORIGINS = new Set(['https://noimpty-zby.cn', 'https://noimpty-zby.github.io'])
  const API = `https://api.github.com/repos/${REPO}`
  const tasks = new Map()
  const active = new Map()
  const STORAGE = 'nanaly.article-tasks.v1'
  const uuid = value => /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(value || '')
  const session = value => typeof value === 'string' && value.length <= 128 && !/[\u0000-\u001f]/.test(value) ? value : ''
  // Only bounded task routing metadata survives reload. Credentials, article
  // contents, result URLs and chat text are never copied into this store.
  const metadata = value => {
    if (!value || value.repo !== REPO || !uuid(value.id) || typeof value.path !== 'string'
      || !/^\/\d{4}\/\d{2}\/\d{2}\/[^/?#\\]+\/$/.test(value.path) || value.path.length > 512
      || /[\u0000-\u001f]/.test(value.path) || !['github', 'browser'].includes(value.mode)
      || !['preparing', 'dispatching', 'queued', 'running', 'waiting', 'completed', 'failed', 'cancelled'].includes(value.state)
      || !Number.isFinite(Date.parse(value.startedAt)) || !Number.isFinite(Date.parse(value.updatedAt))) return null
    const entries = window.NOIMPTY_PRIVACY?.entries
    if (!Array.isArray(entries) || !entries.some(entry => { try { return decodeURIComponent(entry.path) === value.path } catch (_) { return false } })) return null
    const row = { repo: REPO, id: value.id, kind: 'article-links', path: value.path, mode: value.mode,
      state: value.state, sessionId: session(value.sessionId), startedAt: value.startedAt, updatedAt: value.updatedAt,
      canRefresh: value.mode === 'github' && value.canRefresh === true }
    if (Number.isSafeInteger(value.runId) && value.runId > 0) {
      row.runId = value.runId
      row.runUrl = `https://github.com/${REPO}/actions/runs/${row.runId}`
    }
    if (/^[a-f\d]{40}$/i.test(value.expectedSHA || '')) row.expectedSHA = value.expectedSHA
    return row
  }
  const persist = () => {
    try {
      const rows = [...tasks.values()].map(task => metadata({ ...task, repo: REPO })).filter(Boolean)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 10)
      window.localStorage?.setItem(STORAGE, JSON.stringify({ v: 1, tasks: rows }))
    } catch (_) { /* Unavailable storage must not interrupt an explicit check. */ }
  }
  try {
    const raw = window.localStorage?.getItem(STORAGE)
    const saved = raw && raw.length <= 32768 ? JSON.parse(raw) : null
    if (saved?.v === 1 && Array.isArray(saved.tasks)) for (const value of saved.tasks.slice(0, 10)) {
      const task = metadata(value)
      if (!task) continue
      task.recovered = true
      if (task.canRefresh) {
        task.state = 'waiting'
        task.message = '已恢复后台任务记录；尚未重新核验结果，请刷新任务状态'
      } else {
        if (['preparing', 'dispatching', 'queued', 'running', 'waiting'].includes(task.state)) task.state = 'cancelled'
        task.message = task.state === 'completed' ? '上次检查已完成；详细结果请查看原会话记录' : '上次检查已结束或中断；恢复记录不会重新派发任务'
      }
      tasks.set(task.id, task)
    }
  } catch (_) { /* Malformed or inaccessible local state is not executable. */ }
  const recover = (id, { sessionId } = {}) => {
    const task = tasks.get(id)
    if (!task || sessionId !== undefined && task.sessionId !== session(sessionId)) return null
    return structuredClone(task)
  }
  const list = ({ sessionId } = {}) => [...tasks.values()]
    .filter(task => sessionId === undefined || task.sessionId === session(sessionId))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 10).map(task => structuredClone(task))
  const pathOf = value => {
    let path
    try {
      const url = new URL(String(value || location.pathname), location.origin)
      if (url.origin !== location.origin || url.search || url.hash || url.username || url.password) throw new Error()
      path = decodeURIComponent(url.pathname)
    } catch (_) { throw new Error('请在一篇已发布文章中检查本文链接') }
    if (!/^\/\d{4}\/\d{2}\/\d{2}\/[^/?#\\]+\/$/.test(path) || path.length > 512) throw new Error('此操作只支持已发布文章')
    const entries = window.NOIMPTY_PRIVACY?.entries
    if (!Array.isArray(entries) || !entries.some(entry => {
      try { return decodeURIComponent(entry.path) === path } catch (_) { return false }
    })) throw new Error('文章不在本站已发布清单中')
    if (window.NOIMPTY_GATE && !window.NOIMPTY_GATE.unlocked()) throw new Error('请先解锁文章，再检查链接')
    return path
  }
  const credential = () => {
    try { return window.NANALY?.githubToken?.() || '' } catch (_) { return '' }
  }
  const abortError = signal => signal?.reason || new DOMException('已停止等待任务', 'AbortError')
  const abortCheck = signal => { if (signal?.aborted) throw abortError(signal) }
  const delay = (ms, signal) => new Promise((resolve, reject) => {
    abortCheck(signal)
    const end = () => { signal?.removeEventListener('abort', cancel); resolve() }
    const timer = window.setTimeout(end, ms)
    const cancel = () => { window.clearTimeout(timer); signal?.removeEventListener('abort', cancel); reject(abortError(signal)) }
    signal?.addEventListener('abort', cancel, { once: true })
  })
  const request = async (url, init = {}, signal, timeout = 15000) => {
    abortCheck(signal)
    const controller = new AbortController()
    const cancel = () => controller.abort(abortError(signal))
    const timer = window.setTimeout(() => controller.abort(new Error('请求超时')), timeout)
    signal?.addEventListener('abort', cancel, { once: true })
    try {
      const { discardBody, ...fetchOptions } = init
      const response = await fetch(url, { ...fetchOptions, signal: controller.signal, redirect: 'error', credentials: 'omit', cache: 'no-store' })
      if (discardBody || init.method === 'HEAD') {
        await response.body?.cancel().catch(() => {})
        return { response, text: '' }
      }
      let text = ''
      if (response.body?.getReader) {
        const reader = response.body.getReader(), decoder = new TextDecoder()
        let size = 0
        try {
          while (true) {
            const chunk = await reader.read()
            if (chunk.done) break
            size += chunk.value.byteLength
            if (size > 2 * 1024 * 1024) throw new Error('返回的数据过大，已停止读取')
            text += decoder.decode(chunk.value, { stream: true })
          }
          text += decoder.decode()
        } finally { await reader.cancel().catch(() => {}) }
      } else {
        text = await response.text()
        if (text.length > 2 * 1024 * 1024) throw new Error('返回的数据过大，已停止读取')
      }
      return { response, text }
    } finally { window.clearTimeout(timer); signal?.removeEventListener('abort', cancel) }
  }
  const github = async (path, init, signal) => {
    const token = credential()
    if (!token) { const error = new Error('GitHub 凭据已锁定或未配置'); error.status = 401; throw error }
    const { response, text } = await request(`${API}/${path}`, {
      ...init, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' }
    }, signal)
    if (!response.ok) {
      const error = new Error(`GitHub 返回 HTTP ${response.status}`)
      error.status = response.status
      const limited = response.status === 429 || response.status === 403 && (response.headers.get('x-ratelimit-remaining') === '0' || response.headers.get('retry-after') || /secondary rate limit|rate limit exceeded/i.test(text))
      if (limited) {
        const retry = Number(response.headers.get('retry-after')) * 1000
        const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000 - Date.now()
        error.retryAfter = Math.max(5000, retry || reset || 30000)
      }
      throw error
    }
    if (!text.trim()) return null
    if (text.length > 2 * 1024 * 1024) throw new Error('GitHub 返回的数据过大')
    try { return JSON.parse(text) } catch (_) { throw new Error('GitHub 返回的任务数据格式不正确') }
  }
  const update = (task, patch, onUpdate) => {
    Object.assign(task, patch, { updatedAt: new Date().toISOString() })
    tasks.set(task.id, task)
    persist()
    if (typeof onUpdate === 'function') { try { onUpdate(structuredClone(task)) } catch (_) {} }
    return structuredClone(task)
  }
  const validateResult = (result, task, run) => {
    if (!result || result.v !== 1 || result.requestId !== task.id || result.path !== task.path || result.sha !== run.head_sha
      || !Number.isFinite(Date.parse(result.at)) || !['completed', 'failed'].includes(result.state)) throw new Error('任务结果与本次请求不匹配')
    if (result.state === 'failed') return { ...result, message: String(result.message || '文章检查未完成').slice(0, 180) }
    if (!['checked', 'broken', 'unknown', 'skipped'].every(key => Number.isSafeInteger(result[key]) && result[key] >= 0)
      || result.checked > 24 || result.broken + result.unknown > result.checked || !Array.isArray(result.results)
      || result.results.length !== result.checked) throw new Error('任务结果缺少有效检查统计')
    const rows = result.results.map(row => {
      const url = new URL(row.url)
      if (!RESULT_ORIGINS.has(url.origin) || url.username || url.password || !['ok', 'broken', 'unknown'].includes(row.state)) throw new Error('任务结果包含无效检查项')
      return { url: url.href, state: row.state, status: Number.isInteger(row.status) ? row.status : null, reason: String(row.reason || '').slice(0, 160) }
    })
    if (rows.filter(row => row.state === 'broken').length !== result.broken || rows.filter(row => row.state === 'unknown').length !== result.unknown) throw new Error('任务结果统计与检查明细不一致')
    return { ...result, results: rows, scope: String(result.scope || '').slice(0, 240) }
  }
  const poll = async (task, signal, onUpdate) => {
    const deadline = Date.now() + 6 * 60000
    let misses = 0
    while (Date.now() < deadline) {
      abortCheck(signal)
      try {
        let run
        if (task.runId) run = await github(`actions/runs/${task.runId}`, {}, signal)
        else {
          const list = await github(`actions/workflows/${WORKFLOW}/runs?event=workflow_dispatch&per_page=50`, {}, signal)
          run = list?.workflow_runs?.find(row => row.display_title === `Nanaly article check ${task.id}`)
        }
        if (run) {
          if (!Number.isSafeInteger(run.id) || run.id <= 0 || !/^[a-f\d]{40}$/i.test(run.head_sha || '')
            || run.display_title !== `Nanaly article check ${task.id}` || task.runId && run.id !== task.runId
            || task.expectedSHA && run.head_sha !== task.expectedSHA) {
            const error = new Error('工作流标识或提交与本次任务不匹配'); error.terminal = true; throw error
          }
          const runUrl = `https://github.com/${REPO}/actions/runs/${run.id}`
          update(task, { runId: run.id, runUrl, expectedSHA: run.head_sha, state: run.status === 'queued' ? 'queued' : 'running', message: '后台正在检查本文的站内链接与图片' }, onUpdate)
          if (run.status === 'completed') {
            const checks = await github(`commits/${run.head_sha}/check-runs?check_name=nanaly-article-${task.id}&filter=all&per_page=20`, {}, signal)
            const check = checks?.check_runs?.find(row => row.external_id === task.id && row.status === 'completed' && row.head_sha === run.head_sha)
            if (check) {
              let result
              try { result = validateResult(JSON.parse(check.output.text), task, run) }
              catch (error) { error.terminal = true; throw error }
              return update(task, { state: result.state, result, message: result.state === 'failed' ? result.message
                : `已检查 ${result.checked} 项：坏链 ${result.broken} 项，待确认 ${result.unknown} 项，未检查 ${result.skipped} 项` }, onUpdate)
            }
            if (run.conclusion !== 'success' || ++misses >= 3) return update(task, { state: 'failed', message: '工作流已结束，但没有可核验的检查结果，请查看任务详情' }, onUpdate)
          }
        }
        await delay(task.runId ? 10000 : 5000, signal)
      } catch (error) {
        abortCheck(signal)
        if (!error.retryAfter) throw error
        update(task, { state: 'waiting', message: 'GitHub 暂时限流，已放慢查询；尚未获得检查结论' }, onUpdate)
        if (Date.now() + error.retryAfter >= deadline) break
        await delay(error.retryAfter, signal)
      }
    }
    return update(task, { state: 'waiting', message: '暂未拿到最终结果，后台可能仍在运行；可以稍后刷新任务状态' }, onUpdate)
  }
  const browserCheck = async (task, signal, onUpdate, why) => {
    update(task, { mode: 'browser', canRefresh: false, state: 'running', message: `${why}；改为浏览器检查站内链接，未启动后台任务` }, onUpdate)
    const deadline = Date.now() + 45000
    const url = new URL(task.path, location.origin).href
    const loaded = await request(url, {}, signal, 8000)
    if (!loaded.response.ok) throw new Error(`文章读取失败：HTTP ${loaded.response.status}`)
    if (loaded.text.length > 1024 * 1024) throw new Error('文章内容过大，已停止检查')
    const article = new DOMParser().parseFromString(loaded.text, 'text/html').querySelector('#article-container')
    if (!article) throw new Error('页面没有可检查的文章正文')
    const targets = new Map()
    let skipped = 0
    article.querySelectorAll('a[href], img[src], img[data-src], img[data-lazy-src]').forEach(node => {
      const raw = node.tagName.toLowerCase() === 'a' ? node.getAttribute('href')
        : node.getAttribute('data-src') || node.getAttribute('data-lazy-src') || node.getAttribute('src')
      if (!raw || raw.startsWith('#') || /^(?:data:|mailto:|tel:)/i.test(raw)) return
      let target
      try { target = new URL(raw, url) } catch (_) { skipped++; return }
      if (target.origin !== location.origin || !/^https?:$/.test(target.protocol) || target.username || target.password) { skipped++; return }
      target.hash = ''
      if (target.href.length > 2048) { skipped++; return }
      targets.set(target.href, target.href)
    })
    skipped += Math.max(0, targets.size - 24)
    const queue = [...targets.values()].slice(0, 24), results = []
    let next = 0
    const hit = async target => {
      let response = (await request(target, { method: 'HEAD' }, signal, Math.max(1, Math.min(7000, deadline - Date.now())))).response
      if ([405, 501].includes(response.status)) response = (await request(target, { discardBody: true }, signal, Math.max(1, Math.min(7000, deadline - Date.now())))).response
      return response.status
    }
    await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
      while (next < queue.length) {
        abortCheck(signal)
        const index = next++, target = queue[index]
        if (Date.now() >= deadline) { results[index] = { url: target, state: 'unknown', reason: '达到本次检查时限' }; continue }
        try {
          let status = await hit(target)
          if ([404, 410].includes(status)) status = await hit(target)
          results[index] = { url: target, status, state: status >= 200 && status < 400 ? 'ok' : [404, 410].includes(status) ? 'broken' : 'unknown' }
        } catch (_) {
          abortCheck(signal)
          results[index] = { url: target, state: 'unknown', reason: '浏览器未能验证（超时、网络或重定向限制）' }
        }
      }
    }))
    const result = { v: 1, requestId: task.id, path: task.path, at: new Date().toISOString(), state: 'completed',
      checked: results.length, broken: results.filter(row => row.state === 'broken').length, unknown: results.filter(row => row.state === 'unknown').length,
      skipped, results, scope: '本机浏览器检查；仅当前文章的前24个站内链接与图片，站外链接未检查。' }
    return update(task, { state: 'completed', result, message: `浏览器已检查 ${result.checked} 项：坏链 ${result.broken} 项，待确认 ${result.unknown} 项，未检查 ${result.skipped} 项` }, onUpdate)
  }
  const checkArticle = async ({ path, signal, onUpdate, sessionId } = {}) => {
    abortCheck(signal)
    path = pathOf(path)
    if (active.has(path)) throw new Error('这篇文章已有检查正在进行，请等待结果或停止等待')
    const task = { id: crypto.randomUUID(), kind: 'article-links', path, sessionId: session(sessionId), mode: 'browser', state: 'preparing', startedAt: new Date().toISOString() }
    active.set(path, task.id)
    update(task, { message: '准备检查本文链接' }, onUpdate)
    try {
      if (!credential() || !/^[\w.-]+\/[\w.-]+$/.test(REPO)) return await browserCheck(task, signal, onUpdate, '未配置可用的 GitHub 凭据')
      update(task, { mode: 'github', message: '正在确认后台检查是否可用' }, onUpdate)
      try { await github(`actions/workflows/${WORKFLOW}`, {}, signal) }
      catch (error) {
        if ([401, 403, 404].includes(error.status) && !error.retryAfter) return await browserCheck(task, signal, onUpdate, '后台工作流不可用或凭据无 Actions 权限')
        throw error
      }
      update(task, { mode: 'github', state: 'dispatching', message: '正在请求后台检查' }, onUpdate)
      try {
        update(task, { canRefresh: true }, onUpdate)
        await github(`actions/workflows/${WORKFLOW}/dispatches`, { method: 'POST', body: JSON.stringify({ ref: 'main', inputs: { request_id: task.id, article_path: path } }) }, signal)
      } catch (error) {
        abortCheck(signal)
        if ([401, 403, 404, 422].includes(error.status) && !error.retryAfter) return await browserCheck(task, signal, onUpdate, 'GitHub 未接受后台检查请求')
        if (error.status) { task.canRefresh = false; throw error }
        // A network timeout after POST does not prove dispatch failed. Never retry
        // this mutation; search for its unique run ID and report uncertainty.
        update(task, { state: 'waiting', message: '派发响应未确认，正在核实是否已启动；不会重复派发' }, onUpdate)
      }
      update(task, { state: 'queued', message: '检查请求已发出，正在等待可核验的后台任务' }, onUpdate)
      return await poll(task, signal, onUpdate)
    } catch (error) {
      if (signal?.aborted) {
        update(task, { state: 'cancelled', message: task.mode === 'github' ? '已停止等待；如果后台已启动，它会继续完成，可稍后刷新状态' : '已停止本机检查' }, onUpdate)
        throw abortError(signal)
      }
      if (task.canRefresh && !error.terminal) return update(task, { state: 'waiting',
        message: '暂时无法核验任务结果：' + String(error.message).slice(0, 140) + '。后台可能仍在运行，可稍后刷新状态。' }, onUpdate)
      return update(task, { state: 'failed', message: error.retryAfter ? 'GitHub 暂时限流，本次未启动后台检查，请稍后重新检查' : String(error.message).slice(0, 220) }, onUpdate)
    } finally { active.delete(path) }
  }
  const refreshTask = async (id, { signal, onUpdate, sessionId } = {}) => {
    const task = tasks.get(id)
    if (sessionId !== undefined && task?.sessionId !== session(sessionId)) throw new Error('任务不属于当前会话')
    if (!task || task.mode !== 'github' || !task.canRefresh) throw new Error('没有可刷新的后台任务记录')
    try { return await poll(task, signal, onUpdate) }
    catch (error) {
      if (signal?.aborted) {
        update(task, { state: 'cancelled', message: '已停止等待；后台任务不会因此取消，可稍后刷新状态' }, onUpdate)
        throw abortError(signal)
      }
      return update(task, { state: error.terminal ? 'failed' : 'waiting', message: '尚未核验到新结果：' + String(error.message).slice(0, 180) }, onUpdate)
    }
  }
  const renderCard = task => {
    const card = document.createElement('section')
    card.className = 'nanaly-task-card'
    card.setAttribute('aria-live', 'polite')
    const title = document.createElement('strong')
    title.textContent = task.mode === 'github' ? '后台文章检查' : '浏览器文章检查'
    card.appendChild(title)
    const message = document.createElement('p')
    message.textContent = task.message || '准备中'
    card.appendChild(message)
    if (task.result) {
      const detail = document.createElement('p')
      detail.textContent = `${task.result.at} · ${task.result.scope || ''}`
      card.appendChild(detail)
      const list = document.createElement('ul')
      for (const row of (task.result.results || []).filter(row => row.state !== 'ok')) {
        const item = document.createElement('li')
        item.textContent = `${row.state === 'broken' ? '坏链' : '待确认'}：${row.url}${row.status ? `（HTTP ${row.status}）` : ''}`
        list.appendChild(item)
      }
      if (list.children.length) card.appendChild(list)
    }
    if (task.runId && Number.isSafeInteger(task.runId)) {
      const link = document.createElement('a')
      link.href = `https://github.com/${REPO}/actions/runs/${task.runId}`
      link.textContent = '查看真实任务详情'
      link.target = '_blank'; link.rel = 'noopener noreferrer'
      card.appendChild(link)
    }
    return card
  }
  window.NANALY_TASKS = Object.freeze({ checkArticle, refreshTask, renderCard, list, recover,
    get: id => tasks.has(id) ? structuredClone(tasks.get(id)) : null,
    isCheckRequest: text => /^(?:请)?(?:检查|巡检)(?:一下)?(?:本文|这篇文章)(?:的)?(?:链接|坏链)(?:和图片)?[。！!]?\s*$/.test(String(text || '').trim()) })
})()
