(() => {
  'use strict'
  if (window.NANALY_AGENT_UI || !window.NANALY_AGENT) return
  const agent = window.NANALY_AGENT
  const node = (tag, content, cls) => { const n = document.createElement(tag); if (content) n.textContent = content; if (cls) n.className = cls; return n }
  const modal = node('dialog', '', 'nanaly-studio'), title = node('h2','娜娜莉工作室'), status = node('p','','studio-status')
  status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); title.id = 'studio-title'; modal.setAttribute('aria-labelledby',title.id)
  let previousFocus, running = false, memoryId = '', viewEpoch = 0
  const perform = async (button, fn) => {
    if (button.disabled) return
    button.disabled = true
    const generation = viewEpoch
    try { await fn(); if (generation === viewEpoch) { status.textContent = '已保存。'; renderLists() } }
    catch (error) { if (generation === viewEpoch) status.textContent = error.message || '操作失败，请重试。' }
    finally { button.disabled = false }
  }
  const button = (label, action) => { const b = node('button',label); b.type = 'button'; b.addEventListener('click',() => perform(b,action)); return b }
  const close = () => { modal.close(); previousFocus?.focus?.() }
  const header = node('div','','studio-header'); header.append(title,button('关闭',close)); modal.append(header,status)
  const field = (label, tag = 'input', value = '', type = 'text') => { const box = node('label',label), input = node(tag); if (tag === 'input') input.type = type; input.value = value; box.append(input); return { box,input } }
  const section = (label, open = false) => { const d = node('details'); d.open = open; d.append(node('summary',label)); modal.append(d); return d }
  const form = (container, fields, label, submit) => {
    const f = node('form'), b = node('button',label); b.type = 'submit'
    f.append(...fields.map(x => x.box),b); f.addEventListener('submit',event => { event.preventDefault(); perform(b,submit) }); container.append(f); return f
  }
  const connection = section('连接私有后端',true)
  connection.append(node('p','连接一次，本标签页内切换页面或刷新会自动恢复；点击断开会清除会话。'))
  let savedURL = ''; try { savedURL = localStorage.getItem('nanaly-agent-url') || '' } catch (_) {}
  const url = field('后端地址','input',savedURL || 'https://api.noimpty-zby.cn','url'), token = field('访问令牌','input','','password')
  url.input.placeholder = 'https://你的后端地址'; url.input.required = true; token.input.required = true; token.input.autocomplete = 'off'
  form(connection,[url,token],'连接并读取',async () => { const address=url.input.value; await agent.connect(address,token.input.value); token.input.value = ''; renderLists(); try { localStorage.setItem('nanaly-agent-url',address) } catch (_) {} })
  connection.append(button('重新读取最新记录',() => agent.configured() ? agent.refresh() : agent.resume()),button('断开并清除本页私有数据',() => agent.disconnect()))
  // 令牌存进娜娜莉的密钥保险箱后，解锁保险箱就自动连接（noimpty-ai.js 的 connectBackend）。
  const vault = node('button','打开密钥保险箱'); vault.type = 'button'
  vault.addEventListener('click',() => { close(); window.NANALY?.requestUnlock?.() })
  connection.append(node('p','不想每次都贴令牌：在密钥保险箱里填上「个人后端令牌」，以后解锁保险箱就会自动连接。'),vault)
  const memory = section('统一记忆'), kind = field('记忆类型','select'), content = field('确认要记住的内容','textarea'), publicMemory = field('允许用于公开回复与随笔','input','','checkbox')
  for (const [value,label] of Object.entries({ preference:'偏好',goal:'学习目标',fact:'确认事实',todo:'未解决问题',correction:'纠正记录',progress:'学习进度' })) { const o = node('option',label); o.value = value; kind.input.append(o) }
  content.input.required = true; content.input.maxLength = 800
  form(memory,[kind,content,publicMemory],'确认保存记忆',async () => { await agent.saveMemory({ id:memoryId || undefined,kind:kind.input.value,text:content.input.value,confirmed:true,publicAllowed:publicMemory.input.checked }); memoryId = ''; content.input.value = ''; publicMemory.input.checked = false })
  memory.append(button('取消编辑',() => { memoryId = ''; content.input.value = ''; publicMemory.input.checked = false }),button('合并本机已确认的记忆',() => agent.importMemories(window.NANALY?.confirmedMemories?.() || [])))
  const memoryList = node('div'); memory.append(memoryList)
  const goals = section('持续目标与步骤',true), goalTitle = field('新的目标'), goalSelect = field('要操作的目标','select'), stepTool = field('这一步要做什么','select'), stepInput = field('查询、要求或要保存的笔记','textarea')
  goalTitle.input.required = true; goalTitle.input.maxLength = 200; stepInput.input.required = true; stepInput.input.maxLength = 12000
  for (const [value,label] of Object.entries(agent.tools)) { const option = node('option',label); option.value = value; stepTool.input.append(option) }
  form(goals,[goalTitle],'登记目标',async () => { const id = await agent.createGoal(goalTitle.input.value); goalTitle.input.value = ''; renderLists(); goalSelect.input.value = id })
  goals.append(node('p','登记后先添加步骤，再启动目标。每次“执行下一步”只运行一个明确步骤；关闭页面后保留恢复点，不会偷偷重放命令。'))
  form(goals,[goalSelect,stepTool,stepInput],'添加步骤',async () => { await agent.addStep(goalSelect.input.value,{tool:stepTool.input.value,input:stepInput.input.value}); stepInput.input.value = '' })
  const checkpoint = field('调整目标名称或恢复点','textarea'); checkpoint.input.maxLength = 4000; goals.append(checkpoint.box)
  goals.append(button('保存恢复点',() => agent.updateGoal(goalSelect.input.value,{checkpoint:checkpoint.input.value})),button('将此内容设为目标名称',() => agent.updateGoal(goalSelect.input.value,{title:checkpoint.input.value})))
  const goalList = node('div'); goals.append(goalList)
  const notes = section('学习笔记'), noteTitle = field('笔记标题'), noteContent = field('笔记内容','textarea')
  noteContent.input.required = true; noteContent.input.maxLength = 12000
  form(notes,[noteTitle,noteContent],'保存笔记',async () => { await agent.saveNote({title:noteTitle.input.value,text:noteContent.input.value,source:location.href}); noteContent.input.value = ''; noteTitle.input.value = '' })
  const noteList = node('div'); notes.append(noteList)
  const experience = section('经验与教学方法'), lesson = field('下次怎样讲解或处理更合适','textarea'), evidence = field('依据：这次的反馈、错误或实际结果','textarea'), publicLesson = field('也可用于公开交流','input','','checkbox')
  lesson.input.required = true; lesson.input.maxLength = 2000; evidence.input.maxLength = 4000
  form(experience,[lesson,evidence,publicLesson],'确认调整方法',async () => { await agent.feedback({lesson:lesson.input.value,evidence:evidence.input.value,publicAllowed:publicLesson.input.checked}); lesson.input.value = ''; evidence.input.value = '' })
  const experienceList = node('div'); experience.append(experienceList)
  const events = section('实际行动记录与备份'), eventList = node('div')
  events.append(button('导出私有记录备份',() => {
    if (!agent.configured()) throw new Error('请先连接。')
    const objectURL = URL.createObjectURL(new Blob([JSON.stringify(agent.snapshot(),null,2)],{type:'application/json'}))
    const link = node('a'); link.href = objectURL; link.download = 'nanaly-private-' + new Date().toISOString().slice(0,10) + '.json'; link.click(); setTimeout(() => URL.revokeObjectURL(objectURL),2000)
  }),eventList)
  const date = value => Number.isFinite(value) ? new Date(value).toLocaleString() : ''
  const states = { todo:'待启动',active:'进行中',paused:'已暂停',cancelled:'已取消',completed:'已完成',running:'上次执行中（需显式重试）',failed:'失败，待修正' }
  const renderLists = () => {
    const {data,problem,connection,revision,sessionIssue} = agent.snapshot()
    const state = connection || (agent.configured() ? 'connected' : 'disconnected')
    status.dataset.connection = state
    status.textContent = problem || sessionIssue || (state === 'connecting' ? '正在连接后端…' : state === 'connected' ? '● 后端已连接 · 记录版本 ' + revision : '尚未连接私有后端。')
    for (const el of [memoryList,goalList,noteList,experienceList,eventList]) el.replaceChildren()
    for (const m of data.memories) {
      const row = node('article'); row.append(node('p',m.text),node('small',(m.source || '用户确认') + ' · ' + date(m.updatedAt)),button('编辑',() => { memoryId=m.id; kind.input.value=m.kind; content.input.value=m.text; publicMemory.input.checked=m.publicAllowed===true; content.input.focus() }),button('删除',() => agent.remove('memories',m.id))); memoryList.append(row)
    }
    const selected = goalSelect.input.value; goalSelect.input.replaceChildren()
    for (const g of data.goals) {
      const option = node('option',g.title); option.value = g.id; goalSelect.input.append(option)
      const row = node('article'); row.append(node('h3',g.title + ' · ' + (states[g.status] || g.status)),node('p',g.checkpoint || '尚无恢复点'))
      if (g.blocker) row.append(node('p','卡点：' + g.blocker))
      const list = node('ol')
      for (const s of g.steps || []) { const li=node('li',s.title + ' · ' + (states[s.state] || s.state)); if(s.result) { const d=node('details');d.append(node('summary','查看实际结果'),node('pre',s.result));li.append(d) } if(s.error)li.append(node('p',s.error)); list.append(li) }
      row.append(list)
      if(g.status!=='completed') row.append(button('启动 / 恢复',() => agent.updateGoal(g.id,{status:'active'})),button('暂停',() => agent.updateGoal(g.id,{status:'paused'})),button('取消目标',() => agent.updateGoal(g.id,{status:'cancelled'})),button('执行下一步',async () => { if(running)throw new Error('请等待当前步骤结束。');const generation=viewEpoch;running=true;try {await agent.runStep(g.id)} finally {if(generation===viewEpoch)running=false} }))
      goalList.append(row)
    }
    if ([...goalSelect.input.options].some(o=>o.value===selected))goalSelect.input.value=selected
    for(const n of data.notes.slice().reverse()){const row=node('article');row.append(node('h3',n.title),node('pre',n.text),node('small',date(n.at)),button('删除',()=>agent.remove('notes',n.id)));noteList.append(row)}
    for(const e of data.experiences.slice().reverse()){const row=node('article');row.append(node('p',e.lesson),node('small',e.evidence || '用户明确反馈'),button('删除',()=>agent.remove('experiences',e.id)));experienceList.append(row)}
    for(const e of data.events.slice(-30).reverse())eventList.append(node('p',date(e.at) + ' · ' + (e.detail || e.kind)))
  }
  const open = () => {
    if (document.documentElement.classList.contains('noimpty-private-locked')) { window.NANALY?.requestUnlock?.(); return }
    if (!modal.isConnected)document.body.append(modal)
    previousFocus=document.activeElement; renderLists(); if(!modal.open)modal.showModal()
  }
  modal.addEventListener('cancel',event=>{event.preventDefault();close()})
  modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close()}})
  const clearPrivateDrafts = () => {
    viewEpoch++; memoryId = ''; running = false
    for (const input of [token.input,content.input,goalTitle.input,stepInput.input,checkpoint.input,noteTitle.input,noteContent.input,lesson.input,evidence.input]) input.value = ''
    publicMemory.input.checked = false; publicLesson.input.checked = false
    for (const list of [memoryList,goalList,noteList,experienceList,eventList]) list.replaceChildren()
    goalSelect.input.replaceChildren()
  }
  agent.subscribe(state=>{
    const previous = status.dataset.connection
    status.dataset.connection = state.connection || (agent.configured() ? 'connected' : 'disconnected')
    if(!state.connected){clearPrivateDrafts();if(modal.open)renderLists()}
    else if(state.connection==='connecting')status.textContent='正在连接后端…'
    else if(state.problem)status.textContent=state.problem
    else if(state.sessionIssue)status.textContent=state.sessionIssue
    else if(state.connection==='connected'&&previous!=='connected')status.textContent='● 后端已连接 · 记录版本 '+state.revision
  })
  const attach = () => {
    const bar=document.querySelector('.nanaly-workspace-bar')
    if(bar&&!bar.querySelector('.nanaly-studio-entry')){const b=button('工作室',open);b.className='nanaly-studio-entry';bar.append(b)}
  }
  window.addEventListener('pjax:complete',attach)
  window.addEventListener('noimpty:search-reset',()=>{if(modal.open)close()})
  window.NANALY_AGENT_UI=Object.freeze({open,close}); attach()
})()
