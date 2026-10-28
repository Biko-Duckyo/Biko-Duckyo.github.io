// 文章页：把标题移到正文卡片里，实现连贯效果
(function() {
  function moveTitle() {
    const postInfo = document.getElementById('post-info');
    const post = document.getElementById('post');
    if (!postInfo || !post) return;
    
    // 如果已经移过了就不重复
    if (post.contains(postInfo)) return;
    
    // 把标题插到正文卡片最前面
    post.insertBefore(postInfo, post.firstChild);
  }
  
  // 页面加载后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', moveTitle);
  } else {
    moveTitle();
  }
  
  // Pjax 换页后重新执行
  document.addEventListener('pjax:complete', moveTitle);
})();
