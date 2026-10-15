// ======================================================
// 历史上的今天（侧边栏卡片，自动 inject）
// ======================================================
(function () {
  function initHistory() {
    var aside = document.getElementById('aside-content');
    if (!aside || document.getElementById('history-card-widget')) return;

    var myDate = new Date();
    // ⚠️ 命名陷阱：这里【不能】把变量叫 getMonth / getDate。
    //   · getDate 是 window（即 globalThis）上的内置方法；
    //     var getDate = ... 会把它遮蔽掉，且 IIFE 内的 var 会挂到全局，
    //     等于把整个页面的 Date.prototype.getDate 语义上下文搞脏。
    //   · 更致命的是第 2 行原本写的是 String(myDate) 而不是 String(myDate.getDate())，
    //     于是 getDate 变成【一个 Date 对象】，
    //     `getMonth + getDate` 走字符串拼接 →
    //       "10Wed Oct 14 2026 18:49:07 GMT+0800 (中国标准时间)"
    //     永远匹配不到 JSON 里的 "1014" 键，卡片就一直空白。
    //     （这正是「历史上的今天永远不显示」的真正根因，
    //       之前只把锅甩给了 S 前缀，其实键没问题，是日期没拼对。）
    var monthKey = myDate.getMonth() + 1;
    var mm = monthKey < 10 ? '0' + monthKey : String(monthKey);
    var dayNum = myDate.getDate();
    var dd = dayNum < 10 ? '0' + dayNum : String(dayNum);

    fetch('/history/json/' + mm + '.json')
      .then(function (r) { return r.json(); })
      .then(function (raw) {
        // ---------------------------------------------------------------
        // 数据格式兼容：百度百科导出的 JSON 实际为两层结构
        //   { "10": { "1001": [ {year,title,link,...} ] } }
        // 即外层键是月份，内层键是「月日」且【没有 S 前缀】。
        //
        // 历史教训（两次踩坑，别再退回）：
        //   ① 最初以为键是 'S' + 月 + 日，写 data['S1011'] → 永远 undefined；
        //   ② 改成无前缀后仍空白，因为【日期本身就没拼对】：
        //      var getDate = ... String(myDate) 把 getDate 变成了 Date 对象
        //      （详见上方命名陷阱注释），拼出来是 "10Wed Oct 14 2026..."。
        //      所以真正修好需要「正确的键 + 正确的月日字符串」两者同时成立。
        // 归一化逻辑保留，兼容「有/无 S 前缀」「有/无外层月份」三种形态，
        // 数据源换版本也不会再静默空白。
        // ---------------------------------------------------------------
        var monthBucket = raw && raw[mm] ? raw[mm] : raw;
        var noPrefix = mm + dd;                 // 例如 1014
        var withPrefix = 'S' + noPrefix;        // 例如 S1014
        var events =
          (monthBucket && (monthBucket[noPrefix] || monthBucket[withPrefix])) ||
          (raw && (raw[noPrefix] || raw[withPrefix])) ||
          [];
        if (!events.length) return;

        var card = document.createElement('div');
        card.className = 'card-widget card-history';
        card.id = 'history-card-widget';
        // 视口高度 / 单条高度不再硬编码 200px、50px、-50px：
        // 改用 CSS 变量（--bh-item-h / --bh-view-h）由脚本按真实渲染高度写入，
        // 字号或浏览器缩放变化时滚动步长自动跟随，不会错位。
        card.innerHTML =
          '<div class="item-headline"><i class="fas fa-history"></i><span>历史上的今天</span></div>' +
          '<div id="history-news">' +
          '<ul id="history-card" role="list" aria-live="off"></ul>' +
          '</div>';

        aside.insertBefore(card, aside.children[2] || null);

        var ul = card.querySelector('#history-card');
        var viewport = card.querySelector('#history-news');
        events.slice(0, 8).forEach(function (n) {
          var li = document.createElement('li');
          // 数据自带 link（百度百科词条）与 desc（详细描述），
          // 给标题挂上原文链接并用 desc 作为 tooltip，信息更完整。
          var titleHtml = String(n.title == null ? '' : n.title);
          li.innerHTML =
            '<p class="bh-year">A.D.' + (n.year || '') + '</p>' +
            '<p class="bh-title"' +
              (n.desc ? ' title="' + String(n.desc).replace(/<[^>]+>/g, '').replace(/"/g, '&quot;') + '"' : '') +
            '>' + titleHtml + '</p>';
          if (n.link) {
            li.title = String(n.desc || '').replace(/<[^>]+>/g, '');
            li.style.cursor = 'pointer';
            li.addEventListener('click', function () { window.open(n.link, '_blank', 'noopener'); });
          }
          ul.appendChild(li);
        });

        // 实测单条真实高度（含 margin），驱动滚动步长与视口高度，去掉硬编码。
        function measure() {
          var first = ul.querySelector('li');
          if (!first) return;
          var step = first.getBoundingClientRect().height;
          var lh = step || 50;
          // 视口固定展示约 4 条，按真实条高换算，缩放/字号变化自适应
          var rows = 4;
          viewport.style.setProperty('--bh-item-h', lh + 'px');
          viewport.style.setProperty('--bh-view-h', (lh * rows) + 'px');
        }
        measure();
        // 字体加载完成 / 窗口尺寸变化后重新测量，避免首屏字体未就绪时测到错值
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(measure).catch(function () {});
        }
        window.addEventListener('resize', measure, { passive: true });
        card._historyMeasure = measure;

        // 自动滚动：只在卡片真正进入视口时滚动，离开视口 / 页面隐藏 = 暂停。
        // 原先的常驻 setInterval(3000ms) 有两个问题：
        //   1) 无 clearInterval、无重复保护，而本函数会在每次 pjax:complete 重跑
        //      → 多次无刷新换页会叠加出多个定时器同时抢同一张卡片；
        //   2) 卡片滚出屏幕后仍每 3s 改一次 DOM，触发重排重绘，白耗电。
        // 现改为「单个 setTimeout 递归 + 可见性/视口门控」，任何时刻最多一个计时器。
        var loopTimer = null;
        var running = false;
        function inView() {
          if (document.hidden) return false;
          // 卡片已被 pjax 换页移除则视为不可见
          if (!card.isConnected) return false;
          var r = card.getBoundingClientRect();
          return r.bottom > 0 && r.top < (window.innerHeight || 0);
        }
        function stopLoop() {
          running = false;
          if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
        }
        function step() {
          loopTimer = null;
          if (!running) return;
          var li = ul.querySelector('li:first-child');
          if (li) {
            // 步长取自实测变量，不再硬编码 -50px
            var stepPx = parseInt(viewport.style.getPropertyValue('--bh-item-h'), 10) || 50;
            ul.style.transition = 'margin-top 0.3s';
            ul.style.marginTop = (-stepPx) + 'px';
            setTimeout(function () {
              ul.style.transition = 'none';
              ul.style.marginTop = '0';
              ul.appendChild(li);
            }, 300);
          }
          if (running) loopTimer = setTimeout(step, 3000);
        }
        function startLoop() {
          if (running) return;
          running = true;
          if (!loopTimer) loopTimer = setTimeout(step, 3000);
        }
        function evaluate() { if (inView()) startLoop(); else stopLoop(); }

        // 暴露给外层：pjax 换页 / 卡片重建前先停掉本实例的循环
        card._historyStop = stopLoop;

        // ------------------------------------------------------------
        // 这三个是「随卡片存活」的全局监听器，evaluate 每次 initHistory 都是新闭包，
        // addEventListener 无法去重 → 换页 N 次就累积 3N 个监听器；
        // 且旧实例的 evaluate 会对已脱离 DOM 的 card 调 getBoundingClientRect()，
        // 每次滚动都触发强制同步布局（layout thrashing），明显掉帧。
        // 因此启动时注册，并挂出 _historyDetach 由 boot() 在重建前成对卸掉。
        // ------------------------------------------------------------
        document.addEventListener('visibilitychange', evaluate);
        window.addEventListener('scroll', evaluate, { passive: true });
        window.addEventListener('resize', evaluate, { passive: true });
        card._historyDetach = function () {
          document.removeEventListener('visibilitychange', evaluate);
          window.removeEventListener('scroll', evaluate);
          window.removeEventListener('resize', evaluate);
          if (card._historyMeasure) {
            window.removeEventListener('resize', card._historyMeasure);
            card._historyMeasure = null;
          }
        };

        // 供外层登记为「当前活跃实例」，pjax 换页时由 teardownActive 成对卸载。
        // 存储到闭包变量 adoptCard 上，避免污染 window。
        if (typeof adoptCard === 'function') adoptCard(card);

        // 卡片是否在视口取决于页面滚动，先按当前位置判定一次
        evaluate();
      })
      .catch(function () {});
  }

  // 缓存当前卡片实例，重建前先停它，杜绝 pjax 换页导致的定时器叠加
  // 注意：卡片是 fetch 完成后才异步创建的，所以不能只在 boot 里抓一次；
  // 用「已挂载实例」引用，配合 _historyDetach 成对卸掉定时器与全局监听器。
  var activeCard = null;

  function teardownActive() {
    if (!activeCard) return;
    if (activeCard._historyStop) activeCard._historyStop();
    if (activeCard._historyDetach) activeCard._historyDetach();
    activeCard = null;
  }

  function boot() {
    teardownActive();
    // initHistory 是异步的（内部 fetch），完成后会回调 adoptCard 把自己登记为当前实例
    initHistory();
  }

  // 供 initHistory 在卡片真正插入 DOM 后登记，后续 pjax 换页由 teardownActive 卸载
  function adoptCard(card) { activeCard = card; }

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
  document.addEventListener('pjax:complete', function () { setTimeout(boot, 500); });
})();
