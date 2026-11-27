(() => {
  const trigger = document.querySelector('.sidebar-trigger')
  const sidebar = document.getElementById('scholar-navigation')
  if (!trigger || !sidebar) return

  let timer
  let hover = false
  const compact = matchMedia('(max-width: 768px)')
  const isOpen = () => trigger.getAttribute('aria-expanded') === 'true'
  const setOpen = (open, restoreFocus = false) => {
    clearTimeout(timer)
    if (restoreFocus) trigger.focus({ preventScroll: true })
    sidebar.inert = !open
    sidebar.classList.toggle('sidebar-open', open)
    trigger.setAttribute('aria-expanded', String(open))
  }
  const deferClose = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (!hover && !sidebar.contains(document.activeElement)) setOpen(false)
    }, 220)
  }

  trigger.addEventListener('pointerenter', event => {
    if (compact.matches || event.pointerType === 'touch') return
    hover = true
    setOpen(true)
  })
  sidebar.addEventListener('pointerenter', event => {
    if (compact.matches || event.pointerType === 'touch') return
    hover = true
    clearTimeout(timer)
  })
  for (const element of [trigger, sidebar]) {
    element.addEventListener('pointerleave', event => {
      if (compact.matches || event.pointerType === 'touch') return
      hover = false
      deferClose()
    })
  }
  trigger.addEventListener('click', event => {
    const open = !compact.matches || !isOpen()
    setOpen(open)
    if (open && event.detail === 0) sidebar.querySelector('.nav-item')?.focus()
  })
  sidebar.addEventListener('focusout', deferClose)
  document.addEventListener('click', event => {
    if (!isOpen() || trigger.contains(event.target)) return
    if (sidebar.contains(event.target)) {
      if (event.target.closest('.nav-item[data-panel], .nav-item[data-view]')) {
        setOpen(false, event.detail === 0)
      }
    } else {
      setOpen(false, sidebar.contains(document.activeElement))
    }
  })
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen() && !event.defaultPrevented) {
      setOpen(false, sidebar.contains(document.activeElement))
    }
  })
})()
