/**
 * 萤火虫动画
 * 参考 xinghuisama.top 的萤火虫效果
 */
(function () {
  // 直接关闭萤火虫效果
  return;

  function initFireflies() {
    // 书斋页不加
    if (document.body.classList.contains('page-books')) {
      // 清除旧的
      var old = document.querySelector('.biko-firefly-layer');
      if (old) old.remove();
      return;
    }

    // 先清除旧的（pjax 切换页面时）
    var old = document.querySelector('.biko-firefly-layer');
    if (old) old.remove();

    // 创建萤火虫层
    var layer = document.createElement('div');
    layer.className = 'biko-firefly-layer';
    document.body.appendChild(layer);

    // 生成 30 个萤火虫
    var count = 30;
    for (var i = 0; i < count; i++) {
      var fly = document.createElement('div');
      fly.className = 'biko-firefly';

      // 随机大小 3-7px
      var size = 3 + Math.random() * 4;
      fly.style.width = size + 'px';
      fly.style.height = size + 'px';

      // 随机位置
      fly.style.left = Math.random() * 100 + '%';
      fly.style.top = Math.random() * 100 + '%';

      // 随机动画时长（呼吸）
      var breathDuration = 3 + Math.random() * 3;
      fly.style.animationDuration = breathDuration + 's';
      fly.style.animationDelay = -Math.random() * breathDuration + 's';

      // 随机漂浮动画
      var floatIdx = 1 + Math.floor(Math.random() * 4);
      var floatDuration = 15 + Math.random() * 20;
      fly.style.animation += ', float' + floatIdx + ' ' + floatDuration + 's ease-in-out infinite';
      fly.style.animationDelay += ', -' + Math.random() * floatDuration + 's';

      layer.appendChild(fly);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFireflies);
  } else {
    initFireflies();
  }

  // pjax 切换页面时重新初始化
  document.addEventListener('pjax:complete', function () {
    setTimeout(initFireflies, 100);
  });
})();
