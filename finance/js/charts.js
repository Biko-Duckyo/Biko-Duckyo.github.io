/* ============================================================
 *  图表 —— 后续用 ECharts 完善
 * ============================================================ */

(function () {
  'use strict';

  // 初始化图表（占位）
  function initCharts() {
    // 后续接入 ECharts
    console.log('图表模块待完善');
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharts);
  } else {
    initCharts();
  }
})();
