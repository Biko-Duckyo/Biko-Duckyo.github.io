// ======================================================
// 历史上的今天（侧边栏卡片，自动 inject）
// ======================================================
(function () {
  function initHistory() {
    var aside = document.getElementById('aside-content');
    if (!aside || document.getElementById('history-card-widget')) return;

    var myDate = new Date();
    var myMonth = myDate.getMonth() + 1;
    var getMonth = myMonth < 10 ? '0' + myMonth : String(myMonth);
    var getDate = myDate.getDate() < 10 ? '0' + myDate.getDate() : String(myDate);
    var key = 'S' + getMonth + getDate;

    fetch('/history/json/' + getMonth + '.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var events = data[key] || [];
        if (!events.length) return;

        var card = document.createElement('div');
        card.className = 'card-widget card-history';
        card.id = 'history-card-widget';
        card.innerHTML =
          '<div class="item-headline"><i class="fas fa-history"></i><span>历史上的今天</span></div>' +
          '<div id="history-news" style="height:200px;overflow:hidden;">' +
          '<ul id="history-card" style="list-style:none;padding-inline-start:0;margin:0;"></ul>' +
          '</div>';

        aside.insertBefore(card, aside.children[2] || null);

        var ul = card.querySelector('#history-card');
        events.slice(0, 8).forEach(function (n) {
          var li = document.createElement('li');
          li.style.cssText = 'list-style:none;height:50px;overflow:hidden;margin-bottom:4px;';
          li.innerHTML =
            '<p style="color:#858;font-style:italic;font-weight:lighter;font-size:12px;margin:0;padding:0;">A.D.' + n.year + '</p>' +
            '<p style="font-size:13px;margin:0;padding:0;">' + n.title + '</p>';
          ul.appendChild(li);
        });

        // 自动滚动
        var timer = setInterval(function () {
          var li = ul.querySelector('li:first-child');
          if (!li) return;
          ul.style.transition = 'margin-top 0.3s';
          ul.style.marginTop = '-50px';
          setTimeout(function () {
            ul.style.transition = 'none';
            ul.style.marginTop = '0';
            ul.appendChild(li);
          }, 300);
        }, 3000);
      })
      .catch(function () {});
  }

  if (document.readyState !== 'loading') initHistory();
  else document.addEventListener('DOMContentLoaded', initHistory);
  document.addEventListener('pjax:complete', function () { setTimeout(initHistory, 500); });
})();
