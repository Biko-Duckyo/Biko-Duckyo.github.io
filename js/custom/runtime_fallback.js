// 建站运行时间兜底（参考 akilar.top/posts/b941af/）
//
// ⚠️ 职责边界：页脚运行时间实际由 hexo-butterfly-footer-beautify 注入的
//    /footer-beautify/runtime.js 负责渲染（它写 img.shields.io 徽章 + #runtime）。
//    本文件只做两件事：
//      1) 兜底创建 #workboard（插件注入的 HTML 里若缺失，插件会抛错静默失败）；
//      2) 在插件脚本被网络拦截 / 广告插件屏蔽时提供纯文本运行时间。
//    两者都写 #workboard，谁后写谁生效，不冲突也不重复计算。
//
// 性能：原先 setInterval 无可见性门控，页面切到后台仍每秒算一次并写 innerHTML。
//       现在隐藏时直接短路（不读 Date、不写 DOM），切回立刻补一次。
(function () {
  var CREATE_TIME = Math.round(new Date('2026-10-03 00:00:00').getTime() / 1000);

  function pad(n) { return n > 9 ? n : '0' + n; }
  var lastHtml = '';

  function tick() {
    var wb = document.getElementById('workboard');
    if (!wb) {
      var fw = document.getElementById('footer-wrap');
      if (fw) {
        wb = document.createElement('div');
        wb.id = 'workboard';
        fw.appendChild(wb);
      } else {
        return;
      }
    }
    var now = Math.round(Date.now() / 1000);
    var s = Math.max(0, now - CREATE_TIME);
    var y = Math.floor(s / 31536000); s %= 31536000;
    var d = Math.floor(s / 86400); s %= 86400;
    var h = pad(Math.floor(s / 3600)); s %= 3600;
    var m = pad(Math.floor(s / 60));
    var sec = pad(s % 60);
    var html = y + ' 年 ' + d + ' 天 ' + h + ' : ' + m + ' : ' + sec;
    // 只在真正变化时写 DOM，避免每秒触发一次重排
    if (html !== lastHtml) { wb.innerHTML = html; lastHtml = html }
  }

  function safeTick() {
    if (document.hidden) return
    tick()
  }

  setInterval(safeTick, 1000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) safeTick()
  });
  if (document.readyState !== 'loading') tick();
  else document.addEventListener('DOMContentLoaded', tick);
  document.addEventListener('pjax:complete', function () { setTimeout(safeTick, 500); });
})();
