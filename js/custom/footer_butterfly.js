// ======================================================
// 页脚振翅蝴蝶
// ------------------------------------------------------
// 背景：主题 Butterfly 5.x 的页脚里【没有】任何蝴蝶图标，也没有 #footer-wrap。
// 之前页脚上那个「蓝色怪东西」就是本脚本注入的空 <span class="footer-butterfly">，
// 仅靠 ::before/::after 两个 50% 圆角方块拼成，看起来像两片半圆而非蝴蝶。
//
// 现改为注入真正的结构：4 片翅膀（左右各前后翅）+ 身体 + 触角，
// 全部由 custom.css 的 .footer-butterfly 规则绘制。
// 真实页脚容器为 #footer .footer-other .footer-copyright .copyright。
// ======================================================
(function () {
  var WINGS = 4; // 左前翅 / 左后翅 / 右前翅 / 右后翅

  function addButterfly() {
    var footer = document.getElementById('footer');
    if (!footer) return;

    // 真实 DOM：.copyright 位于 #footer .footer-other .footer-copyright 内
    var cp =
      footer.querySelector('.footer-other .copyright') ||
      footer.querySelector('.copyright');
    if (!cp) return; // 页脚结构不存在则直接退出，不做无意义注入

    // pjax 无刷新换页会重建页脚，已存在则先移除旧节点再重建，避免重复
    var existing = cp.querySelector('.footer-butterfly');
    if (existing) existing.remove();

    var b = document.createElement('span');
    b.className = 'footer-butterfly';
    b.setAttribute('aria-hidden', 'true'); // 纯装饰，读屏器跳过
    for (var i = 0; i < WINGS; i++) {
      b.appendChild(document.createElement('i'));
    }
    cp.insertBefore(b, cp.firstChild);
  }

  if (document.readyState !== 'loading') addButterfly();
  else document.addEventListener('DOMContentLoaded', addButterfly);
  document.addEventListener('pjax:complete', function () { setTimeout(addButterfly, 300); });
})();
