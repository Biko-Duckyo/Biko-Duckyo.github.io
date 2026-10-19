// Ironheart loader auto-hide
// ---------------------------------------------------------------------------
// 【当前状态】备用，未启用。站点现在用的是 Butterfly 原生 loading-box
//   （_config.butterfly.yml -> preloader.enable: true / source: 1）。
//   本文件与 custom.css 里的 .ironheart-* 样式都完整保留，随时可重新启用。
//
// 【为什么不直接用】原生 loading-box 与 ironheart 是两套独立遮罩：
//   - 原生 #loading-box      z-index 1000 / 1001
//   - #ironheart-loader      z-index var(--z-loader) = 100（见 custom_nav.css）
//   两者同时开启时 ironheart 会被完全盖住，所以启用前必须先关原生：
//     preloader.enable: false
//
// 【启用步骤】缺一不可，三样都要加，否则脚本静默失效：
//   1. _config.butterfly.yml -> preloader.enable: false
//   2. inject.bottom 加回加载器 DOM：
//      - <div id="ironheart-loader"><div class="ironheart-box"><div class="ironheart-ring r1"></div><div class="ironheart-ring r2"></div><div class="ironheart-core"></div><div class="ironheart-text">Loading...</div></div></div>
//   3. inject.bottom 加回本脚本：
//      - <script defer data-pjax src="/js/custom/ironheart_loader.js"></script>
//
// 样式在 source/css/custom.css 的「Ironheart 钢铁之心加载动画」小节，
// 含 [data-theme="dark"] 深色背景适配（背景 #1a1a2e）。
// ---------------------------------------------------------------------------
(function () {
  function hideLoader() {
    var l = document.getElementById('ironheart-loader');
    if (l) l.classList.add('hidden');
  }
  if (document.readyState !== 'loading') {
    setTimeout(hideLoader, 1500);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(hideLoader, 1500);
    });
  }
  setTimeout(hideLoader, 4000);
  document.addEventListener('pjax:complete', function () {
    setTimeout(hideLoader, 500);
  });
})();
