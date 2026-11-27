/* ============================================================
 * P3 观察建议与风险提醒 · 前端纯函数镜像（与 tools/finance/advisory-core.mjs 同源口径）
 * ------------------------------------------------------------
 * 本轮仅 observation / risk 只读输出；adjust 模板默认关闭，不调仓不下单。
 * 缺数据、阈值未配置只给通用提示或"规则尚未启用"，不生成虚假触发。
 * ============================================================ */
window.FinanceAdvisory = (function () {
  'use strict'

  var ADVISORY_VERSION = 'advisory-v1'
  var DEFAULTS = { concentrationPct: 20, drawdownWarnPct: -15, lowCoveragePct: 50 }

  function profileConfig (profile) {
    var p = profile || {}
    return {
      horizon: p.horizon || null,
      drawdownTolerance: Number.isFinite(Number(p.drawdownTolerance)) ? Number(p.drawdownTolerance) : null,
      liquidityNeed: p.liquidityNeed || null,
      targetWeight: Number.isFinite(Number(p.targetWeight)) ? Number(p.targetWeight) : null,
      positionCap: Number.isFinite(Number(p.positionCap)) ? Number(p.positionCap) : null
    }
  }

  function evidence (field, value, date) {
    return { field: field, value: Number.isFinite(Number(value)) ? Number(value) : (value == null ? null : value), date: date || null }
  }

  function insufficient (row, reason) {
    return [{
      kind: 'observation', type: 'data-insufficient', enabled: false, insufficientData: true,
      rule: 'insufficient-data', trigger: null, dataTime: row.navDate || null,
      basis: reason, risk: '关键数据缺失，无法形成有效观察结论；勿据此操作。',
      reverse: '补齐净值、披露持仓与行情时间后重新评估。',
      invalidation: '数据恢复可读且口径完整后本提示失效。',
      evidence: [evidence('navDate', row.navDate), evidence('priced', row.priced)],
      message: '资料待核对，暂不形成判断。'
    }]
  }

  function evaluateAdvisory (row, ctx) {
    ctx = ctx || {}
    if (!row || !row.code) return []
    var cfg = profileConfig(ctx.profile)
    var defaults = Object.assign({}, DEFAULTS, ctx.defaults)
    var weight = Number(ctx.weight) || 0
    var out = []

    if (!row.priced || row.profitRate == null) return insufficient(row, '净值或盈亏口径不完整。')

    if (row.freshness === 'stale' || row.freshness === 'unknown' || !row.navDate) {
      out.push({
        kind: 'risk', type: 'stale-nav', enabled: true, rule: 'stale-nav',
        trigger: '净值日期缺失或超过 7 天未更新', dataTime: row.navDate || null,
        basis: '净值新鲜度 = ' + String(row.freshness),
        risk: '陈旧净值可能高估或低估当前市值，盈亏与估算参考均需打折看待。',
        reverse: '净值更新到最近交易日且口径匹配后，本风险提示解除。',
        invalidation: '连续两个可读交易日净值日期匹配行情区间后失效。',
        evidence: [evidence('navDate', row.navDate), evidence('freshness', row.freshness)],
        message: '净值资料待核对，先看数据有效性。'
      })
    }

    var cap = cfg.positionCap != null ? cfg.positionCap : defaults.concentrationPct
    if (ctx.complete === false) {
      out.push({
        kind: 'observation', type: 'incomplete-weights', enabled: false, rule: 'incomplete-weights',
        trigger: '组合存在未计价持仓，权重分母不完整，集中度暂不判定',
        dataTime: ctx.asOf || null,
        basis: '占比需按完整可计价市值合计计算；缺净值/缺行情的持仓未计入分母。',
        risk: '残缺权重可能高估或低估单只占比，勿据此调仓。',
        reverse: '持仓净值与行情补齐、组合口径完整后重新计算占比。',
        invalidation: '全部持仓可计价且权重合计口径闭合后失效。',
        evidence: [evidence('weightPct', weight), evidence('complete', false)],
        message: '组合口径不完整，集中度先不下结论。'
      })
    } else if (Number.isFinite(weight) && weight > cap) {
      out.push({
        kind: 'risk', type: 'concentration', enabled: true, rule: 'concentration',
        trigger: '单只占组合 ' + weight.toFixed(1) + '%，超过提醒线 ' + cap + '%',
        dataTime: ctx.asOf || null,
        basis: '组合占比按已公布市值合计计算；提醒线 ' + cap + (cfg.positionCap != null ? '（个人仓位约束）' : '（默认）') + '。',
        risk: '单一标的波动对组合影响放大；若与个人期限、资金需求不匹配，需关注流动性。',
        reverse: '占比回落至提醒线以内，或组合其余持仓补入后权重被稀释。',
        invalidation: '权重持续低于提醒线且无新增同向加仓时失效。',
        evidence: [evidence('weightPct', weight), evidence('value', row.value), evidence('cap', cap)],
        message: '集中度偏高，留意单一标的波动。'
      })
    }

    var tolerance = cfg.drawdownTolerance != null ? cfg.drawdownTolerance : defaults.drawdownWarnPct
    if (Number.isFinite(row.profitRate) && row.profitRate < tolerance) {
      out.push({
        kind: 'risk', type: 'floating-loss', enabled: true, rule: 'floating-loss',
        trigger: '账面浮动盈亏 ' + row.profitRate.toFixed(2) + '%，低于提醒线 ' + tolerance + '%',
        dataTime: row.navDate || null,
        basis: '账面浮动盈亏按已公布净值与持仓成本计算；非已实现盈亏，亦非峰值回撤；提醒线 ' +
          (cfg.drawdownTolerance != null ? '来自个人条件' : '为默认提醒值，未设个人回撤承受') + '。',
        risk: '浮亏不代表必须止损；需结合持有期限、仓位与披露持仓判断，避免情绪化操作。',
        reverse: '净值回升使浮动盈亏回到提醒线以上，或持仓成本经实际申购赎回调整后重算。',
        invalidation: '浮动盈亏持续高于提醒线，或个人条件更新后按新阈值重评。',
        evidence: [evidence('profitRate', row.profitRate), evidence('tolerance', tolerance), evidence('cost', row.cost)],
        message: '账面浮亏超过提醒线，核对持有逻辑后再决策。'
      })
    }
    var drawdownPct = Number(row.drawdownPct)
    if (Number.isFinite(drawdownPct) && drawdownPct > Math.abs(tolerance)) {
      out.push({
        kind: 'risk', type: 'drawdown', enabled: true, rule: 'drawdown',
        trigger: '组合自峰值回落 ' + drawdownPct.toFixed(2) + '%，超过可承受回撤 ' + Math.abs(tolerance) + '%',
        dataTime: ctx.asOf || null,
        basis: '回撤按组合峰值权益到当前权益的回落幅度计算，需峰值口径齐全；与单只账面浮亏分开判定。',
        risk: '回撤提示组合层面的阶段性回落，不等于单只标的必须卖出。',
        reverse: '权益修复至峰值附近、回撤收窄到可承受线以内后解除。',
        invalidation: '峰值口径更新或回撤持续低于可承受线后重评。',
        evidence: [evidence('drawdownPct', drawdownPct), evidence('tolerance', tolerance)],
        message: '组合回撤超过提醒线，先核对峰值与仓位结构。'
      })
    }

    var eh = row.estHold
    var lowCoverage = eh && Number.isFinite(eh.hitWeight) && eh.hitWeight < defaults.lowCoveragePct
    if (row.estNavBlocked || row.quoteStale || lowCoverage) {
      var reason = row.estBlockReason || (row.quoteStale ? 'quote-stale' : (lowCoverage ? 'low-coverage' : 'blocked'))
      out.push({
        kind: 'observation', type: 'estimate-weak', enabled: true, rule: 'estimate-weak',
        trigger: '盘中估算不可用或为弱参考（' + reason + '）',
        dataTime: row.estQuoteTime || row.estQuoteStart || null,
        basis: row.estNavBlocked
          ? '基准日与行情区间未匹配或行情陈旧，估算净值 / 市值 / 当日盈亏已阻断。'
          : '行情命中权重 ' + (eh && eh.hitWeight != null ? eh.hitWeight : '未知') + '%，披露覆盖偏低，推算噪声较大。',
        risk: '弱参考估算不能替代官方净值；未命中项按零贡献，不代表其实际零涨跌。',
        reverse: '披露持仓更新、行情时间匹配且覆盖度回升后，估算参考性增强。',
        invalidation: '估算被阻断或低覆盖状态解除后，本观察项失效。',
        evidence: [
          evidence('estBlockReason', row.estBlockReason),
          evidence('hitWeight', eh ? eh.hitWeight : null),
          evidence('quoteTime', row.estQuoteTime)
        ],
        message: '盘中估算仅作弱参考，别当净值结论。'
      })
    }

    if (cfg.targetWeight != null) {
      out.push({
        kind: 'adjust-draft', type: 'adjust-template', enabled: false, rule: 'adjust-template',
        trigger: '目标配比 ' + cfg.targetWeight + '% 与当前占比 ' + weight.toFixed(1) + '% 存在差异（模板未启用）',
        dataTime: ctx.asOf || null,
        basis: '仅记录个人目标配比与当前权重的差值；未配置调整规则与执行闸门。',
        risk: '调整模板默认关闭：不会自动调仓或下单；启用前需单独确认规则、阈值与风控。',
        reverse: '当前权重达到目标配比，或个人目标配比更新。',
        invalidation: '模板保持关闭；任何调整动作都须经人工确认与单独验收。',
        evidence: [evidence('targetWeight', cfg.targetWeight), evidence('weightPct', weight)],
        message: '配比差异已记录，调整规则尚未启用。'
      })
    }

    return out
  }

  function summarizeAdvisory (rows, ctx) {
    ctx = ctx || {}
    var lists = rows.map(function (r) {
      return evaluateAdvisory(r, Object.assign({}, ctx, { weight: ctx.weightOf ? ctx.weightOf(r) : 0 }))
    })
    var all = lists.reduce(function (a, b) { return a.concat(b) }, [])
    return {
      version: ADVISORY_VERSION,
      risks: all.filter(function (a) { return a.kind === 'risk' && a.enabled }),
      observations: all.filter(function (a) { return a.kind === 'observation' && a.enabled }),
      drafts: all.filter(function (a) { return a.kind === 'adjust-draft' }),
      insufficient: all.filter(function (a) { return a.insufficientData })
    }
  }

  return { evaluateAdvisory: evaluateAdvisory, summarizeAdvisory: summarizeAdvisory, DEFAULTS: DEFAULTS, version: ADVISORY_VERSION }
})()
