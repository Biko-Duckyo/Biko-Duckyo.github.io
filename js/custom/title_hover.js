// 顶栏时间 hover 切换为站名
(function () {
  function initTitleHover() {
    var link = document.querySelector('a#site-name');
    if (!link) return;
    link.setAttribute('data-title', 'Biko的个人小站');
  }
  if (document.readyState !== 'loading') initTitleHover();
  else document.addEventListener('DOMContentLoaded', initTitleHover);
  document.addEventListener('pjax:complete', function () {
    setTimeout(initTitleHover, 200);
  });
})();
