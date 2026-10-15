// 顶栏时间 hover 切换为站名（站名从页面 #site-name 读取，不再硬编码）
(function () {
  function initTitleHover() {
    var link = document.querySelector('a#site-name');
    if (!link) return;
    // 优先用已有 data-title（主题配置的作者名），否则回退到站点标题文本
    var title = link.getAttribute('data-title') ||
      (link.querySelector('.site-name-title') || link).textContent.trim() ||
      document.title.split(/[-|·]/)[0].trim();
    if (title) link.setAttribute('data-title', title);
  }
  if (document.readyState !== 'loading') initTitleHover();
  else document.addEventListener('DOMContentLoaded', initTitleHover);
  document.addEventListener('pjax:complete', function () {
    setTimeout(initTitleHover, 200);
  });
})();
