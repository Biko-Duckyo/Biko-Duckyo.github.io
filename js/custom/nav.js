// ======================================================
// 复刻 superq314.github.io 自定义顶栏交互
// 1) 菜单条鼠标滚轮横向滚动
// 2) 中间时钟每秒刷新
// 3) 小拉钮 Navvisible() 切换整条顶栏
// ======================================================
(function () {
  var timer = null;

  // 补零
  function addZero(v) { return v < 10 ? '0' + v : '' + v; }

  // 星期映射
  var weekMap = { 0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六' };

  function setTime() {
    var box = document.getElementById('message-date-box');
    if (!box) return;
    var t = new Date();
    box.innerText =
      addZero(t.getHours()) + ':' +
      addZero(t.getMinutes()) + ':' +
      addZero(t.getSeconds()) + ' 星期' +
      weekMap[t.getDay()];
  }

  // 小拉钮：切换 active-menu-bar
  window.Navvisible = function () {
    var navbar = document.getElementById('menu-container');
    if (navbar) navbar.classList.toggle('active-menu-bar');
  };

  // 绑定菜单滚轮横向滚动
  function bindWheel() {
    var item = document.querySelector('.menu-container .menu-item');
    if (!item || item.__wheelBound) return;
    item.__wheelBound = true;
    item.addEventListener('wheel', function (e) {
      // 只有当菜单条真的可以横向滚动时才劫持纵向滚轮
      if (item.scrollWidth <= item.clientWidth) return;
      e.preventDefault();
      item.scrollLeft += -e.deltaY;
    }, { passive: false });
  }

  // 滚动监听：向下滚隐藏整栏（时钟+搜索），向上滚显示
  var lastScroll = 0;
  function onScroll() {
    var navbar = document.getElementById('menu-container');
    if (!navbar) return;
    var cur = window.scrollY;
    // 菜单展开时滚动自动收起
    if (navbar.classList.contains('active-menu-bar') && cur > 50) {
      navbar.classList.remove('active-menu-bar');
    }
    // 向下滚：隐藏整栏
    if (cur > 100 && cur > lastScroll) {
      navbar.classList.add('nav-hidden');
    } else if (cur < lastScroll) {
      // 向上滚：显示整栏
      navbar.classList.remove('nav-hidden');
    }
    lastScroll = cur;
  }

  function init() {
    setTime();
    if (!timer) timer = setInterval(setTime, 1000);
    bindWheel();
    window.addEventListener('scroll', onScroll, { passive: true });
    var navbar = document.getElementById('menu-container');
    if (navbar) navbar.classList.remove('active-menu-bar');
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  // pjax 切换后重新绑定（#menu-container 若被替换）
  document.addEventListener('pjax:complete', function () {
    setTimeout(init, 200);
  });

  // ======================================================
  // 昼夜模式切换（默认黑夜）
  // ======================================================
  window.switchNightMode = function () {
    document.body.classList.toggle('dark-mode');
    var isDark = document.body.classList.contains('dark-mode');
    var icon = document.querySelector('.icon-V i');
    if (icon) icon.className = isDark ? 'fas fa-sun fa-fw' : 'fas fa-moon fa-fw';
    localStorage.setItem('dark-mode', isDark ? '1' : '0');
  };

  // 默认黑夜模式
  function initDarkMode() {
    var saved = localStorage.getItem('dark-mode');
    var isDark = saved === null ? true : saved === '1'; // 默认 true（黑夜）
    if (isDark) document.body.classList.add('dark-mode');
    var icon = document.querySelector('.icon-V i');
    if (icon) icon.className = isDark ? 'fas fa-sun fa-fw' : 'fas fa-moon fa-fw';
  }
  if (document.readyState !== 'loading') initDarkMode();
  else document.addEventListener('DOMContentLoaded', initDarkMode);
})();
