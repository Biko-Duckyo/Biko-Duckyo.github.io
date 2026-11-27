// ======================================================
// Butterfly 侧边栏电子钟（纯时钟版）
// ------------------------------------------------------
// 职责收敛：本脚本只负责时间 / 日期 / 上下午渲染；
// 天气文字、城市名、湿度统一由 source/js/custom/weather.js
// （和风天气 v1 同源代理）在拿到数据后填充到同名 DOM，
// 不再由本脚本发起任何天气请求，避免双脚本竞争、旧 v7 接口残留与密钥路径分叉。
// ======================================================
(function () {
  'use strict';

  var WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function zeroPadding(num, digit) {
    var zero = '';
    for (var i = 0; i < digit; i++) zero += '0';
    return (zero + num).slice(-digit);
  }

  /* 骨架幂等：pjax 换页后旧 DOM 被整体替换才重建；同一生命周期内不反复清空 */
  function buildSkeleton(box) {
    if (document.getElementById('card-clock-time')) return;
    box.innerHTML =
      '<div class="clock-row">' +
      '  <span class="card-clock-clockdate"></span>' +
      '  <span class="card-clock-weather"></span>' +
      '  <span class="card-clock-humidity"></span>' +
      '</div>' +
      '<div class="clock-row">' +
      '  <span id="card-clock-time" class="card-clock-time"></span>' +
      '</div>' +
      '<div class="clock-row">' +
      '  <span class="card-clock-location"></span>' +
      '  <span id="card-clock-dackorlight" class="card-clock-dackorlight"></span>' +
      '</div>';
  }

  function updateTime() {
    var cd = new Date();
    var h = cd.getHours();
    var time = zeroPadding(h, 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
    var date = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth() + 1, 2) + '-' + zeroPadding(cd.getDate(), 2) + ' ' + WEEK[cd.getDay()];
    var tEl = document.getElementById('card-clock-time');
    var dEl = document.querySelector('.card-clock-clockdate');
    var aEl = document.getElementById('card-clock-dackorlight');
    if (tEl) tEl.textContent = time;
    if (dEl) dEl.textContent = date;
    if (aEl) aEl.textContent = (h >= 12 ? 'PM' : 'AM');
  }

  function initClock() {
    var box = document.getElementById('hexo_electric_clock');
    if (!box) return;
    buildSkeleton(box);
    updateTime();
    // 全局唯一定时器，pjax 重复触发不叠加；旧 timer 找不到元素时自然空转
    if (!window.__BIKO_CLOCK_TIMER__) {
      window.__BIKO_CLOCK_TIMER__ = setInterval(updateTime, 1000);
    }
  }

  if (document.readyState !== 'loading') initClock();
  else document.addEventListener('DOMContentLoaded', initClock);
  document.addEventListener('pjax:complete', function () { setTimeout(initClock, 500); });
})();
