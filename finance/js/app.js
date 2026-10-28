/* ============================================================
 *  主逻辑 —— 渲染、交互
 * ============================================================ */

(function () {
  'use strict';

  // 初始化
  function init() {
    renderAll();
    bindEvents();
  }

  // 渲染所有内容
  function renderAll() {
    renderSummary();
    renderHoldings();
    renderTransactions();
  }

  // 渲染总览统计
  function renderSummary() {
    const summary = Store.getSummary();

    document.getElementById('fin-total').textContent =
      `总资产: ¥${formatMoney(summary.totalValue)}`;

    document.getElementById('fin-stat-total').textContent =
      `¥${formatMoney(summary.totalValue)}`;

    const profitEl = document.getElementById('fin-stat-profit');
    profitEl.textContent = (summary.totalProfit >= 0 ? '+' : '') + `¥${formatMoney(summary.totalProfit)}`;
    profitEl.className = 'fin-stat-value fin-stat-profit ' + (summary.totalProfit >= 0 ? 'positive' : 'negative');

    const rateEl = document.getElementById('fin-stat-rate');
    rateEl.textContent = (summary.totalProfitRate >= 0 ? '+' : '') + summary.totalProfitRate.toFixed(2) + '%';
    rateEl.className = 'fin-stat-value fin-stat-profit ' + (summary.totalProfitRate >= 0 ? 'positive' : 'negative');

    document.getElementById('fin-stat-count').textContent = summary.count;
  }

  // 渲染持仓列表
  function renderHoldings() {
    const summary = Store.getSummary();
    const container = document.getElementById('fin-fund-list');

    if (summary.holdings.length === 0) {
      container.innerHTML = `
        <div class="fin-empty">
          <i class="fas fa-inbox"></i>
          <p>暂无持仓</p>
          <p class="fin-hint">点击右上角「添加交易」开始</p>
        </div>
      `;
      return;
    }

    container.innerHTML = summary.holdings.map(h => `
      <div class="fin-fund-item" data-code="${h.code}">
        <div class="fin-fund-item-name">${h.name}</div>
        <div class="fin-fund-item-code">${h.code}</div>
        <div class="fin-fund-item-meta">
          <span class="fin-fund-item-price">净值: ${h.currentNav.toFixed(4)}</span>
          <span class="fin-fund-item-profit ${h.profit >= 0 ? 'positive' : 'negative'}">
            ${h.profit >= 0 ? '+' : ''}${h.profitRate.toFixed(2)}%
          </span>
        </div>
      </div>
    `).join('');
  }

  // 渲染最近交易
  function renderTransactions() {
    const txs = Store.getTransactions().slice(-10).reverse();
    const container = document.getElementById('fin-tx-list');

    if (txs.length === 0) {
      container.innerHTML = `
        <div class="fin-empty">
          <p>暂无交易记录</p>
        </div>
      `;
      return;
    }

    container.innerHTML = txs.map(tx => `
      <div class="fin-tx-item">
        <div class="fin-tx-item-head">
          <span class="fin-tx-item-type ${tx.type}">${getTypeLabel(tx.type)}</span>
          <span class="fin-tx-item-date">${tx.date}</span>
        </div>
        <div class="fin-tx-item-name">${tx.fundName} (${tx.fundCode})</div>
        <div class="fin-tx-item-amount">¥${formatMoney(tx.amount)}</div>
      </div>
    `).join('');
  }

  // 绑定事件
  function bindEvents() {
    // 添加交易按钮
    document.getElementById('fin-add-btn').addEventListener('click', openModal);

    // 关闭弹层
    document.getElementById('fin-modal-close').addEventListener('click', closeModal);
    document.getElementById('fin-modal-cancel').addEventListener('click', closeModal);
    document.querySelector('.fin-modal-mask').addEventListener('click', closeModal);

    // 保存交易
    document.getElementById('fin-modal-save').addEventListener('click', saveTransaction);

    // 主题切换
    document.getElementById('fin-theme-toggle').addEventListener('click', toggleTheme);

    // 无障碍：焦点循环
    document.getElementById('fin-modal').addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || this.hidden) return;
      var focusables = this.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Esc 关闭弹层
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !document.getElementById('fin-modal').hidden) {
        closeModal();
      }
    });
  }

  // 打开弹层
  function openModal() {
    const modal = document.getElementById('fin-modal');
    modal.hidden = false;

    // 记住触发元素，关闭时焦点归还
    modal._trigger = document.activeElement;

    // 无障碍：背景加 inert
    const mainEl = document.getElementById('body-wrap') || document.body;
    if (mainEl && 'inert' in mainEl) mainEl.inert = true;

    // 默认日期为今天
    document.getElementById('fin-form-date').value = new Date().toISOString().split('T')[0];
  }

  // 关闭弹层
  function closeModal() {
    const modal = document.getElementById('fin-modal');
    modal.hidden = true;

    // 无障碍：移除背景 inert
    const mainEl = document.getElementById('body-wrap') || document.body;
    if (mainEl && 'inert' in mainEl) mainEl.inert = false;

    // 焦点归还
    if (modal._trigger && typeof modal._trigger.focus === 'function') {
      modal._trigger.focus();
    }
  }

  // 保存交易
  function saveTransaction() {
    const type = document.getElementById('fin-form-type').value;
    const code = document.getElementById('fin-form-code').value.trim();
    const name = document.getElementById('fin-form-name').value.trim();
    const date = document.getElementById('fin-form-date').value;
    const amount = parseFloat(document.getElementById('fin-form-amount').value);
    const nav = parseFloat(document.getElementById('fin-form-nav').value);
    const fee = parseFloat(document.getElementById('fin-form-fee').value) || 0;
    const note = document.getElementById('fin-form-note').value.trim();

    if (!code || !name || !date || !amount || !nav) {
      alert('请填写完整信息');
      return;
    }

    const tx = {
      type: type,
      fundCode: code,
      fundName: name,
      date: date,
      amount: amount,
      nav: nav,
      shares: amount / nav,
      fee: fee,
      note: note
    };

    Store.addTransaction(tx);
    Store.saveFund(code, { name: name, lastNav: nav });

    closeModal();
    renderAll();
  }

  // 切换主题
  function toggleTheme() {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const icon = document.querySelector('#fin-theme-toggle i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  // 工具函数：格式化金额
  function formatMoney(n) {
    return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // 工具函数：获取类型标签
  function getTypeLabel(type) {
    const map = {
      buy: '买入',
      sell: '卖出',
      dividend: '分红'
    };
    return map[type] || type;
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
