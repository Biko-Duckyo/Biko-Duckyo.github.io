// 建站运行时间兜底（参考 akilar.top/posts/b941af/）
// 每秒更新一次，确保 #workboard 元素存在并写入运行时间
(function () {
  var CREATE_TIME = Math.round(new Date('2026-10-03 00:00:00').getTime() / 1000);

  function pad(n) { return n > 9 ? n : '0' + n; }

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
    wb.innerHTML = y + ' 年 ' + d + ' 天 ' + h + ' : ' + m + ' : ' + sec;
  }

  setInterval(tick, 1000);
  if (document.readyState !== 'loading') tick();
  else document.addEventListener('DOMContentLoaded', tick);
  document.addEventListener('pjax:complete', function () { setTimeout(tick, 500); });
})();
