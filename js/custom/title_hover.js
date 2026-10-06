// 左上角标题悬停显示描述（参考 akilar.top/posts/23fdf850/）
(function () {
  function initTitleHover() {
    var link = document.querySelector('a#site-name');
    if (!link) return;
    // 优先用页面 meta description
    var meta = document.querySelector('meta[name="description"]');
    var desc = meta ? meta.content : '欢迎光临 superBrain，愿你有愉快的一天';
    if (desc && desc.length > 120) desc = desc.substring(0, 120) + '...';
    link.setAttribute('data-title', desc);
  }
  if (document.readyState !== 'loading') initTitleHover();
  else document.addEventListener('DOMContentLoaded', initTitleHover);
  document.addEventListener('pjax:complete', function () {
    setTimeout(initTitleHover, 200);
  });
})();
