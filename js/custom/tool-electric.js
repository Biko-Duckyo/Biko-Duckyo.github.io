/* Shared, one-shot work-area decoration. Never filters the panel or its iframe. */
;(function () {
  'use strict'
  if (window.BikoToolElectric) return
  const records = new WeakMap(), active = new Set()
  let serial = 0
  function stopCharge(record) {
    clearTimeout(record.timer)
    record.svg.classList.remove('is-charging')
    record.svg.querySelectorAll('animate').forEach(animation => {
      try { animation.endElement?.() } catch (_) {}
    })
  }
  function place(layer) {
    const record = records.get(layer)
    if (!record || layer.hidden) return
    const box = record.panel.getBoundingClientRect()
    const radius = parseFloat(getComputedStyle(record.panel).borderTopLeftRadius) || 22
    const svg = record.svg
    svg.style.left = (box.left - 24) + 'px'; svg.style.top = (box.top - 24) + 'px'
    svg.setAttribute('width', box.width + 48); svg.setAttribute('height', box.height + 48)
    svg.setAttribute('viewBox', '0 0 ' + (box.width + 48) + ' ' + (box.height + 48))
    // Extend noise coverage for large windows without making it move faster.
    // The reference moves 700px vertically / 490px horizontally in six seconds;
    // the five-second charge lifetime is independent of this motion period.
    svg.querySelectorAll('animate').forEach((animation, index) => {
      const travel = (index < 2 ? box.height : box.width) * 1.4
      animation.setAttribute('values', index % 2 ? '0; ' + (-travel) : travel + '; 0')
      animation.setAttribute('dur', Math.max(6, travel / (index < 2 ? 700 : 490) * 6) + 's')
    })
    svg.querySelectorAll('rect').forEach(rect => {
      rect.setAttribute('width', Math.max(0, box.width - 1)); rect.setAttribute('height', Math.max(0, box.height - 1)); rect.setAttribute('rx', radius)
    })
  }
  function hide(layer) {
    const record = records.get(layer)
    if (!record) return
    stopCharge(record); record.svg.setAttribute('hidden', '')
    record.observer?.disconnect(); active.delete(layer)
  }
  function show(layer, panel) {
    let record = records.get(layer)
    if (!record) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const id = 'biko-tool-electric-' + (++serial)
      svg.classList.add('home-tool-electric'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false')
      // Reference: bootstrapmb item 16341. Keep all four moving noise fields;
      // a single fractal-noise field produces a wavering line instead of arcs.
      const noise = (index, axis, seed) => '<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" seed="' + seed + '" result="noise' + index + '"/>' +
        '<feOffset in="noise' + index + '" result="offset' + index + '"><animate attributeName="' + axis + '" values="0; 0" dur="5s" begin="indefinite" fill="remove" calcMode="linear"/></feOffset>'
      svg.innerHTML = '<defs><filter id="' + id + '" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
        noise(1, 'dy', 1) + noise(2, 'dy', 1) + noise(3, 'dx', 2) + noise(4, 'dx', 2) +
        '<feComposite in="offset1" in2="offset2" result="part1"/>' +
        '<feComposite in="offset3" in2="offset4" result="part2"/>' +
        '<feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="22" xChannelSelector="R" yChannelSelector="B"/></filter></defs>' +
        '<rect class="electric-rest" x="24.5" y="24.5"/>' +
        '<rect class="electric-glow electric-glow-wide" x="24.5" y="24.5"/>' +
        '<rect class="electric-glow electric-glow-near" x="24.5" y="24.5"/>' +
        '<rect class="electric-live" x="24.5" y="24.5"/>'
      svg.querySelector('.electric-live').style.filter = 'url(#' + id + ')'
      layer.append(svg)
      record = { svg, panel }
      if (window.ResizeObserver) record.observer = new ResizeObserver(() => place(layer))
      records.set(layer, record)
    }
    stopCharge(record); record.svg.removeAttribute('hidden'); active.add(layer)
    record.observer?.observe(panel); place(layer)
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    void record.svg.getBoundingClientRect()
    record.svg.classList.add('is-charging')
    record.svg.querySelectorAll('animate').forEach(animation => animation.beginElement?.())
    record.timer = setTimeout(() => stopCharge(record), 5000)
  }
  window.addEventListener('resize', () => active.forEach(place), { passive: true })
  document.addEventListener('pjax:send', () => active.forEach(hide))
  window.BikoToolElectric = { show, hide, place }
})()
