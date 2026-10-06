// ======================================================
// SAO 风格作者属性卡片（参考 akilar.top/posts/e5cda1b6/）
// 把 .card-info 改造成 3D 翻转属性面板
// ======================================================
(function () {
  function initSaoCard() {
    var card = document.querySelector('#aside-content .card-widget.card-info');
    if (!card || card.classList.contains('sao-card')) return;

    // 读取现有数据
    var avatarImg = card.querySelector('.card-info-avatar img, .avatar-img');
    var avatarSrc = avatarImg ? avatarImg.src : 'https://s2.loli.net/2022/04/11/qDzgSLuwBd48iJG.jpg';
    var name = card.querySelector('.card-info-data .author-name, #author_name');
    name = name ? name.textContent.trim() : (config && config.author) || 'superBrain';
    var desc = card.querySelector('.card-info-description');
    desc = desc ? desc.textContent.trim() : '瀚海无眠';

    // 从 .card-info-data 读文章/分类/标签数
    var nums = card.querySelectorAll('.card-info-data .card-data-count .count, .card-info-data a .count');
    var postCount = 0, catCount = 0, tagCount = 0;
    if (nums.length >= 3) {
      postCount = parseInt(nums[0].textContent) || 0;
      catCount = parseInt(nums[1].textContent) || 0;
      tagCount = parseInt(nums[2].textContent) || 0;
    }

    var lv = Math.max(1, Math.ceil(postCount / 10));
    function bar(n, max, color) {
      var pct = max > 0 ? Math.min(100, (n / max) * 100) : 0;
      return '<div class="sao-bar-item">' +
        '<div class="sao-bar-label"><span>' + (arguments[3] || '') + '</span><span>' + n + '/' + max + '</span></div>' +
        '<div class="sao-bar-track"><div class="sao-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '</div>';
    }

    var maxP = Math.max(100, Math.ceil(postCount / 100) * 100);
    var maxC = Math.max(100, Math.ceil(catCount / 100) * 100);
    var maxT = Math.max(100, Math.ceil(tagCount / 100) * 100);

    card.classList.add('sao-card');
    card.innerHTML =
      '<div class="sao-container">' +
        '<div class="sao-front">' +
          '<div class="sao-title">ATTRIBUTES</div>' +
          '<img class="sao-avatar" src="' + avatarSrc + '" alt="avatar">' +
          '<div class="sao-desc">' + desc + '</div>' +
        '</div>' +
        '<div class="sao-back">' +
          '<div class="sao-lv">LV.' + lv + '</div>' +
          '<div class="sao-name">' + name + '</div>' +
          bar(postCount, maxP, 'rgba(89,230,54,0.8)', '文章') +
          bar(tagCount, maxT, 'rgba(224,20,20,0.8)', '标签') +
          bar(catCount, maxC, 'rgba(30,97,226,0.8)', '分类') +
        '</div>' +
      '</div>';
  }

  if (document.readyState !== 'loading') initSaoCard();
  else document.addEventListener('DOMContentLoaded', initSaoCard);
  document.addEventListener('pjax:complete', function () {
    setTimeout(initSaoCard, 300);
  });
})();
