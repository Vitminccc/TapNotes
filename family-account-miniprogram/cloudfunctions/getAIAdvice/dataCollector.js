/**
 * 数据采集与提示词构建模块
 * 从云数据库采集家庭财务数据，构建供 LLM 分析的提示词
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const SYSTEM_PROMPT = `你是一位专业的家庭财务顾问AI助手。请根据用户提供的家庭财务数据，从以下四个维度给出专业、简洁、可操作的建议：

1. 消费分析：分析家庭支出结构，识别异常或偏高消费，提供节省建议
2. 预算优化：对比预算执行情况，给出预算调整建议
3. 理财建议：基于资产配置情况，提供投资优化方向
4. 账单提醒：分析即将到期的账单和日程，提供资金规划提醒

输出要求：
- 使用JSON格式输出，字段为 consumption、budget、investment、bills
- 每个字段包含 summary（一句话总结）和 suggestions（字符串数组，每条建议一句话）
- 语言简洁专业，每条建议控制在50字以内
- 金额单位为元，请将分转换为元`

/**
 * 采集家庭财务数据
 * @param {string} familyId - 家庭ID
 * @returns {Promise<object>} 整理后的财务数据
 */
async function gatherFinancialData(familyId) {
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const [txRes, budgetRes, accRes, assetRes, scheduleRes] = await Promise.all([
    db.collection('transactions').where({
      familyId,
      date: _.gte(monthStart)
    }).orderBy('date', 'desc').limit(100).get(),

    db.collection('budgets').where({ familyId }).limit(5).get(),

    db.collection('accounts').where({ familyId }).orderBy('sort', 'asc').get(),

    db.collection('assets').where({ familyId, status: 'holding' }).get(),

    db.collection('schedules').where({
      familyId,
      date: _.gte(today)
    }).orderBy('date', 'asc').limit(20).get()
  ])

  const transactions = txRes.data
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const categoryStats = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const key = t.categoryName || '其他'
    if (!categoryStats[key]) categoryStats[key] = 0
    categoryStats[key] += t.amount
  })

  const accounts = accRes.data.map(a => ({
    name: a.name,
    type: a.type,
    balance: a.balance
  }))

  const assets = assetRes.data.map(a => ({
    name: a.name,
    type: a.type,
    cost: a.cost,
    currentValue: a.currentValue,
    profit: a.profit,
    profitRate: a.profitRate
  }))

  const schedules = scheduleRes.data.map(s => ({
    title: s.title,
    type: s.type,
    date: s.date,
    amount: s.amount || 0
  }))

  const budgets = budgetRes.data.map(b => ({
    name: b.name,
    totalAmount: b.totalAmount,
    startDate: b.startDate,
    endDate: b.endDate
  }))

  return {
    period: `${monthStart} ~ ${today}`,
    summary: {
      monthExpense: totalExpense,
      monthIncome: totalIncome,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length
    },
    categoryStats,
    accounts,
    assets,
    schedules,
    budgets
  }
}

/**
 * 构建用户数据提示词
 * @param {object} data - 财务数据
 * @returns {string} 格式化的提示词
 */
function buildUserPrompt(data) {
  const fenToYuan = (fen) => (fen / 100).toFixed(2)

  const categoryLines = Object.entries(data.categoryStats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => `  - ${name}: ${fenToYuan(amount)}元`)
    .join('\n')

  const accountLines = data.accounts
    .map(a => `  - ${a.name}(${a.type}): ${fenToYuan(a.balance)}元`)
    .join('\n')

  const assetLines = data.assets
    .map(a => `  - ${a.name}(${a.type}): 成本${fenToYuan(a.cost)}元, 现值${fenToYuan(a.currentValue)}元, 收益${fenToYuan(a.profit)}元(${a.profitRate}%)`)
    .join('\n')

  const scheduleLines = data.schedules
    .map(s => `  - ${s.title}(${s.type}): ${s.date}${s.amount ? ', 金额' + fenToYuan(s.amount) + '元' : ''}`)
    .join('\n')

  const budgetLines = data.budgets
    .map(b => `  - ${b.name}: 总预算${fenToYuan(b.totalAmount)}元, 周期${b.startDate}~${b.endDate}`)
    .join('\n')

  return `以下是家庭财务数据（金额单位为分，请转换为元分析）：

统计周期: ${data.period}

收支概况:
  - 本月收入: ${fenToYuan(data.summary.monthIncome)}元
  - 本月支出: ${fenToYuan(data.summary.monthExpense)}元
  - 本月结余: ${fenToYuan(data.summary.balance)}元
  - 交易笔数: ${data.summary.transactionCount}笔

支出分类统计:
${categoryLines || '  暂无数据'}

账户列表:
${accountLines || '  暂无数据'}

投资资产:
${assetLines || '  暂无数据'}

预算信息:
${budgetLines || '  暂无数据'}

近期日程/账单:
${scheduleLines || '  暂无数据'}

请分析以上数据并给出JSON格式的建议。`
}

module.exports = { gatherFinancialData, buildUserPrompt, SYSTEM_PROMPT }
