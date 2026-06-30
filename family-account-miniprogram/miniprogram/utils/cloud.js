const app = getApp()

function callCloud(name, data = {}) {
  return new Promise((resolve, reject) => {
    const globalData = app.globalData
    if (globalData.useMock) {
      resolve(mockCall(name, data))
      return
    }
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        if (res.result && res.result.success === false) {
          reject(new Error(res.result.message || '请求失败'))
        } else {
          resolve(res.result)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

function mockCall(name, data) {
  const mockData = app.getMockData()
  const { uuid } = require('./util.js')

  switch (name) {
    case 'login': {
      return {
        success: true,
        data: mockData.userInfo
      }
    }
    case 'getFamilyOverview': {
      return {
        success: true,
        data: {
          family: mockData.currentFamily,
          members: mockData.familyMembers
        }
      }
    }
    case 'addTransaction': {
      const newTx = {
        _id: 'tx_' + uuid().slice(0, 8),
        ...data,
        createdAt: new Date()
      }
      mockData.transactions.unshift(newTx)
      updateAccountBalance(mockData, data)
      app.saveMockData(mockData)
      updateBudgetSpent(mockData, data)
      return {
        success: true,
        data: newTx
      }
    }
    case 'deleteTransaction': {
      const idx = mockData.transactions.findIndex(t => t._id === data.id)
      if (idx > -1) {
        const tx = mockData.transactions[idx]
        mockData.transactions.splice(idx, 1)
        rollbackAccountBalance(mockData, tx)
        app.saveMockData(mockData)
      }
      return { success: true }
    }
    case 'getTransactionList': {
      let list = [...mockData.transactions]
      if (data.familyId) {
        list = list.filter(t => t.project || true)
      }
      if (data.type && data.type !== 'all') {
        list = list.filter(t => t.type === data.type)
      }
      if (data.categoryId) {
        list = list.filter(t => t.categoryId === data.categoryId)
      }
      if (data.startDate) {
        list = list.filter(t => t.date >= data.startDate)
      }
      if (data.endDate) {
        list = list.filter(t => t.date <= data.endDate)
      }
      list.sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''))
      return {
        success: true,
        data: {
          list,
          total: list.length
        }
      }
    }
    case 'getStatistics': {
      let list = [...mockData.transactions]
      if (data.startDate) list = list.filter(t => t.date >= data.startDate)
      if (data.endDate) list = list.filter(t => t.date <= data.endDate)
      if (data.type) list = list.filter(t => t.type === data.type)

      const catMap = {}
      let total = 0
      list.forEach(t => {
        if (!catMap[t.categoryId]) {
          const cat = mockData.categories.find(c => c._id === t.categoryId)
          catMap[t.categoryId] = {
            categoryId: t.categoryId,
            categoryName: t.categoryName || (cat && cat.name) || '其他',
            color: cat && cat.color || '#999',
            amount: 0
          }
        }
        catMap[t.categoryId].amount += t.amount
        total += t.amount
      })
      const categoryStats = Object.values(catMap).sort((a, b) => b.amount - a.amount)
      return {
        success: true,
        data: {
          total,
          categoryStats
        }
      }
    }
    case 'getBudgetDetail': {
      const budget = mockData.budget
      if (!budget) {
        return { success: true, data: null }
      }
      let totalSpent = 0
      budget.items.forEach(item => {
        totalSpent += item.spent
      })
      return {
        success: true,
        data: {
          ...budget,
          totalSpent,
          remaining: budget.totalAmount - totalSpent,
          percent: Math.min(Math.round((totalSpent / budget.totalAmount) * 1000) / 10, 100)
        }
      }
    }
    case 'setBudget': {
      mockData.budget = {
        _id: 'budget_' + uuid().slice(0, 8),
        familyId: mockData.currentFamilyId,
        ...data.budget,
        items: data.items.map((item, idx) => ({
          _id: 'bi_' + uuid().slice(0, 8),
          ...item,
          spent: 0,
          sort: idx + 1
        }))
      }
      app.saveMockData(mockData)
      return {
        success: true,
        data: mockData.budget
      }
    }
    case 'getScheduleList': {
      let list = [...mockData.schedules]
      if (data.month) {
        list = list.filter(s => s.date.startsWith(data.month))
      }
      list.sort((a, b) => a.date.localeCompare(b.date))
      return {
        success: true,
        data: list
      }
    }
    case 'addSchedule': {
      const newSch = {
        _id: 'sch_' + uuid().slice(0, 8),
        ...data,
        isCompleted: false,
        createdAt: new Date()
      }
      mockData.schedules.push(newSch)
      app.saveMockData(mockData)
      return {
        success: true,
        data: newSch
      }
    }
    case 'getAssetOverview': {
      let totalCost = 0
      let totalValue = 0
      let totalProfit = 0
      mockData.assets.forEach(a => {
        if (a.status === 'holding') {
          totalCost += a.cost
          totalValue += a.currentValue
          totalProfit += a.profit
        }
      })
      const totalBalance = mockData.accounts.reduce((sum, acc) => sum + acc.balance, 0)
      return {
        success: true,
        data: {
          totalAssets: totalValue + totalBalance,
          totalBalance,
          totalInvestValue: totalValue,
          totalInvestCost: totalCost,
          totalProfit,
          profitRate: totalCost ? Math.round((totalProfit / totalCost) * 1000) / 10 : 0,
          assets: mockData.assets,
          accounts: mockData.accounts
        }
      }
    }
    case 'getAIAdvice': {
      return {
        success: true,
        data: {
          advice: {
            consumption: {
              summary: '本月装修类支出占比过高，建议控制杂项支出',
              suggestions: [
                '设计与施工支出占比46.6%，属装修期正常投入',
                '日常餐饮交通支出合理，继续保持',
                '建议对"其他"类支出做明细记录，便于后续分析'
              ]
            },
            budget: {
              summary: '装修总预算执行46.6%，整体可控',
              suggestions: [
                '设计与施工已用90.6%，接近预算上限，需关注后续付款',
                '主材类仅用11.6%，可适当调低预算分配',
                '建议预留10%应急资金应对超支风险'
              ]
            },
            investment: {
              summary: '投资组合整体盈利，股票持仓需关注',
              suggestions: [
                '沪深300基金收益4.6%表现良好，可继续持有',
                '股票持仓亏损5%，建议设定止损线',
                '定期存款占比偏高，可考虑适当增加权益类配置'
              ]
            },
            bills: {
              summary: '近期有2笔大额账单需关注',
              suggestions: [
                '7月5日信用卡还款3000元，提前准备资金',
                '7月10日水电费200元，建议设置自动缴费',
                '7月15日装修验收，需预留验收相关费用'
              ]
            }
          },
          financialData: {
            period: '2026-06-01 ~ 2026-06-30',
            summary: {
              monthExpense: 7622800,
              monthIncome: 1500000,
              balance: -6122800,
              transactionCount: 10
            }
          }
        }
      }
    }
    default:
      return { success: true, data: null }
  }
}

function updateAccountBalance(mockData, tx) {
  const acc = mockData.accounts.find(a => a._id === tx.accountId)
  if (!acc) return
  if (tx.type === 'expense') {
    acc.balance -= tx.amount
  } else if (tx.type === 'income') {
    acc.balance += tx.amount
  } else if (tx.type === 'transfer') {
    acc.balance -= tx.amount
    const toAcc = mockData.accounts.find(a => a._id === tx.toAccountId)
    if (toAcc) toAcc.balance += tx.amount
  }
}

function rollbackAccountBalance(mockData, tx) {
  const acc = mockData.accounts.find(a => a._id === tx.accountId)
  if (!acc) return
  if (tx.type === 'expense') {
    acc.balance += tx.amount
  } else if (tx.type === 'income') {
    acc.balance -= tx.amount
  } else if (tx.type === 'transfer') {
    acc.balance += tx.amount
    const toAcc = mockData.accounts.find(a => a._id === tx.toAccountId)
    if (toAcc) toAcc.balance -= tx.amount
  }
}

function updateBudgetSpent(mockData, tx) {
  const budget = mockData.budget
  if (!budget || !budget.items || tx.type !== 'expense') return
  const item = budget.items.find(i => i.categoryId === tx.categoryId)
  if (item) {
    item.spent += tx.amount
  }
  app.saveMockData(mockData)
}

module.exports = {
  callCloud
}
