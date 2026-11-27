/*
 * 加载页底部纵向滚动文字（参考张洪Heo：blog.zhheo.com/p/49d2ac8e.html）
 *
 * 做什么：在 Butterfly 原生 #loading-box 双环 spinner 下方，注入一段
 *   单行高 25px、纵向循环上滚的短句；两条 ul 首尾复制实现无缝回绕，
 *   每滚完一行停顿约 1 秒再继续。
 *
 * 为什么独立注入而不改主题 pug/styl：本站约束不碰 node_modules。
 *   #loading-box 由主题在 <body> 直出（#body-wrap 之外），pjax 只换
 *   #body-wrap，该节点保留；脚本幂等构建容器，并用 MutationObserver 跟随
 *   loaded 状态：加载结束停表隐藏，pjaxSend 重新拉起时再滚动。
 *
 * 文案：科研 / 工程 / 学术向中性短句，内置在 QUOTES，改文案只动这一处。
 */
(function () {
  'use strict'

  var QUOTES = [
    '实验不会说谎，只是需要被正确地解读',
    '把复杂问题拆开，一步一步逼近答案',
    '数据是起点，不是结论',
    '可重复的结果，才站得住脚',
    '慢一点，把基线和对照做扎实',
    '误差不是失败，是下一次改进的线索',
    '先问是不是，再问为什么',
    '每一次校准，都是对仪器与自己的诚实',
    '规律藏在噪声背后，耐心把它们分开',
    '工程的价值，在于把想法变成可复用的结果',
    '记录过程，比记住结论更重要',
    '保持好奇，也保持怀疑'
  ]

  var LINE_H = 25
  var FRAME = 1000 / 60
  var PAUSE = 1000

  var area = null
  var con1 = null
  var con2 = null
  var rollTimer = null
  var pauseTimer = null
  var observed = false

  function build() {
    var box = document.getElementById('loading-box')
    if (!box) return
    if (document.getElementById('loadingtxt')) return // 幂等，不重复插入

    area = document.createElement('div')
    area.id = 'loadingtxt'

    con1 = document.createElement('ul')
    con1.id = 'con1'
    con2 = document.createElement('ul')
    con2.id = 'con2'

    QUOTES.forEach(function (q) {
      var li = document.createElement('li')
      li.className = 'li-style'
      li.textContent = q // textContent 天然转义，不走 innerHTML
      con1.appendChild(li)
    })
    con2.innerHTML = con1.innerHTML // 复制一份实现无缝循环

    area.appendChild(con1)
    area.appendChild(con2)
    box.appendChild(area)

    observe(box)
  }

  function scrollUp() {
    if (!area || !con1) return
    if (area.scrollTop >= con1.offsetHeight) {
      area.scrollTop = 0
    } else {
      // 每滚完一行（25px）停顿 PAUSE，再继续下一行
      if (area.scrollTop % LINE_H === 0) {
        clearInterval(rollTimer)
        clearTimeout(pauseTimer)
        pauseTimer = setTimeout(function () {
          rollTimer = setInterval(scrollUp, FRAME)
        }, PAUSE)
      }
      area.scrollTop++
    }
  }

  function stop() {
    clearInterval(rollTimer)
    clearTimeout(pauseTimer)
    rollTimer = null
    pauseTimer = null
  }

  function start() {
    stop()
    if (!area) return
    area.scrollTop = 0
    rollTimer = setInterval(scrollUp, FRAME)
  }

  function observe(box) {
    if (observed) return
    observed = true
    new MutationObserver(function () {
      if (box.classList.contains('loaded')) stop()
      else start()
    }).observe(box, { attributes: true, attributeFilter: ['class'] })
  }

  function boot() {
    build()
    var box = document.getElementById('loading-box')
    if (box && !box.classList.contains('loaded')) start()
  }

  if (document.readyState !== 'loading') boot()
  else document.addEventListener('DOMContentLoaded', boot)

  // pjax 不换 #loading-box 节点，容器与观察者保留；这里仅兜底重跑一次幂等构建。
  document.addEventListener('pjax:complete', function () {
    if (document.readyState !== 'loading') build()
  })
})()
