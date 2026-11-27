/* Ideal, single-component Bloch teaching model. No measured or fitted tissue data. */
;(function (root, factory) {
  const api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  else root.BikoSpinModel = api
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict'
  const topics = ['moment', 'precession', 't1', 't2']
  const names = { moment: '磁矩与净磁化', precession: '拉莫尔进动', t1: 'T1 纵向恢复', t2: 'T2 横向衰减' }
  const gamma = 2 * Math.PI * 42.57747892e6 // positive proton gamma, rad s^-1 T^-1
  const clamp = (n, lo, hi) => Number.isFinite(Number(n)) ? Math.min(hi, Math.max(lo, Number(n))) : lo
  const recovery = (u, initial = 0) => 1 + (initial - 1) * Math.exp(-Math.max(0, u))
  const transverse = u => Math.exp(-Math.max(0, u))
  const frequencyMHz = b => gamma * b / (2 * Math.PI * 1e6)
  const polarization = (b, temperature = 310) => Math.tanh(1.054571817e-34 * gamma * b / (2 * 1.380649e-23 * temperature))
  function state(input = {}) {
    return { topic: topics.includes(input.topic) ? input.topic : 'moment', u: clamp(input.u ?? 0, 0, 5), b0: clamp(input.b0 ?? 1.5, 0, 3), tau: clamp(input.tau ?? 1000, 100, 3000), initial: Number(input.initial) === -1 ? -1 : 0, angle: clamp(input.angle ?? 40, 10, 90), theme: input.theme === 'dark' ? 'dark' : 'light' }
  }
  function precession(s) {
    const theta = s.angle * Math.PI / 180
    // Visual time is 4u seconds. Displayed rotation is slowed by a fixed factor.
    const phi = -2 * Math.PI * .25 * s.b0 * (4 * s.u)
    return { x: Math.sin(theta) * Math.cos(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(theta) }
  }
  return { topics, names, gamma, clamp, recovery, transverse, frequencyMHz, polarization, state, precession }
})
