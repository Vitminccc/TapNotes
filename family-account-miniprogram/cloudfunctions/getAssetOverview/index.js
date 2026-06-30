const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { familyId } = event

  try {
    const accRes = await db.collection('accounts').where({ familyId })
      .orderBy('sort', 'asc').get()
    const accounts = accRes.data

    const assetsRes = await db.collection('assets').where({
      familyId,
      status: 'holding'
    }).get()
    const assets = assetsRes.data

    let totalBalance = 0
    let totalInvestCost = 0
    let totalInvestValue = 0
    let totalProfit = 0

    for (const acc of accounts) {
      totalBalance += acc.balance
    }

    for (const ast of assets) {
      totalInvestCost += ast.cost
      totalInvestValue += ast.currentValue
      totalProfit += ast.profit
    }

    const profitRate = totalInvestCost > 0
      ? Math.round((totalProfit / totalInvestCost) * 1000) / 10
      : 0

    return {
      success: true,
      data: {
        totalAssets: totalBalance + totalInvestValue,
        totalBalance,
        totalInvestValue,
        totalInvestCost,
        totalProfit,
        profitRate,
        accounts,
        assets
      }
    }
  } catch (err) {
    return {
      success: false,
      message: err.message
    }
  }
}
