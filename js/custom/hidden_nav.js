// 隐藏式顶栏：默认只显示小横条，hover 展开完整导航
// 参考 superq314.github.io 效果
(function () {
  function bindNav() {
    var nav = document.getElementById('nav');
    var bar = document.getElementById('nav-toggle-bar');
    if (!nav || !bar) return;

    var closeTimer;

    function openNav() {
      clearTimeout(closeTimer);
      nav.classList.add('nav-hover');
      bar.style.height = '8px';
      bar.style.background = 'linear-gradient(90deg, transparent, #ff7242, transparent)';
    }

    function scheduleClose() {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        nav.classList.remove('nav-hover');
        bar.style.height = '5px';
        bar.style.background = 'linear-gradient(90deg, transparent, #49b1f5, transparent)';
      }, 300);
    }

    // 鼠标移到横条上：展开
    bar.addEventListener('mouseenter', openNav);
    bar.addEventListener('mouseleave', scheduleClose);

    // 鼠标在顶栏内：保持展开
    nav.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
    nav.addEventListener('mouseleave', scheduleClose);
  }

  if (document.readyState !== 'loading') bindNav();
  else document.addEventListener('DOMContentLoaded', bindNav);
  document.addEventListener('pjax:complete', function () { setTimeout(bindNav, 300); });
})();
