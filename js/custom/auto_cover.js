// ======================================================
// 自动给没有封面的文章卡片配 Unsplash 随机图
// ======================================================
(function () {
  function addCovers() {
    document.querySelectorAll('#recent-posts .recent-post-item').forEach(function (item) {
      if (item.querySelector('img.post-bg, .recent-post-cover')) return;
      var title = item.querySelector('.article-title')?.innerText || '';
      var keywords = encodeURIComponent(title.slice(0, 15) || 'blog,tech');
      var img = 'https://source.unsplash.com/400x250/?' + keywords + '&sig=' + Math.random().toString(36).slice(2, 8);
      var cover = document.createElement('div');
      cover.className = 'recent-post-cover';
      cover.style.cssText = 'position:absolute;left:0;top:0;width:45%;height:100%;background:url(' + img + ') center/cover;opacity:.6;';
      item.style.position = 'relative';
      item.style.overflow = 'hidden';
      item.insertBefore(cover, item.firstChild);
    });
  }
  if (document.readyState !== 'loading') addCovers();
  else document.addEventListener('DOMContentLoaded', addCovers);
  document.addEventListener('pjax:complete', function () { setTimeout(addCovers, 500); });
})();
