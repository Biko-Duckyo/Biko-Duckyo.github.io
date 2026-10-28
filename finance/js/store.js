/* ============================================================
 *  数据存储 —— localStorage
 * ============================================================ */

const Store = {
  KEY_TX: 'finance_transactions',
  KEY_FUNDS: 'finance_funds',

  // 获取所有交易记录
  getTransactions() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_TX) || '[]');
    } catch (e) {
      return [];
    }
  },

  // 保存交易记录
  saveTransactions(txs) {
    localStorage.setItem(this.KEY_TX, JSON.stringify(txs));
  },

  // 添加一条交易
  addTransaction(tx) {
    const txs = this.getTransactions();
    tx.id = tx.id || this._genId();
    tx.createdAt = tx.createdAt || new Date().toISOString();
    txs.push(tx);
    this.saveTransactions(txs);
    return tx;
  },

  // 删除一条交易
  deleteTransaction(id) {
    const txs = this.getTransactions().filter(t => t.id !== id);
    this.saveTransactions(txs);
  },

  // 获取基金信息
  getFunds() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_FUNDS) || '{}');
    } catch (e) {
      return {};
    }
  },

  // 保存基金信息
  saveFund(code, info) {
    const funds = this.getFunds();
    funds[code] = { ...funds[code], ...info };
    localStorage.setItem(this.KEY_FUNDS, JSON.stringify(funds));
  },

  // 生成唯一 ID
  _genId() {
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // 计算持仓
  getHoldings() {
    const txs = this.getTransactions();
    const holdings = {};

    txs.forEach(tx => {
      const code = tx.fundCode;
      if (!holdings[code]) {
        holdings[code] = {
          code: code,
          name: tx.fundName,
          shares: 0,
          cost: 0,
          buyCount: 0,
          sellCount: 0
        };
      }

      if (tx.type === 'buy') {
        holdings[code].shares += tx.shares || (tx.amount / tx.nav);
        holdings[code].cost += tx.amount + (tx.fee || 0);
        holdings[code].buyCount++;
      } else if (tx.type === 'sell') {
        holdings[code].shares -= tx.shares || (tx.amount / tx.nav);
        holdings[code].cost -= tx.amount - (tx.fee || 0);
        holdings[code].sellCount++;
      } else if (tx.type === 'dividend') {
        // 分红：现金分红减少成本，再投资增加份额
        holdings[code].cost -= tx.amount;
      }
    });

    // 过滤掉持仓为 0 的
    return Object.values(holdings).filter(h => h.shares > 0.01);
  },

  // 计算总览统计
  getSummary() {
    const holdings = this.getHoldings();
    const funds = this.getFunds();

    let totalValue = 0;
    let totalCost = 0;

    holdings.forEach(h => {
      const fundInfo = funds[h.code] || {};
      const currentNav = fundInfo.currentNav || h.lastNav || 1;
      h.currentNav = currentNav;
      h.value = h.shares * currentNav;
      h.profit = h.value - h.cost;
      h.profitRate = h.cost > 0 ? (h.profit / h.cost) * 100 : 0;

      totalValue += h.value;
      totalCost += h.cost;
    });

    return {
      holdings: holdings,
      totalValue: totalValue,
      totalCost: totalCost,
      totalProfit: totalValue - totalCost,
      totalProfitRate: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      count: holdings.length
    };
  }
};
