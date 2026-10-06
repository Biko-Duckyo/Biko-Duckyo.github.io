// 页脚振翅蝴蝶动画
(function () {
  function addButterfly() {
    var footer = document.getElementById('footer');
    if (!footer || document.getElementById('footer-butterfly')) return;
    var cp = footer.querySelector('.copyright');
    if (!cp) return;
    var b = document.createElement('span');
    b.className = 'footer-butterfly';
    b.id = 'footer-butterfly';
    cp.insertBefore(b, cp.firstChild);
  }
  if (document.readyState !== 'loading') addButterfly();
  else document.addEventListener('DOMContentLoaded', addButterfly);
  document.addEventListener('pjax:complete', function () { setTimeout(addButterfly, 300); });
})();
