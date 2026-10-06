// ======================================================
// fixed_card_widget.js
// 参考 https://akilar.top/posts/451ac5f8/ 实现
// 手机端左侧边缘悬浮按钮，点击居中弹出侧栏卡片
// ======================================================

// 固定卡片点击动作
function FixedCardWidget(type, name, index) {
  if (type === "id") {
    var tempcard = document.getElementById(name);
  } else {
    var tempcard = document.getElementsByClassName(name)[index];
  }
  if (tempcard) {
    if (tempcard.className.indexOf('fixed-card-widget') > -1) {
      RemoveFixedCardWidget();
    } else {
      RemoveFixedCardWidget();
      CreateQuitBox();
      tempcard.classList.add('fixed-card-widget');
    }
  }
}

// 创建遮罩层
function CreateQuitBox() {
  var quitBox = '<div id="quit-box" onclick="RemoveFixedCardWidget()"></div>';
  var asideContent = document.getElementById('aside-content');
  if (asideContent) {
    asideContent.insertAdjacentHTML("beforebegin", quitBox);
  } else {
    document.body.insertAdjacentHTML("beforeend", quitBox);
  }
}

// 移除卡片
function RemoveFixedCardWidget() {
  var activedItems = document.querySelectorAll('.fixed-card-widget');
  if (activedItems) {
    for (var i = 0; i < activedItems.length; i++) {
      activedItems[i].classList.remove('fixed-card-widget');
    }
  }
  var quitBox = document.getElementById('quit-box');
  if (quitBox) quitBox.remove();
}

// 注入悬浮按钮组 HTML
function injectFixedCardDashboard() {
  if (document.getElementById('fixedcard-dashboard')) return;
  var html = '<div id="fixedcard-dashboard">';
  // 作者卡片
  html += '<button class="fixedcard-activebtn" type="button" title="用户信息" onclick="FixedCardWidget(\'class\',\'card-info\',\'0\')"><i class="fas fa-address-book"></i></button>';
  // 电子钟
  html += '<button class="fixedcard-activebtn" type="button" title="电子钟" onclick="FixedCardWidget(\'class\',\'card-clock\',\'0\')"><i class="fas fa-clock"></i></button>';
  // 标签卡片
  html += '<button class="fixedcard-activebtn" type="button" title="标签" onclick="FixedCardWidget(\'class\',\'card-tags\',\'0\')"><i class="fas fa-tags"></i></button>';
  // 分类卡片
  html += '<button class="fixedcard-activebtn" type="button" title="分类" onclick="FixedCardWidget(\'class\',\'card-categories\',\'0\')"><i class="fas fa-folder-open"></i></button>';
  // 网站信息
  html += '<button class="fixedcard-activebtn" type="button" title="网站信息" onclick="FixedCardWidget(\'class\',\'card-webinfo\',\'0\')"><i class="fas fa-chart-line"></i></button>';
  html += '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// 初始化
function initFixedCardWidget() {
  RemoveFixedCardWidget();
  injectFixedCardDashboard();
}

if (document.readyState !== 'loading') {
  initFixedCardWidget();
} else {
  document.addEventListener('DOMContentLoaded', initFixedCardWidget);
}
document.addEventListener('pjax:complete', function () {
  setTimeout(initFixedCardWidget, 300);
});
